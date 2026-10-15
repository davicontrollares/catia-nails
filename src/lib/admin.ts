import { addDays, startOfDay } from "date-fns"
import { DEMO_PROFESSIONAL, DEMO_SERVICES, DEMO_SETTINGS, getPublicData, hasSupabase } from "./data"
import type { Appointment, Expense, PaymentMethod, Professional, Service, Settings, TimeOff, WorkingHour } from "./types"

export type AdminData = {
  demo: boolean
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
  if (!hasSupabase) return demoData(from, to)

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
    demo: false,
    settings: settings.data as Settings,
    services: (services.data ?? []) as Service[],
    professionals: (professionals.data ?? []) as Professional[],
    appointments: (appointments.data ?? []) as Appointment[],
    expenses: (expenses.data ?? []) as Expense[],
    workingHours: (wh.data ?? []) as WorkingHour[],
    timeOff: (off.data ?? []) as TimeOff[],
  }
}

// ------------------------------------------------------------------ demo

const NAMES = ["Ana Paula", "Juliana Costa", "Mariana Silva", "Fernanda Lima", "Beatriz Souza", "Camila Rocha", "Larissa Alves", "Patrícia Gomes"]
const METHODS: PaymentMethod[] = ["pix", "pix", "pix", "credit", "debit", "cash"]

function demoData(from: Date, to: Date): AdminData {
  const appointments: Appointment[] = []
  let seed = 7
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const today = startOfDay(new Date())

  for (let d = startOfDay(from); d < to; d = addDays(d, 1)) {
    const wd = d.getDay()
    if (wd < 2) continue
    let hour = 8
    while (hour < 17) {
      if (hour === 12) { hour = 13; continue }
      if (rand() < 0.35) { hour += 1; continue }
      const svc = DEMO_SERVICES[Math.floor(rand() * DEMO_SERVICES.length)]
      const start = new Date(d)
      start.setHours(hour, 0, 0, 0)
      const end = new Date(start.getTime() + svc.duration_min * 60_000)
      const past = start < new Date()
      const r = rand()
      appointments.push({
        id: `demo-${start.getTime()}`,
        client_id: null,
        client_name: NAMES[Math.floor(rand() * NAMES.length)],
        client_phone: "(17) 99999-0000",
        professional_id: DEMO_PROFESSIONAL.id,
        service_id: svc.id,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: past ? (r < 0.88 ? "completed" : r < 0.95 ? "cancelled" : "no_show") : "confirmed",
        price: svc.price,
        payment_method: past ? METHODS[Math.floor(rand() * METHODS.length)] : null,
        notes: null,
        services: { name: svc.name },
        professionals: { name: DEMO_PROFESSIONAL.name },
      })
      hour += Math.ceil(svc.duration_min / 60)
    }
  }

  const expenses: Expense[] = [
    { id: "e1", category: "Aluguel", description: "Aluguel do studio", amount: 1200, spent_on: addDays(today, -12).toISOString().slice(0, 10) },
    { id: "e2", category: "Produtos", description: "Géis, fibras e esmaltes", amount: 480, spent_on: addDays(today, -10).toISOString().slice(0, 10) },
    { id: "e3", category: "Marketing", description: "Impulsionamento Instagram", amount: 150, spent_on: addDays(today, -5).toISOString().slice(0, 10) },
    { id: "e4", category: "Contas", description: "Energia e internet", amount: 260, spent_on: addDays(today, -3).toISOString().slice(0, 10) },
  ]

  const workingHours: WorkingHour[] = [2, 3, 4, 5, 6].flatMap((weekday) => [
    { id: `w${weekday}a`, professional_id: DEMO_PROFESSIONAL.id, weekday, start_time: "08:00:00", end_time: "12:00:00" },
    { id: `w${weekday}b`, professional_id: DEMO_PROFESSIONAL.id, weekday, start_time: "13:00:00", end_time: "18:00:00" },
  ])

  return {
    demo: true,
    settings: DEMO_SETTINGS,
    services: DEMO_SERVICES,
    professionals: [DEMO_PROFESSIONAL],
    appointments,
    expenses,
    workingHours,
    timeOff: [],
  }
}

export { getPublicData }
