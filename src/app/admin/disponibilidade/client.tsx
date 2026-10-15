"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addDays, format } from "date-fns"
import { ptBR } from "react-day-picker/locale"
import type { DateRange } from "react-day-picker"
import { CalendarOff, Copy, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { AppSelect } from "@/components/app-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { TimeOff, WorkingHour } from "@/lib/types"
import { cn, TZ } from "@/lib/utils"
import { addTimeOff, removeTimeOff, saveWorkingHours } from "../actions"

type Row = { weekday: number; start_time: string; end_time: string }

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
// segunda primeiro, como a semana de trabalho
const ORDER = [1, 2, 3, 4, 5, 6, 0]
const TIMES = Array.from({ length: 33 }, (_, i) => {
  const m = 6 * 60 + i * 30
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
})
const TIME_OPTIONS = TIMES.map((t) => ({ value: t, label: t }))
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const DAY_START = 6 * 60
const DAY_SPAN = 16 * 60

const PRESETS: { label: string; days: number[]; blocks: [string, string][] }[] = [
  { label: "Ter a sáb, 8h às 18h", days: [2, 3, 4, 5, 6], blocks: [["08:00", "12:00"], ["13:00", "18:00"]] },
  { label: "Seg a sex, 9h às 19h", days: [1, 2, 3, 4, 5], blocks: [["09:00", "12:00"], ["13:00", "19:00"]] },
  { label: "Seg a sáb, 8h às 18h", days: [1, 2, 3, 4, 5, 6], blocks: [["08:00", "12:00"], ["13:00", "18:00"]] },
]

export function HoursEditor({ professionalId, initial }: { professionalId: string; initial: WorkingHour[] }) {
  const router = useRouter()
  const start = useMemo(
    () => initial.map((w) => ({ weekday: w.weekday, start_time: w.start_time.slice(0, 5), end_time: w.end_time.slice(0, 5) })),
    [initial]
  )
  const [rows, setRows] = useState<Row[]>(start)
  const [pending, run] = useTransition()
  const dirty = JSON.stringify(rows) !== JSON.stringify(start)

  const dayRows = (wd: number) => rows.map((r, i) => ({ r, i })).filter(({ r }) => r.weekday === wd)
  const update = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  function toggleDay(wd: number, on: boolean) {
    setRows(on ? [...rows, { weekday: wd, start_time: "08:00", end_time: "18:00" }] : rows.filter((r) => r.weekday !== wd))
  }

  function addBlock(wd: number) {
    const last = dayRows(wd).at(-1)?.r
    const from = last ? last.end_time : "08:00"
    const to = TIMES[Math.min(TIMES.indexOf(from) + 4, TIMES.length - 1)]
    setRows([...rows, { weekday: wd, start_time: from, end_time: to }])
  }

  function copyToOpenDays(wd: number) {
    const blocks = dayRows(wd).map(({ r }) => r)
    const open = new Set(rows.map((r) => r.weekday))
    open.delete(wd)
    if (!open.size) return toast.info("Ative outros dias para copiar este horário.")
    setRows([...rows.filter((r) => !open.has(r.weekday)), ...[...open].flatMap((d) => blocks.map((b) => ({ ...b, weekday: d })))])
    toast.success("Horário copiado para os dias abertos")
  }

  function save() {
    run(async () => {
      const res = await saveWorkingHours(professionalId, rows)
      if (!res.ok) return void toast.error(res.error)
      toast.success("Expediente salvo")
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expediente semanal</CardTitle>
        <CardDescription>Ative os dias de atendimento e ajuste os intervalos. O almoço é o espaço entre dois intervalos.</CardDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              size="sm"
              variant="outline"
              onClick={() => setRows(p.days.flatMap((weekday) => p.blocks.map(([s, e]) => ({ weekday, start_time: s, end_time: e }))))}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {ORDER.map((wd) => {
          const blocks = dayRows(wd)
          const open = blocks.length > 0
          return (
            <div key={wd} className={cn("rounded-2xl px-3 py-3 transition-colors", open ? "bg-muted/50" : "opacity-70")}>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex w-36 shrink-0 cursor-pointer items-center gap-3">
                  <Switch checked={open} onCheckedChange={(v) => toggleDay(wd, v)} aria-label={`${DAYS[wd]} aberto`} />
                  <span className="font-medium">{DAYS[wd]}</span>
                </label>

                {!open ? (
                  <span className="text-sm text-muted-foreground">Fechado</span>
                ) : (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {blocks.map(({ r, i }) => (
                      <div key={i} className="flex items-center gap-1 rounded-full border bg-background py-1 pr-1 pl-1">
                        <AppSelect aria-label="Início" value={r.start_time} onChange={(v) => update(i, { start_time: v })} options={TIME_OPTIONS} className="h-8 w-[5.5rem] rounded-full border-0 bg-transparent" />
                        <span className="text-xs text-muted-foreground">às</span>
                        <AppSelect aria-label="Fim" value={r.end_time} onChange={(v) => update(i, { end_time: v })} options={TIME_OPTIONS} className="h-8 w-[5.5rem] rounded-full border-0 bg-transparent" />
                        <Button variant="ghost" size="icon-sm" aria-label="Remover intervalo" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                          <X />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="icon-sm" aria-label="Adicionar intervalo" onClick={() => addBlock(wd)}>
                      <Plus />
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={() => copyToOpenDays(wd)}>
                      <Copy /> Copiar para os dias abertos
                    </Button>
                  </div>
                )}
              </div>

              {open && (
                <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-border/70 md:ml-39" aria-hidden>
                  {blocks.map(({ r, i }) => (
                    <span
                      key={i}
                      className="absolute inset-y-0 rounded-full bg-primary"
                      style={{
                        left: `${((toMin(r.start_time) - DAY_START) / DAY_SPAN) * 100}%`,
                        width: `${(Math.max(0, toMin(r.end_time) - toMin(r.start_time)) / DAY_SPAN) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="sticky bottom-4 z-10 mt-4 flex items-center justify-between gap-3 rounded-2xl border bg-background/90 p-3 backdrop-blur">
          <span className="text-sm text-muted-foreground">{dirty ? "Alterações não salvas" : "Tudo salvo"}</span>
          <div className="flex gap-2">
            {dirty && <Button variant="ghost" onClick={() => setRows(start)}>Desfazer</Button>}
            <Button onClick={save} disabled={!dirty || pending}>Salvar expediente</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleString("pt-BR", { ...opts, timeZone: TZ })

export function TimeOffEditor({ professionalId, items }: { professionalId: string; items: TimeOff[] }) {
  const router = useRouter()
  const [range, setRange] = useState<DateRange | undefined>()
  const [allDay, setAllDay] = useState(true)
  const [times, setTimes] = useState({ from: "08:00", to: "12:00" })
  const [reason, setReason] = useState("")
  const [pending, run] = useTransition()

  const quick = [
    { label: "Hoje", r: { from: new Date(), to: new Date() } },
    { label: "Amanhã", r: { from: addDays(new Date(), 1), to: addDays(new Date(), 1) } },
    { label: "Próximos 7 dias", r: { from: new Date(), to: addDays(new Date(), 6) } },
  ]

  function add() {
    if (!range?.from) return
    const first = format(range.from, "yyyy-MM-dd")
    const last = format(range.to ?? range.from, "yyyy-MM-dd")
    const startsAt = `${first}T${allDay ? "00:00" : times.from}:00-03:00`
    const endsAt = allDay
      ? `${format(addDays(range.to ?? range.from, 1), "yyyy-MM-dd")}T00:00:00-03:00`
      : `${last}T${times.to}:00-03:00`
    run(async () => {
      const res = await addTimeOff({ professional_id: professionalId, starts_at: startsAt, ends_at: endsAt, reason })
      if (!res.ok) return void toast.error(res.error)
      toast.success("Período bloqueado")
      setRange(undefined)
      setReason("")
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Folgas e bloqueios</CardTitle>
        <CardDescription>Escolha os dias no calendário. Esses horários somem da agenda das clientes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {quick.map((q) => (
            <Button key={q.label} size="sm" variant="outline" onClick={() => setRange(q.r)}>
              {q.label}
            </Button>
          ))}
        </div>

        <div className="flex justify-center rounded-2xl border bg-background p-2">
          <Calendar
            mode="range"
            locale={ptBR}
            selected={range}
            onSelect={setRange}
            disabled={{ before: new Date() }}
            className="bg-transparent [--cell-size:--spacing(9)]"
          />
        </div>

        <label className="flex items-center justify-between rounded-xl px-1">
          <span className="text-sm font-medium">Dia inteiro</span>
          <Switch checked={allDay} onCheckedChange={setAllDay} />
        </label>

        {!allDay && (
          <div className="flex items-center gap-2">
            <AppSelect aria-label="Das" value={times.from} onChange={(v) => setTimes({ ...times, from: v })} options={TIME_OPTIONS} />
            <span className="text-sm text-muted-foreground">às</span>
            <AppSelect aria-label="Até" value={times.to} onChange={(v) => setTimes({ ...times, to: v })} options={TIME_OPTIONS} />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="off-reason">Motivo (opcional)</Label>
          <Input id="off-reason" placeholder="Feriado, curso, consulta" className="h-11 rounded-xl" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <Button className="w-full" size="lg" disabled={!range?.from || pending} onClick={add}>
          <CalendarOff />
          {range?.from
            ? `Bloquear ${format(range.from, "d MMM", { locale: ptBR })}${range.to && range.to.getTime() !== range.from.getTime() ? ` a ${format(range.to, "d MMM", { locale: ptBR })}` : ""}`
            : "Escolha os dias"}
        </Button>

        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium">Próximos bloqueios</p>
          {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum bloqueio marcado.</p>}
          {items.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border bg-background px-3 py-2">
              <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <span className="text-sm leading-none font-semibold">{fmt(t.starts_at, { day: "2-digit" })}</span>
                <span className="text-[10px] uppercase">{fmt(t.starts_at, { month: "short" }).replace(".", "")}</span>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{t.reason || "Bloqueio"}</p>
                <p className="text-muted-foreground">
                  {fmt(t.starts_at, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} até{" "}
                  {fmt(t.ends_at, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex">Bloqueado</Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remover bloqueio"
                onClick={() =>
                  run(async () => {
                    const res = await removeTimeOff(t.id)
                    if (!res.ok) toast.error(res.error)
                    else router.refresh()
                  })
                }
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
