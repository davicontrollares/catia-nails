import { FALLBACK_SETTINGS, hasSupabase } from "./data"
import type { Appointment, Expense, Professional, Service, Settings, TimeOff, WorkingHour } from "./types"

export type AdminData = {
  configured: boolean
  settings: Settings
  services: Service[]
  professionals: Professional[]
  appointments: Appointment[]
  expenses: Expense[]
  workingHours: WorkingHour[]
  timeOff: TimeOff[]
}

/** Carrega tudo que o painel usa num intervalo de datas. */
export async function getAdminData(from: Date, to: Date): Promise<AdminData> {
  if (!hasSupabase) {
    return { configured: false, settings: FALLBACK_SETTINGS, services: [], professionals: [], appointments: [], expenses: [], workingHours: [], timeOff: [] }
  }

  const { createClient } = await import("./supabase/server")
  const supabase = await createClient()
  const [settings, services, professionals, appointments, expenses, wh, off] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).single(),
    supabase.from("services").select("*").order("sort"),
    supabase.from("professionals").select("*").order("name"),
    supabase
      .from("appointments")
      .select("*, services(name), professionals(name)")
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString())
      .order("starts_at"),
    supabase
      .from("expenses")
      .select("*")
      .gte("spent_on", from.toISOString().slice(0, 10))
      .lt("spent_on", to.toISOString().slice(0, 10))
      .order("spent_on", { ascending: false }),
    supabase.from("working_hours").select("*").order("weekday").order("start_time"),
    supabase.from("time_off").select("*").gte("ends_at", new Date().toISOString()).order("starts_at"),
  ])
  return {
    configured: true,
    settings: settings.data as Settings,
    services: (services.data ?? []) as Service[],
    professionals: (professionals.data ?? []) as Professional[],
    appointments: (appointments.data ?? []) as Appointment[],
    expenses: (expenses.data ?? []) as Expense[],
    workingHours: (wh.data ?? []) as WorkingHour[],
    timeOff: (off.data ?? []) as TimeOff[],
  }
}
