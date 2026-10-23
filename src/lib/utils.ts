import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export const TZ = "America/Sao_Paulo"

export function duration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h${m ? ` ${m}min` : ""}` : `${m}min`
}

type Timed = { duration_min: number; duration_max_min?: number | null }

/** Tempo que a agenda reserva: o máximo do serviço, quando ele tem faixa de duração. */
export const reserveMin = (s: Timed) => s.duration_max_min ?? s.duration_min

/** "1h" para duração fixa, "2h a 4h" para faixa. */
export const durationLabel = (s: Timed) =>
  s.duration_max_min && s.duration_max_min > s.duration_min
    ? `${duration(s.duration_min)} a ${duration(s.duration_max_min)}`
    : duration(s.duration_min)

const DAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]

/** Resume o expediente: "Terça a sábado, 08:00 às 18:00". */
export function summarizeHours(rows: { weekday: number; start_time: string; end_time: string }[]) {
  if (!rows.length) return "Atendimento com hora marcada"
  const byDay = new Map<number, { start: string; end: string }>()
  for (const r of rows) {
    const cur = byDay.get(r.weekday)
    const start = r.start_time.slice(0, 5)
    const end = r.end_time.slice(0, 5)
    byDay.set(r.weekday, { start: cur && cur.start < start ? cur.start : start, end: cur && cur.end > end ? cur.end : end })
  }
  // agrupa dias seguidos com o mesmo horário
  const days = [...byDay.keys()].sort((a, b) => a - b)
  const groups: { from: number; to: number; start: string; end: string }[] = []
  for (const d of days) {
    const h = byDay.get(d)!
    const last = groups.at(-1)
    if (last && last.to === d - 1 && last.start === h.start && last.end === h.end) last.to = d
    else groups.push({ from: d, to: d, ...h })
  }
  return groups
    .map((g) => {
      const label = g.from === g.to ? DAYS[g.from] : `${DAYS[g.from]} a ${DAYS[g.to]}`
      return `${label.charAt(0).toUpperCase()}${label.slice(1)}, ${g.start} às ${g.end}`
    })
    .join(" · ")
}

export function formatPhone(digits: string | null) {
  const d = (digits ?? "").replace(/\D/g, "").replace(/^55/, "")
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  return d
}
