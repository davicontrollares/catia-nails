"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Phone, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppSelect } from "@/components/app-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { PAYMENT_LABEL, STATUS_LABEL, type Appointment, type AppointmentStatus, type PaymentMethod, type Professional, type Service } from "@/lib/types"
import { brl, cn, TZ } from "@/lib/utils"
import { createManualAppointment, setAppointmentStatus } from "../actions"

const time = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  confirmed: "bg-primary/15 text-primary",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-foreground/10 text-muted-foreground line-through",
  no_show: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
}

/** Atualiza a página quando um agendamento muda (Supabase Realtime). */
export function LiveRefresh({ enabled }: { enabled: boolean }) {
  const router = useRouter()
  useEffect(() => {
    if (!enabled) return
    const supabase = createClient()
    const ch = supabase
      .channel("agenda")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => router.refresh())
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [enabled, router])
  return null
}

export function AgendaList({ appointments }: { appointments: Appointment[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [payFor, setPayFor] = useState<Appointment | null>(null)

  function update(a: Appointment, status: AppointmentStatus, payment_method?: PaymentMethod | null) {
    start(async () => {
      const res = await setAppointmentStatus({ id: a.id, status, payment_method })
      if (!res.ok) return void toast.error(res.error)
      toast.success(`Marcado como ${STATUS_LABEL[status].toLowerCase()}`)
      setPayFor(null)
      router.refresh()
    })
  }

  if (!appointments.length) {
    return <div className="glass rounded-3xl p-10 text-center text-muted-foreground">Nenhum atendimento neste dia.</div>
  }

  return (
    <>
      <div className="space-y-3">
        {appointments.map((a) => (
          <div key={a.id} className="glass flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center">
            <div className="w-24 shrink-0">
              <p className="text-xl font-bold tabular-nums">{time(a.starts_at)}</p>
              <p className="text-xs text-muted-foreground tabular-nums">até {time(a.ends_at)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{a.client_name}</p>
              <p className="text-sm text-muted-foreground">
                {a.service_label ?? a.services?.name} · {brl(Number(a.price))}
                {a.payment_method && ` · ${PAYMENT_LABEL[a.payment_method]}`}
              </p>
              {a.notes && <p className="mt-1 text-sm italic text-muted-foreground">{`"${a.notes}"`}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("border-0", STATUS_STYLE[a.status])}>{STATUS_LABEL[a.status]}</Badge>
              <a
                href={`https://wa.me/55${a.client_phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-full hover:bg-foreground/5"
                aria-label="WhatsApp da cliente"
              >
                <Phone className="size-4" />
              </a>
              {a.status === "confirmed" && (
                <>
                  <Button size="sm" disabled={pending} onClick={() => setPayFor(a)}>Concluir</Button>
                  <Button size="sm" variant="secondary" disabled={pending} onClick={() => update(a, "no_show")}>Faltou</Button>
                  <Button size="sm" variant="destructive" disabled={pending} onClick={() => update(a, "cancelled")}>Cancelar</Button>
                </>
              )}
              {a.status !== "confirmed" && (
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => update(a, "confirmed", null)}>Reabrir</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!payFor} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent className="glass-strong rounded-3xl">
          <DialogHeader>
            <DialogTitle>Forma de pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
              <Button key={m} size="lg" variant="secondary" disabled={pending} onClick={() => payFor && update(payFor, "completed", m)}>
                {PAYMENT_LABEL[m]}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ManualAppointment({ services, professionals, day }: { services: Service[]; professionals: Professional[]; day: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [f, setF] = useState({
    service_id: services[0]?.id ?? "",
    professional_id: professionals[0]?.id ?? "",
    date: day,
    time: "09:00",
    client_name: "",
    client_phone: "",
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await createManualAppointment({
        service_id: f.service_id,
        professional_id: f.professional_id,
        starts_at: `${f.date}T${f.time}:00-03:00`,
        client_name: f.client_name,
        client_phone: f.client_phone,
      })
      if (!res.ok) return void toast.error(res.error)
      toast.success("Agendamento criado")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus /> Novo agendamento</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong rounded-3xl">
          <DialogHeader>
            <DialogTitle>Agendamento de balcão</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Serviço</Label>
              <AppSelect
                aria-label="Serviço"
                value={f.service_id}
                onChange={(v) => setF({ ...f, service_id: v })}
                options={services.filter((s) => s.active).map((s) => ({ value: s.id, label: s.name }))}
              />
            </div>
            {professionals.length > 1 && (
              <div className="space-y-1.5">
                <Label>Profissional</Label>
                <AppSelect
                  aria-label="Profissional"
                  value={f.professional_id}
                  onChange={(v) => setF({ ...f, professional_id: v })}
                  options={professionals.map((p) => ({ value: p.id, label: p.name }))}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" className="h-11 rounded-xl" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Hora</Label>
                <Input type="time" step={900} className="h-11 rounded-xl" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nome da cliente</Label>
              <Input required className="h-11 rounded-xl" value={f.client_name} onChange={(e) => setF({ ...f, client_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <Input required type="tel" className="h-11 rounded-xl" value={f.client_phone} onChange={(e) => setF({ ...f, client_phone: e.target.value })} />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={pending}>Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
