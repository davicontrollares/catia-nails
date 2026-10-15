"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasSupabase } from "@/lib/data"

type Result = { ok: true } | { ok: false; error: string }

async function owner() {
  if (!hasSupabase) throw new Error("Supabase não configurado.")
  const { getSessionProfile } = await import("@/lib/supabase/server")
  const { supabase, profile } = await getSessionProfile()
  if (profile?.role !== "owner") throw new Error("Acesso negado")
  return supabase
}

async function run(fn: () => Promise<{ error: { message: string } | null } | void>): Promise<Result> {
  try {
    const res = await fn()
    if (res && res.error) return { ok: false, error: res.error.message }
    revalidatePath("/admin", "layout")
    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro inesperado" }
  }
}

// ------------------------------------------------------------- serviços
const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().min(1),
  duration_min: z.coerce.number().int().min(5),
  price: z.coerce.number().min(0),
  active: z.boolean(),
})

export async function saveService(input: z.input<typeof serviceSchema>) {
  return run(async () => {
    const v = serviceSchema.parse(input)
    const supabase = await owner()
    const { id, ...row } = v
    if (id) return supabase.from("services").update(row).eq("id", id)
    const ins = await supabase.from("services").insert(row).select("id").single()
    if (ins.error) return ins
    // novo serviço já fica disponível para todas as profissionais
    const { data: pros } = await supabase.from("professionals").select("id")
    return supabase.from("professional_services").insert((pros ?? []).map((p) => ({ professional_id: p.id, service_id: ins.data.id })))
  })
}

export async function deleteService(id: string) {
  // desativa em vez de apagar para preservar o histórico de agendamentos
  return run(async () => (await owner()).from("services").update({ active: false }).eq("id", id))
}

// ------------------------------------------------------------- agenda
const statusSchema = z.object({
  id: z.string(),
  status: z.enum(["confirmed", "completed", "cancelled", "no_show"]),
  payment_method: z.enum(["pix", "cash", "credit", "debit"]).nullable().optional(),
})

export async function setAppointmentStatus(input: z.input<typeof statusSchema>) {
  return run(async () => {
    const { id, ...row } = statusSchema.parse(input)
    return (await owner()).from("appointments").update(row).eq("id", id)
  })
}

const manualSchema = z.object({
  service_id: z.string(),
  professional_id: z.string(),
  starts_at: z.iso.datetime({ offset: true }),
  client_name: z.string().trim().min(2),
  client_phone: z.string().trim().min(8),
})

export async function createManualAppointment(input: z.input<typeof manualSchema>) {
  return run(async () => {
    const v = manualSchema.parse(input)
    const supabase = await owner()
    const { data: svc } = await supabase.from("services").select("duration_min, price").eq("id", v.service_id).single()
    if (!svc) throw new Error("Serviço não encontrado")
    const start = new Date(v.starts_at)
    const res = await supabase.from("appointments").insert({
      ...v,
      ends_at: new Date(start.getTime() + svc.duration_min * 60_000).toISOString(),
      price: svc.price,
    })
    if (res.error?.message.includes("no_overlap")) throw new Error("Já existe um atendimento nesse horário.")
    return res
  })
}

// ------------------------------------------------------------- disponibilidade
const hoursSchema = z.array(
  z.object({ weekday: z.number().int().min(0).max(6), start_time: z.string(), end_time: z.string() })
)

export async function saveWorkingHours(professionalId: string, rows: z.input<typeof hoursSchema>) {
  return run(async () => {
    const v = hoursSchema.parse(rows)
    if (v.some((r) => r.end_time <= r.start_time)) throw new Error("Horário final deve ser depois do inicial.")
    const supabase = await owner()
    const del = await supabase.from("working_hours").delete().eq("professional_id", professionalId)
    if (del.error) return del
    if (!v.length) return
    return supabase.from("working_hours").insert(v.map((r) => ({ ...r, professional_id: professionalId })))
  })
}

const offSchema = z.object({
  professional_id: z.string(),
  starts_at: z.iso.datetime({ offset: true }),
  ends_at: z.iso.datetime({ offset: true }),
  reason: z.string().trim().optional(),
})

export async function addTimeOff(input: z.input<typeof offSchema>) {
  return run(async () => (await owner()).from("time_off").insert(offSchema.parse(input)))
}

export async function removeTimeOff(id: string) {
  return run(async () => (await owner()).from("time_off").delete().eq("id", id))
}

// ------------------------------------------------------------- finanças
const expenseSchema = z.object({
  category: z.string().trim().min(1),
  description: z.string().trim().optional(),
  amount: z.coerce.number().positive(),
  spent_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function addExpense(input: z.input<typeof expenseSchema>) {
  return run(async () => (await owner()).from("expenses").insert(expenseSchema.parse(input)))
}

export async function removeExpense(id: string) {
  return run(async () => (await owner()).from("expenses").delete().eq("id", id))
}

// ------------------------------------------------------------- configurações
const settingsSchema = z.object({
  business_name: z.string().trim().min(2),
  tagline: z.string().trim().optional(),
  address: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  min_notice_hours: z.coerce.number().int().min(0),
  max_days_ahead: z.coerce.number().int().min(1),
  cancel_notice_hours: z.coerce.number().int().min(0),
  slot_step_min: z.coerce.number().int().min(5),
})

export async function saveSettings(input: z.input<typeof settingsSchema>) {
  return run(async () => (await owner()).from("settings").update(settingsSchema.parse(input)).eq("id", 1))
}
