"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { WEEKDAYS, type TimeOff, type WorkingHour } from "@/lib/types"
import { TZ } from "@/lib/utils"
import { addTimeOff, removeTimeOff, saveWorkingHours } from "../actions"

type Row = { weekday: number; start_time: string; end_time: string }
const hhmm = (t: string) => t.slice(0, 5)

export function HoursEditor({ professionalId, initial }: { professionalId: string; initial: WorkingHour[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>(initial.map((w) => ({ weekday: w.weekday, start_time: hhmm(w.start_time), end_time: hhmm(w.end_time) })))
  const [pending, start] = useTransition()

  const set = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  function save() {
    start(async () => {
      const res = await saveWorkingHours(professionalId, rows)
      if (!res.ok) return void toast.error(res.error)
      toast.success("Expediente salvo")
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Expediente semanal</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {WEEKDAYS.map((label, wd) => {
          const dayRows = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.weekday === wd)
          const open = dayRows.length > 0
          return (
            <div key={wd} className="glass-subtle rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  {open && (
                    <Button variant="ghost" size="icon-sm" aria-label="Adicionar intervalo" onClick={() => setRows([...rows, { weekday: wd, start_time: "13:00", end_time: "18:00" }])}>
                      <Plus />
                    </Button>
                  )}
                  <Switch
                    checked={open}
                    aria-label={`${label} aberto`}
                    onCheckedChange={(v) =>
                      setRows(v ? [...rows, { weekday: wd, start_time: "08:00", end_time: "18:00" }] : rows.filter((r) => r.weekday !== wd))
                    }
                  />
                </div>
              </div>
              {dayRows.map(({ r, i }) => (
                <div key={i} className="mt-2 flex items-center gap-2">
                  <Input type="time" className="h-10 rounded-xl" value={r.start_time} onChange={(e) => set(i, { start_time: e.target.value })} aria-label="Início" />
                  <span className="text-muted-foreground">até</span>
                  <Input type="time" className="h-10 rounded-xl" value={r.end_time} onChange={(e) => set(i, { end_time: e.target.value })} aria-label="Fim" />
                  <Button variant="ghost" size="icon-sm" aria-label="Remover intervalo" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )
        })}
        <Button size="lg" className="w-full" onClick={save} disabled={pending}>Salvar expediente</Button>
      </CardContent>
    </Card>
  )
}

const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ })

export function TimeOffEditor({ professionalId, items }: { professionalId: string; items: TimeOff[] }) {
  const router = useRouter()
  const [f, setF] = useState({ from: "", to: "", reason: "" })
  const [pending, start] = useTransition()

  function add(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await addTimeOff({
        professional_id: professionalId,
        starts_at: `${f.from}:00-03:00`,
        ends_at: `${f.to}:00-03:00`,
        reason: f.reason,
      })
      if (!res.ok) return void toast.error(res.error)
      toast.success("Bloqueio adicionado")
      setF({ from: "", to: "", reason: "" })
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Folgas e bloqueios</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={add} className="space-y-2">
          <div className="space-y-1.5">
            <Label htmlFor="off-from">De</Label>
            <Input id="off-from" type="datetime-local" required className="h-11 rounded-xl" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="off-to">Até</Label>
            <Input id="off-to" type="datetime-local" required className="h-11 rounded-xl" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
          </div>
          <Input placeholder="Motivo (feriado, curso…)" className="h-11 rounded-xl" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
          <Button type="submit" className="w-full" disabled={pending}>Bloquear período</Button>
        </form>
        <div className="space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum bloqueio futuro.</p>}
          {items.map((t) => (
            <div key={t.id} className="glass-subtle flex items-center justify-between rounded-2xl px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{t.reason || "Bloqueio"}</p>
                <p className="text-muted-foreground">{fmt(t.starts_at)} → {fmt(t.ends_at)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remover bloqueio"
                onClick={() =>
                  start(async () => {
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
