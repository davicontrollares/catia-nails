"use server"

import { z } from "zod"
import { DEMO_PROFESSIONAL, DEMO_SERVICES, DEMO_SETTINGS, hasSupabase } from "@/lib/data"
import { sendConfirmationEmail } from "@/lib/email"

// Fuso de São Paulo é UTC-3 fixo (sem horário de verão desde 2019).
const toUtc = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00-03:00`)

function demoSlots(date: string, durationMin: number) {
  const weekday = toUtc(date, "12:00").getUTCDay()
  if (weekday < 2) return [] // domingo e segunda fechado
  const out: string[] = []
  for (const [start, end] of [["08:00", "12:00"], ["13:00", "18:00"]]) {
    let t = toUtc(date, start).getTime()
    const stop = toUtc(date, end).getTime()
    while (t + durationMin * 60_000 <= stop) {
      if (t > Date.now() + 2 * 3600_000) out.push(new Date(t).toISOString())
      t += 30 * 60_000
    }
  }
  return out
}

export async function getSlots(serviceId: string, professionalId: string, date: string, durationMin: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
  if (!hasSupabase) return demoSlots(date, durationMin)

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_service: serviceId,
    p_professional: professionalId,
    p_date: date,
  })
  if (error) throw new Error(error.message)
  return (data as string[]).map((s) => new Date(s).toISOString())
}

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  professionalId: z.string().min(1),
  startsAt: z.iso.datetime(),
  name: z.string().trim().min(2, "Informe seu nome"),
  email: z.email("E-mail inválido"),
  phone: z.string().trim().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, "Telefone inválido"),
  notes: z.string().trim().max(500).optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>

export async function bookAppointment(input: BookingInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const v = parsed.data
  if (!hasSupabase) {
    const svc = DEMO_SERVICES.find((x) => x.id === v.serviceId)
    if (svc) await notify("demo", v, svc.name, Number(svc.price), svc.duration_min, DEMO_PROFESSIONAL.name, DEMO_SETTINGS)
    return { ok: true, id: "demo" }
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("book_appointment", {
    p_service: v.serviceId,
    p_professional: v.professionalId,
    p_starts_at: v.startsAt,
    p_name: v.name,
    p_phone: v.phone,
    p_notes: v.notes || null,
    p_email: v.email,
  })
  if (error) return { ok: false, error: error.message }

  const [{ data: svc }, { data: pro }, { data: settings }] = await Promise.all([
    supabase.from("services").select("name, price, duration_min").eq("id", v.serviceId).single(),
    supabase.from("professionals").select("name").eq("id", v.professionalId).single(),
    supabase.from("settings").select("*").eq("id", 1).single(),
  ])
  if (svc && pro && settings) await notify(data as string, v, svc.name, Number(svc.price), svc.duration_min, pro.name, settings)
  return { ok: true, id: data as string }
}

async function notify(
  id: string,
  v: BookingInput,
  serviceName: string,
  price: number,
  durationMin: number,
  professionalName: string,
  settings: { business_name: string; address: string | null; whatsapp: string | null }
) {
  const start = new Date(v.startsAt)
  try {
    await sendConfirmationEmail({
      to: v.email,
      clientName: v.name,
      serviceName,
      professionalName,
      price,
      whatsapp: settings.whatsapp,
      event: {
        id,
        title: `${serviceName} · ${settings.business_name}`,
        description: `Atendimento com ${professionalName}.`,
        location: settings.address ?? "",
        start,
        end: new Date(start.getTime() + durationMin * 60_000),
      },
    })
  } catch (e) {
    // o agendamento já foi salvo; falha no e-mail não deve bloquear a cliente
    console.error("Falha ao enviar confirmação", e)
  }
}
