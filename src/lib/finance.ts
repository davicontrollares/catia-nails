import type { Appointment, Expense, WorkingHour } from "./types"
import { TZ } from "./utils"

/** yyyy-mm-dd no fuso de São Paulo */
export const dayKey = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ })

export const revenueOf = (list: Appointment[]) =>
  list.filter((a) => a.status === "completed").reduce((s, a) => s + Number(a.price), 0)

export function summarize(appointments: Appointment[], expenses: Expense[], from: Date, to: Date, hours: WorkingHour[]) {
  const done = appointments.filter((a) => a.status === "completed")
  const revenue = revenueOf(appointments)
  const costs = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const lost = appointments.filter((a) => a.status === "cancelled" || a.status === "no_show").length

  // ocupação = minutos agendados / minutos de expediente no período
  let openMin = 0
  for (let d = new Date(from); d < to; d.setDate(d.getDate() + 1)) {
    for (const h of hours.filter((w) => w.weekday === d.getDay())) {
      const [sh, sm] = h.start_time.split(":").map(Number)
      const [eh, em] = h.end_time.split(":").map(Number)
      openMin += eh * 60 + em - (sh * 60 + sm)
    }
  }
  const bookedMin = appointments
    .filter((a) => a.status !== "cancelled")
    .reduce((s, a) => s + (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60_000, 0)

  return {
    revenue,
    costs,
    profit: revenue - costs,
    count: done.length,
    ticket: done.length ? revenue / done.length : 0,
    occupancy: openMin ? Math.min(1, bookedMin / openMin) : 0,
    lossRate: appointments.length ? lost / appointments.length : 0,
  }
}

export function revenueByDay(appointments: Appointment[], from: Date, to: Date) {
  const map = new Map<string, number>()
  for (let d = new Date(from); d < to; d.setDate(d.getDate() + 1)) map.set(dayKey(d), 0)
  for (const a of appointments) {
    if (a.status !== "completed") continue
    const k = dayKey(a.starts_at)
    if (map.has(k)) map.set(k, map.get(k)! + Number(a.price))
  }
  return [...map].map(([day, total]) => ({
    day,
    label: new Date(`${day}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    total,
  }))
}

export function groupSum<T>(items: T[], key: (t: T) => string, value: (t: T) => number) {
  const map = new Map<string, number>()
  for (const i of items) map.set(key(i), (map.get(key(i)) ?? 0) + value(i))
  return [...map].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total)
}

export function toCsv(rows: Record<string, string | number | null>[]) {
  if (!rows.length) return ""
  const cols = Object.keys(rows[0])
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`
  return [cols.join(";"), ...rows.map((r) => cols.map((c) => esc(r[c])).join(";"))].join("\n")
}
