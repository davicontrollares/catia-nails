"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { addDays, format } from "date-fns"
import { ptBR } from "react-day-picker/locale"
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { buildIcs, googleCalendarUrl, outlookCalendarUrl, type CalendarEvent } from "@/lib/calendar"
import type { Professional, Service } from "@/lib/types"
import { brl, cn, duration, TZ } from "@/lib/utils"
import { bookAppointment, getSlots } from "./actions"
import { CardDialog, PAY_LABEL, PaymentChoice, PixDialog, RepeatLast, type PayMethod } from "./payment"

const STEPS = ["Serviços", "Data e hora", "Seus dados", "Pagamento"]
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
  const professional = professionals[0]
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<string[]>(
    initialServiceId && services.some((s) => s.id === initialServiceId) ? [initialServiceId] : []
  )
  const [date, setDate] = useState<Date>()
  const [slots, setSlots] = useState<string[] | null>(null)
  const [slot, setSlot] = useState<string>()
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" })
  const [done, setDone] = useState<string | null>(null)
  const [pay, setPay] = useState<PayMethod>("pix")
  const [payDialog, setPayDialog] = useState<"pix" | "mp" | null>(null)
  const [loadingSlots, startSlots] = useTransition()
  const [submitting, startSubmit] = useTransition()

  const chosen = useMemo(() => services.filter((s) => selected.includes(s.id)), [services, selected])
  const totalMin = chosen.reduce((t, s) => t + s.duration_min, 0)
  const totalPrice = chosen.reduce((t, s) => t + Number(s.price), 0)

  // mudar serviços muda a duração, então o horário escolhido deixa de valer
  useEffect(() => {
    setSlot(undefined)
  }, [totalMin])

  useEffect(() => {
    if (!date || !professional || !totalMin) return
    setSlots(null)
    startSlots(async () => {
      try {
        setSlots(await getSlots(professional.id, format(date, "yyyy-MM-dd"), totalMin))
      } catch {
        toast.error("Não foi possível carregar os horários.")
        setSlots([])
      }
    })
  }, [date, professional, totalMin])

  const canNext =
    step === 0 ? chosen.length > 0 : step === 1 ? Boolean(slot) : step === 2 ? Boolean(form.name && form.email && form.phone) : true
  const last = STEPS.length - 1

  function book() {
    if (!slot || !professional) return
    setPayDialog(null)
    startSubmit(async () => {
      const notes = [form.notes, pay !== "local" ? `Pagamento online simulado: ${PAY_LABEL[pay]}` : ""].filter(Boolean).join(" | ")
      const res = await bookAppointment({ serviceIds: selected, professionalId: professional.id, startsAt: slot, ...form, notes })
      if (res.ok) setDone(res.id)
      else toast.error(res.error)
    })
  }

  function next() {
    if (step < last) return setStep(step + 1)
    if (pay === "local") book()
    else setPayDialog(pay)
  }

  if (!professional) return <p className="py-20 text-center text-muted-foreground">Agenda indisponível no momento.</p>

  if (done && slot) {
    const event: CalendarEvent = {
      id: done,
      title: `${chosen.map((s) => s.name).join(" + ")} · Catia Rodrigues Nails`,
      description: `Atendimento com ${professional.name}.`,
      location: address,
      start: new Date(slot),
      end: new Date(new Date(slot).getTime() + totalMin * 60_000),
    }
    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(event))}`
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-lg rounded-3xl border bg-card p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-7" />
        </div>
        <h1 className="mt-5 font-display text-3xl">Horário confirmado</h1>
        <p className="mt-3 text-muted-foreground">
          {chosen.map((s) => s.name).join(" + ")}
          <br />
          <span className="inline-block font-medium text-foreground first-letter:uppercase">{fmtDay(slot)}</span> às{" "}
          <span className="font-medium text-foreground">{fmtTime(slot)}</span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {pay === "local" ? "Pagamento no studio, no dia do atendimento." : `Pagamento aprovado (${PAY_LABEL[pay]}, simulado).`}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          A confirmação foi enviada para <span className="font-medium text-foreground">{form.email}</span>.
        </p>

        <div className="mt-6 rounded-2xl bg-muted/60 p-4">
          <p className="flex items-center justify-center gap-2 text-sm font-medium">
            <CalendarPlus className="size-4" /> Salvar na sua agenda
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>Google</a>
            <a href={icsHref} download="agendamento.ics" className={buttonVariants({ variant: "outline", size: "sm" })}><Download /> iPhone</a>
            <a href={outlookCalendarUrl(event)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>Outlook</a>
          </div>
        </div>
        {demo && <p className="mt-4 text-xs text-muted-foreground">Modo de demonstração: o horário não foi salvo.</p>}
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "mt-4")}>Voltar ao início</Link>
      </motion.div>
    )
  }

  const summary: [string, string][] = [
    ["Serviços", chosen.length ? chosen.map((s) => s.name).join(", ") : "-"],
    ["Data", slot ? fmtDay(slot) : date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "-"],
    ["Horário", slot ? fmtTime(slot) : "-"],
    ["Duração", totalMin ? duration(totalMin) : "-"],
    ["Pagamento", step === last ? PAY_LABEL[pay] : "-"],
  ]

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
        <ol className="grid grid-cols-3 gap-3">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button type="button" disabled={i > step} onClick={() => setStep(i)} className="w-full text-left disabled:cursor-default">
                <span className={cn("block h-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-border")} />
                <span className={cn("mt-2 block text-xs sm:text-sm", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ol>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            {step === 0 && (
              <>
                <h1 className="font-display text-3xl sm:text-4xl">O que vamos fazer?</h1>
                <p className="mt-2 text-muted-foreground">Escolha um ou mais serviços.</p>
                <RepeatLast
                  onFound={({ name, email, phone, serviceIds }) => {
                    setSelected(serviceIds.filter((id) => services.some((s) => s.id === id)))
                    setForm((f) => ({ ...f, name: f.name || name, email, phone }))
                    setStep(1)
                  }}
                />
                <div className="mt-6 grid gap-3">
                  {services.map((s) => {
                    const on = selected.includes(s.id)
                    return (
                      <Label
                        key={s.id}
                        htmlFor={`svc-${s.id}`}
                        className={cn(
                          "flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border bg-background px-5 py-4 font-normal transition-colors hover:border-primary/40",
                          on && "border-primary bg-accent/60"
                        )}
                      >
                        <Checkbox
                          id={`svc-${s.id}`}
                          checked={on}
                          onCheckedChange={(v) => setSelected((cur) => (v ? [...cur, s.id] : cur.filter((x) => x !== s.id)))}
                          className="size-5"
                        />
                        <span className="flex-1">
                          <span className="block text-base font-medium">{s.name}</span>
                          <span className="text-sm text-muted-foreground">{duration(s.duration_min)}</span>
                        </span>
                        <span className="font-semibold tabular-nums">{brl(Number(s.price))}</span>
                      </Label>
                    )
                  })}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="font-display text-3xl sm:text-4xl">Quando fica bom?</h1>
                <p className="mt-2 text-muted-foreground">Só aparecem horários livres para {duration(totalMin)} de atendimento.</p>
                <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
                  <div className="w-fit rounded-2xl border bg-background p-2">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      disabled={[{ before: new Date() }, { after: addDays(new Date(), maxDaysAhead) }]}
                      className="bg-transparent [--cell-size:--spacing(10)]"
                    />
                  </div>
                  <div>
                    {!date ? (
                      <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">Escolha um dia no calendário.</p>
                    ) : loadingSlots || slots === null ? (
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 9 }, (_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)}
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                        Nenhum horário livre neste dia. Tente outra data.
                      </p>
                    ) : (
                      <>
                        <p className="mb-3 text-sm font-medium first-letter:uppercase">{format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
                        <ToggleGroup
                          value={slot ? [slot] : []}
                          onValueChange={(v) => v[0] && setSlot(v[0])}
                          spacing={2}
                          className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4"
                          aria-label="Horários disponíveis"
                        >
                          {slots.map((s) => (
                            <ToggleGroupItem
                              key={s}
                              value={s}
                              variant="outline"
                              className="h-11 w-full rounded-xl bg-background tabular-nums data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground"
                            >
                              {fmtTime(s)}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-3xl sm:text-4xl">Seus dados</h1>
                <p className="mt-2 text-muted-foreground">Usamos para confirmar o horário e avisar se algo mudar.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" autoComplete="name" className="h-12 rounded-xl bg-background" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" inputMode="email" autoComplete="email" className="h-12 rounded-xl bg-background" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">WhatsApp</Label>
                    <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(17) 99999-9999" className="h-12 rounded-xl bg-background" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea id="notes" className="rounded-xl bg-background" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            {step === 3 && <PaymentChoice value={pay} onChange={setPay} total={totalPrice} />}
          </motion.div>
      </div>

      <aside className="rounded-3xl border bg-card p-6 shadow-sm lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">Resumo</h2>
        <dl className="mt-4 divide-y text-sm">
          {summary.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right first-letter:uppercase">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-2 flex items-center justify-between border-t pt-4">
          <span className="font-medium">Total</span>
          <span className="text-xl font-semibold tabular-nums">{brl(totalPrice)}</span>
        </div>
        <div className="mt-6 flex gap-2">
          {step > 0 && (
            <Button variant="outline" size="lg" className="h-12" onClick={() => setStep(step - 1)} aria-label="Voltar">
              <ArrowLeft />
            </Button>
          )}
          <Button size="lg" className="h-12 flex-1" disabled={!canNext || submitting} onClick={next}>
            {submitting && <Loader2 className="animate-spin" />}
            {step < last ? "Continuar" : pay === "pix" ? "Pagar com Pix" : pay === "mp" ? "Pagar com cartão" : "Confirmar agendamento"}
            {step < last && <ArrowRight />}
          </Button>
        </div>
      </aside>

      <PixDialog open={payDialog === "pix"} total={totalPrice} onPaid={book} onClose={() => setPayDialog(null)} />
      <CardDialog open={payDialog === "mp"} total={totalPrice} onPaid={book} onClose={() => setPayDialog(null)} />
    </div>
  )
}
