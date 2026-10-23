"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { addDays, format } from "date-fns"
import { ptBR } from "react-day-picker/locale"
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Download, Loader2, MessageCircle } from "lucide-react"
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
import { serviceImage } from "@/lib/images"
import type { Professional, Service } from "@/lib/types"
import { brl, cn, duration, durationLabel, reserveMin, TZ } from "@/lib/utils"
import { bookAppointment, getSlots } from "./actions"
import { WaitlistButton } from "./waitlist"
import { CardDialog, PAY_LABEL, PaymentChoice, PixDialog, type PayMethod } from "./payment"

const STEPS = ["Serviços", "Data e hora", "Seus dados", "Pagamento"]
const VIEWS = ["servicos", "data", "dados", "pagamento"] as const
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })
const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ })

export function BookingWizard({
  services,
  professionals,
  maxDaysAhead,
  initialServiceId,
  address,
  whatsapp,
}: {
  services: Service[]
  professionals: Professional[]
  maxDaysAhead: number
  initialServiceId?: string
  address: string
  whatsapp: string | null
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
  const view = VIEWS[step]
  const [loadingSlots, startSlots] = useTransition()
  const [submitting, startSubmit] = useTransition()

  const chosen = useMemo(() => services.filter((s) => selected.includes(s.id)), [services, selected])
  const totalMin = chosen.reduce((t, s) => t + reserveMin(s), 0)
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
    view === "dados" ? Boolean(form.name && form.email && form.phone) : view === "servicos" ? chosen.length > 0 : view === "data" ? Boolean(slot) : true
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
      title: `${chosen.map((s) => s.name).join(" + ")} · Bela Flor Nails`,
      description: `Atendimento com ${professional.name}.`,
      location: address,
      start: new Date(slot),
      end: new Date(new Date(slot).getTime() + totalMin * 60_000),
    }
    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(event))}`
    // mensagem pronta para a cliente confirmar com o studio
    const waText = [
      `Olá! Sou ${form.name} e acabei de agendar pelo site:`,
      `${chosen.map((s) => s.name).join(" + ")}`,
      `${fmtDay(slot)} às ${fmtTime(slot)}`,
      `Total: ${brl(totalPrice)} (${pay === "local" ? "pagar no studio" : `${PAY_LABEL[pay]}, pago`})`,
    ].join(String.fromCharCode(10))
    const waHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(waText)}` : null
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

        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "mt-6 h-12 w-full bg-[#25D366] text-white hover:bg-[#1fb857]")}
          >
            <MessageCircle /> Confirmar pelo WhatsApp
          </a>
        )}

        <div className="mt-4 rounded-2xl bg-muted/60 p-4">
          <p className="flex items-center justify-center gap-2 text-sm font-medium">
            <CalendarPlus className="size-4" /> Salvar na sua agenda
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>Google</a>
            <a href={icsHref} download="agendamento.ics" className={buttonVariants({ variant: "outline", size: "sm" })}><Download /> iPhone</a>
            <a href={outlookCalendarUrl(event)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>Outlook</a>
          </div>
        </div>
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
    <div className="mx-auto grid max-w-6xl gap-6 pb-12 lg:pb-0 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="rounded-3xl border bg-card p-4 shadow-sm sm:p-8">
        <ol className="grid grid-cols-4 gap-2 sm:gap-3">
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
            {view === "servicos" && (
              <>
                <h1 className="font-display text-3xl sm:text-4xl">O que vamos fazer?</h1>
                <p className="mt-2 text-muted-foreground">Escolha um ou mais serviços.</p>
                <div className="mt-6 grid gap-3">
                  {services.map((s) => {
                    const on = selected.includes(s.id)
                    return (
                      <Label
                        key={s.id}
                        htmlFor={`svc-${s.id}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-2xl border bg-background p-2.5 pr-4 font-normal transition-colors hover:border-brand/50 sm:gap-4",
                          on && "border-brand bg-brand-soft/60"
                        )}
                      >
                        <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                          <Image src={serviceImage(s.name, s.category).src} alt="" fill sizes="64px" className="object-cover" />
                          <Checkbox
                            id={`svc-${s.id}`}
                            checked={on}
                            onCheckedChange={(v) => setSelected((cur) => (v ? [...cur, s.id] : cur.filter((x) => x !== s.id)))}
                            className="absolute top-1.5 left-1.5 size-5 border-white bg-white/80 shadow-sm"
                          />
                        </span>
                        <span className="flex-1">
                          <span className="block text-[15px] leading-snug font-medium">{s.name}</span>
                          <span className="text-sm text-muted-foreground">{durationLabel(s)}</span>
                        </span>
                        <span className="font-semibold tabular-nums">{brl(Number(s.price))}</span>
                      </Label>
                    )
                  })}
                </div>
              </>
            )}

            {view === "data" && (
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
                      <div className="space-y-3 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                        <p>Nenhum horário livre neste dia. Tente outra data ou entre na lista de espera.</p>
                        <WaitlistButton date={format(date, "yyyy-MM-dd")} serviceIds={selected} />
                      </div>
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

            {view === "dados" && (
              <>
                <h1 className="font-display text-3xl sm:text-4xl">Vamos começar</h1>
                <p className="mt-2 text-muted-foreground">Quase lá. Só precisamos de como falar com você.</p>
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

            {view === "pagamento" && <PaymentChoice value={pay} onChange={setPay} total={totalPrice} />}
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
        <div className="mt-6 hidden gap-2 lg:flex">
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

      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden">
        <div className="glass-strong mx-auto flex max-w-xl items-center gap-2 rounded-3xl p-2 pl-4">
          <div className="mr-auto min-w-0">
            <p className="text-[11px] text-muted-foreground">{chosen.length ? `${chosen.length} ${chosen.length > 1 ? "serviços" : "serviço"}${totalMin ? ` · ${duration(totalMin)}` : ""}` : "Total"}</p>
            <p className="font-semibold tabular-nums">{brl(totalPrice)}</p>
          </div>
          {step > 0 && (
            <Button variant="outline" size="lg" className="h-12 shrink-0" onClick={() => setStep(step - 1)} aria-label="Voltar">
              <ArrowLeft />
            </Button>
          )}
          <Button size="lg" className="h-12 min-w-0 flex-1 basis-0 sm:flex-none sm:basis-auto" disabled={!canNext || submitting} onClick={next}>
            {submitting && <Loader2 className="animate-spin" />}
            {step < last ? "Continuar" : pay === "pix" ? "Pagar com Pix" : pay === "mp" ? "Pagar com cartão" : "Confirmar agendamento"}
            {step < last && <ArrowRight />}
          </Button>
        </div>
      </div>

      <PixDialog open={payDialog === "pix"} total={totalPrice} onPaid={book} onClose={() => setPayDialog(null)} />
      <CardDialog open={payDialog === "mp"} total={totalPrice} onPaid={book} onClose={() => setPayDialog(null)} />
    </div>
  )
}
