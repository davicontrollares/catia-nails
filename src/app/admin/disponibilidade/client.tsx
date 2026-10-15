"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addDays, format } from "date-fns"
import { ptBR } from "react-day-picker/locale"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AppSelect } from "@/components/app-select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TimeOff, WorkingHour } from "@/lib/types"
import { cn, TZ } from "@/lib/utils"
import { addTimeOff, removeTimeOff, saveWorkingHours } from "../actions"

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const ORDER = [1, 2, 3, 4, 5, 6, 0]
const TIMES = Array.from({ length: 33 }, (_, i) => {
  const m = 6 * 60 + i * 30
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}).map((t) => ({ value: t, label: t }))

// Um dia = abre, fecha e um almoço opcional (vira 1 ou 2 intervalos no banco).
type Day = { open: boolean; start: string; end: string; lunch: boolean; lunchStart: string; lunchEnd: string }

function toDays(rows: WorkingHour[]): Day[] {
  return Array.from({ length: 7 }, (_, wd) => {
    const r = rows.filter((x) => x.weekday === wd).sort((a, b) => a.start_time.localeCompare(b.start_time))
    if (!r.length) return { open: false, start: "08:00", end: "18:00", lunch: true, lunchStart: "12:00", lunchEnd: "13:00" }
    const t = (s: string) => s.slice(0, 5)
    return {
      open: true,
      start: t(r[0].start_time),
      end: t(r.at(-1)!.end_time),
      lunch: r.length > 1,
      lunchStart: r.length > 1 ? t(r[0].end_time) : "12:00",
      lunchEnd: r.length > 1 ? t(r[1].start_time) : "13:00",
    }
  })
}

function toRows(days: Day[]) {
  return days.flatMap((d, weekday) => {
    if (!d.open) return []
    if (!d.lunch) return [{ weekday, start_time: d.start, end_time: d.end }]
    return [
      { weekday, start_time: d.start, end_time: d.lunchStart },
      { weekday, start_time: d.lunchEnd, end_time: d.end },
    ]
  })
}

export function HoursEditor({ professionalId, initial }: { professionalId: string; initial: WorkingHour[] }) {
  const router = useRouter()
  const start = useMemo(() => toDays(initial), [initial])
  const [days, setDays] = useState(start)
  const [pending, run] = useTransition()
  const dirty = JSON.stringify(days) !== JSON.stringify(start)
  const set = (wd: number, patch: Partial<Day>) => setDays(days.map((d, i) => (i === wd ? { ...d, ...patch } : d)))

  function applyToAll(wd: number) {
    const src = days[wd]
    setDays(days.map((d) => (d.open ? { ...src } : d)))
    toast.success(`Horário de ${DAYS[wd].toLowerCase()} aplicado aos dias abertos`)
  }

  function save() {
    run(async () => {
      const res = await saveWorkingHours(professionalId, toRows(days))
      if (!res.ok) return void toast.error(res.error)
      toast.success("Expediente salvo")
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expediente</CardTitle>
        <CardDescription>Horário de atendimento de cada dia. Use o ícone de copiar para repetir um horário nos outros dias.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Dia</TableHead>
              <TableHead>Abre</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Almoço</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORDER.map((wd) => {
              const d = days[wd]
              return (
                <TableRow key={wd} className={cn(!d.open && "text-muted-foreground")}>
                  <TableCell>
                    <label className="flex cursor-pointer items-center gap-3">
                      <Switch checked={d.open} onCheckedChange={(v) => set(wd, { open: v })} aria-label={`${DAYS[wd]} aberto`} />
                      <span className="font-medium">{DAYS[wd]}</span>
                    </label>
                  </TableCell>
                  {d.open ? (
                    <>
                      <TableCell><AppSelect aria-label="Abre" value={d.start} onChange={(v) => set(wd, { start: v })} options={TIMES} className="h-9 w-24" /></TableCell>
                      <TableCell><AppSelect aria-label="Fecha" value={d.end} onChange={(v) => set(wd, { end: v })} options={TIMES} className="h-9 w-24" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={d.lunch} onCheckedChange={(v) => set(wd, { lunch: v })} aria-label="Pausa para almoço" />
                          {d.lunch && (
                            <>
                              <AppSelect aria-label="Almoço início" value={d.lunchStart} onChange={(v) => set(wd, { lunchStart: v })} options={TIMES} className="h-9 w-24" />
                              <span className="text-xs text-muted-foreground">às</span>
                              <AppSelect aria-label="Almoço fim" value={d.lunchEnd} onChange={(v) => set(wd, { lunchEnd: v })} options={TIMES} className="h-9 w-24" />
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon-sm" title="Aplicar este horário a todos os dias abertos" aria-label="Aplicar a todos os dias abertos" onClick={() => applyToAll(wd)}><Copy /></Button>
                      </TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={4}>Fechado</TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-end gap-2">
          {dirty && <Button variant="ghost" onClick={() => setDays(start)}>Desfazer</Button>}
          <Button onClick={save} disabled={!dirty || pending}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  )
}

const fmtShort = (d: Date) => format(d, "d 'de' MMM", { locale: ptBR })
const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ })

export function TimeOffEditor({ professionalId, items }: { professionalId: string; items: TimeOff[] }) {
  const router = useRouter()
  const [range, setRange] = useState<DateRange | undefined>()
  const [allDay, setAllDay] = useState(true)
  const [times, setTimes] = useState({ from: "08:00", to: "12:00" })
  const [reason, setReason] = useState("")
  const [pending, run] = useTransition()

  function add() {
    if (!range?.from) return
    const to = range.to ?? range.from
    const startsAt = `${format(range.from, "yyyy-MM-dd")}T${allDay ? "00:00" : times.from}:00-03:00`
    const endsAt = allDay ? `${format(addDays(to, 1), "yyyy-MM-dd")}T00:00:00-03:00` : `${format(to, "yyyy-MM-dd")}T${times.to}:00-03:00`
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
        <CardDescription>Dias ou horários em que você não atende.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" className={cn("h-11 w-full justify-start rounded-xl font-normal", !range?.from && "text-muted-foreground")}>
                <CalendarIcon />
                {range?.from ? (range.to && range.to.getTime() !== range.from.getTime() ? `${fmtShort(range.from)} até ${fmtShort(range.to)}` : fmtShort(range.from)) : "Escolher datas"}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" locale={ptBR} selected={range} onSelect={setRange} disabled={{ before: new Date() }} numberOfMonths={1} />
          </PopoverContent>
        </Popover>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-3 text-sm">
            <Switch checked={allDay} onCheckedChange={setAllDay} /> Dia inteiro
          </label>
          {!allDay && (
            <div className="flex items-center gap-2">
              <AppSelect aria-label="Das" value={times.from} onChange={(v) => setTimes({ ...times, from: v })} options={TIMES} className="h-9 w-24" />
              <span className="text-xs text-muted-foreground">às</span>
              <AppSelect aria-label="Até" value={times.to} onChange={(v) => setTimes({ ...times, to: v })} options={TIMES} className="h-9 w-24" />
            </div>
          )}
        </div>

        <Input placeholder="Motivo (opcional)" className="h-11 rounded-xl" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Button className="w-full" disabled={!range?.from || pending} onClick={add}>Bloquear</Button>

        {items.length > 0 && (
          <ul className="divide-y pt-2">
            {items.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.reason || "Bloqueio"}</p>
                  <p className="text-muted-foreground">{fmt(t.starts_at)} até {fmt(t.ends_at)}</p>
                </div>
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
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
