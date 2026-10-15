"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { addDays, format } from "date-fns"
import { ptBR } from "react-day-picker/locale"
import { CalendarCheck, CalendarPlus, Check, ChevronLeft, Clock, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Textarea } from "@/components/ui/textarea"
import { buildIcs, googleCalendarUrl, outlookCalendarUrl, type CalendarEvent } from "@/lib/calendar"
import { duration } from "@/lib/utils"
import type { Professional, Service } from "@/lib/types"
import { brl, cn, TZ } from "@/lib/utils"
import { bookAppointment, getSlots } from "./actions"

const STEPS = ["Serviço", "Data", "Horário", "Seus dados"]
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })
const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ })

export function BookingWizard({
  services,
  professionals,
  maxDaysAhead,
  initialServiceId,
  demo,
  address,
}: {
  services: Service[]
  professionals: Professional[]
  maxDaysAhead: number
  initialServiceId?: string
  demo: boolean
  address: string
}) {
  const initial = services.find((s) => s.id === initialServiceId)
  const [step, setStep] = useState(initial ? 1 : 0)
  const [service, setService] = useState<Service | undefined>(initial)
  const professional = professionals[0]
  const [date, setDate] = useState<Date>()
  const [slots, setSlots] = useState<string[] | null>(null)
  const [slot, setSlot] = useState<string>()
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" })
  const [done, setDone] = useState<string | null>(null)
  const [loadingSlots, startSlots] = useTransition()
  const [submitting, startSubmit] = useTransition()

  useEffect(() => {
    if (!service || !date || !professional) return
    setSlots(null)
    startSlots(async () => {
      try {
        setSlots(await getSlots(service.id, professional.id, format(date, "yyyy-MM-dd"), service.duration_min))
      } catch {
        toast.error("Não foi possível carregar os horários.")
        setSlots([])
      }
    })
  }, [service, date, professional])

  function submit() {
    if (!service || !slot || !professional) return
    startSubmit(async () => {
      const res = await bookAppointment({
        serviceId: service.id,
        professionalId: professional.id,
        startsAt: slot,
        ...form,
      })
      if (res.ok) setDone(res.id)
      else toast.error(res.error)
    })
  }

  if (!professional) {
    return <p className="text-center text-muted-foreground">Agenda indisponível no momento.</p>
  }

  if (done && service && slot) {
    const event: CalendarEvent = {
      id: done,
      title: `${service.name} · Catia Rodrigues Nails`,
      description: `Atendimento com ${professional.name}.`,
      location: address,
      start: new Date(slot),
      end: new Date(new Date(slot).getTime() + service.duration_min * 60_000),
    }
    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(event))}`
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 22 }}>
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="space-y-4 py-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-8" />
            </div>
            <h1 className="text-2xl font-bold">Horário confirmado!</h1>
            <p className="text-muted-foreground">
              {service.name} com {professional.name}
              <br />
              <span className="inline-block font-medium text-foreground first-letter:uppercase">{fmtDay(slot)}</span> às{" "}
              <span className="font-medium text-foreground">{fmtTime(slot)}</span>
            </p>
            <p className="text-sm text-muted-foreground">Enviamos a confirmação para <b className="text-foreground">{form.email}</b>.</p>
            <div className="glass-subtle space-y-2 rounded-2xl p-3">
              <p className="flex items-center justify-center gap-1.5 text-sm font-medium"><CalendarPlus className="size-4" /> Adicionar à sua agenda</p>
              <div className="grid grid-cols-3 gap-2">
                <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary", size: "sm" })}>Google</a>
                <a href={icsHref} download="agendamento.ics" className={buttonVariants({ variant: "secondary", size: "sm" })}><Download /> Apple</a>
                <a href={outlookCalendarUrl(event)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary", size: "sm" })}>Outlook</a>
              </div>
            </div>
            {demo && <p className="text-xs text-muted-foreground">Modo de demonstração: o horário não foi salvo.</p>}
            <div className="flex flex-col gap-2">
              <Link href="/meus-agendamentos" className={buttonVariants({ size: "lg" })}>Ver meus horários</Link>
              <Link href="/" className={buttonVariants({ variant: "ghost" })}>Voltar ao início</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button variant="secondary" size="icon" aria-label="Voltar" onClick={() => setStep(step - 1)}>
            <ChevronLeft className="size-5" />
          </Button>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Passo {step + 1} de {STEPS.length}</p>
          <h1 className="text-3xl font-bold tracking-tight">{STEPS[step]}</h1>
        </div>
      </div>

      <div className="flex gap-1.5" aria-hidden>
        {STEPS.map((_, i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-foreground/10")} />
        ))}
      </div>

      {service && step > 0 && (
        <div className="glass-subtle flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
          <span className="font-medium">{service.name}</span>
          <span className="text-muted-foreground">
            {slot && step > 2 ? `${fmtTime(slot)} · ` : ""}
            {brl(Number(service.price))}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {step === 0 && (
            <RadioGroup
              value={service?.id ?? ""}
              onValueChange={(id) => {
                const s = services.find((x) => x.id === id)
                if (!s) return
                setService(s)
                setSlot(undefined)
                setStep(1)
              }}
              className="grid gap-3"
            >
              {services.map((s) => (
                <Label
                  key={s.id}
                  htmlFor={`svc-${s.id}`}
                  className="glass flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl px-5 py-4 transition active:scale-[0.98] has-data-checked:ring-2 has-data-checked:ring-primary"
                >
                  <RadioGroupItem id={`svc-${s.id}`} value={s.id} />
                  <div className="flex-1">
                    <p className="font-medium">{s.name}</p>
                    <p className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                      <Clock className="size-3.5" /> {duration(s.duration_min)}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">{brl(Number(s.price))}</span>
                </Label>
              ))}
            </RadioGroup>
          )}

          {step === 1 && (
            <Card>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  selected={date}
                  onSelect={(d) => {
                    if (!d) return
                    setDate(d)
                    setSlot(undefined)
                    setStep(2)
                  }}
                  disabled={[{ before: new Date() }, { after: addDays(new Date(), maxDaysAhead) }]}
                  className="bg-transparent [--cell-size:--spacing(11)]"
                />
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {date && <p className="px-1 font-medium first-letter:uppercase">{format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>}
              {loadingSlots || slots === null ? (
                <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
              ) : slots.length === 0 ? (
                <Card>
                  <CardContent className="space-y-3 text-center">
                    <p className="text-muted-foreground">Nenhum horário livre neste dia.</p>
                    <Button variant="secondary" onClick={() => setStep(1)}>Escolher outra data</Button>
                  </CardContent>
                </Card>
              ) : (
                <ToggleGroup
                  value={slot ? [slot] : []}
                  onValueChange={(v) => {
                    const next = v[0]
                    if (!next) return
                    setSlot(next)
                    setStep(3)
                  }}
                  spacing={2}
                  className="grid w-full grid-cols-3 sm:grid-cols-4"
                  aria-label="Horários disponíveis"
                >
                  {slots.map((s) => (
                    <ToggleGroupItem
                      key={s}
                      value={s}
                      variant="outline"
                      className="glass h-12 w-full rounded-2xl font-medium tabular-nums data-pressed:bg-primary data-pressed:text-primary-foreground"
                    >
                      {fmtTime(s)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            </div>
          )}

          {step === 3 && slot && (
            <Card>
              <CardContent className="space-y-4">
                <p className="flex items-center gap-2 text-sm">
                  <CalendarCheck className="size-4 text-primary" />
                  <span className="inline-block first-letter:uppercase">{fmtDay(slot)}</span> às {fmtTime(slot)} · {professional.name}
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" autoComplete="name" className="h-12 rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" className="h-12 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Você recebe a confirmação com o link para salvar na sua agenda.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(17) 99999-9999" className="h-12 rounded-xl" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea id="notes" className="rounded-xl" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <Button size="lg" className="w-full" disabled={submitting} onClick={submit}>
                  {submitting && <Loader2 className="animate-spin" />} Confirmar agendamento
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
