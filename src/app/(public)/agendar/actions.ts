"use server"

import { z } from "zod"
import { hasSupabase } from "@/lib/data"
import { sendConfirmationEmail } from "@/lib/email"

/** Horários livres para a soma das durações dos serviços escolhidos. */
export async function getSlots(professionalId: string, date: string, durationMin: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || durationMin <= 0) return []
  if (!hasSupabase) return []

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_slots_for_duration", {
    p_professional: professionalId,
    p_date: date,
    p_duration: durationMin,
  })
  if (error) throw new Error(error.message)
  return (data as string[]).map((s) => new Date(s).toISOString())
}

const bookingSchema = z.object({
  serviceIds: z.array(z.string().min(1)).min(1, "Escolha pelo menos um serviço"),
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

  if (!hasSupabase) return { ok: false, error: "Agenda indisponível no momento." }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("book_appointment_multi", {
    p_services: v.serviceIds,
    p_professional: v.professionalId,
    p_starts_at: v.startsAt,
    p_name: v.name,
    p_phone: v.phone,
    p_email: v.email,
    p_notes: v.notes || null,
  })
  if (error) return { ok: false, error: error.message }

  const [{ data: chosen }, { data: pro }, { data: settings }] = await Promise.all([
    supabase.from("services").select("name, price, duration_min").in("id", v.serviceIds).order("sort"),
    supabase.from("professionals").select("name").eq("id", v.professionalId).single(),
    supabase.from("settings").select("*").eq("id", 1).single(),
  ])
  if (chosen?.length && pro && settings) await notify(data as string, v, chosen, pro.name, settings)
  return { ok: true, id: data as string }
}

async function notify(
  id: string,
  v: BookingInput,
  chosen: { name: string; price: number; duration_min: number }[],
  professionalName: string,
  settings: { business_name: string; address: string | null; whatsapp: string | null }
) {
  const start = new Date(v.startsAt)
  const label = chosen.map((s) => s.name).join(" + ")
  const minutes = chosen.reduce((t, s) => t + s.duration_min, 0)
  const price = chosen.reduce((t, s) => t + Number(s.price), 0)
  try {
    await sendConfirmationEmail({
      to: v.email,
      clientName: v.name,
      serviceName: label,
      professionalName,
      price,
      whatsapp: settings.whatsapp,
      event: {
        id,
        title: `${label} · ${settings.business_name}`,
        description: `Atendimento com ${professionalName}.`,
        location: settings.address ?? "",
        start,
        end: new Date(start.getTime() + minutes * 60_000),
      },
    })
  } catch (e) {
    // o agendamento já foi salvo; falha no e-mail não deve bloquear a cliente
    console.error("Falha ao enviar confirmação", e)
  }
}

const lookupSchema = z.object({
  email: z.email("E-mail inválido"),
  phone: z.string().trim().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, "Telefone inválido"),
})

/** Serviços do último atendimento da cliente (por e-mail + telefone). */
export async function findLastBooking(
  input: z.input<typeof lookupSchema>
): Promise<{ ok: true; name: string; serviceIds: string[] } | { ok: false; error: string }> {
  const parsed = lookupSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const v = parsed.data

  if (!hasSupabase) return { ok: false, error: "Agenda indisponível no momento." }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("last_booking", { p_email: v.email, p_phone: v.phone })
  if (error) return { ok: false, error: error.message }
  const row = (data as { client_name: string; service_ids: string[] | null }[])[0]
  if (!row?.service_ids?.length) return { ok: false, error: "Não encontramos atendimentos com esse e-mail e telefone." }
  return { ok: true, name: row.client_name, serviceIds: row.service_ids }
}
