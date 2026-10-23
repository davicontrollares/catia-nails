"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { addDays, format } from "date-fns"
import { ptBR } from "react-day-picker/locale"
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Download, Loader2, MessageCircle, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { buildIcs, googleCalendarUrl, outlookCalendarUrl, type CalendarEvent } from "@/lib/calendar"
import { serviceImage } from "@/lib/images"
import type { Professional, Service } from "@/lib/types"
import { brl, cn, duration, durationLabel, reserveMin, TZ } from "@/lib/utils"
import { bookAppointment, getSlots } from "./actions"
import { WaitlistButton } from "./waitlist"
import { CardDialog, PAY_LABEL, PaymentSegmented, PixDialog, type PayMethod } from "./payment"

const STEPS = ["Serviço", "Horário", "Confirmar"]
const VIEWS = ["servicos", "data", "confirmar"] as const
const hourOf = (iso: string) => Number(new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", hour12: false, timeZone: TZ }).slice(0, 2))
const PERIODS: [string, (h: number) => boolean][] = [
  ["Manhã", (h) => h < 12],
  ["Tarde", (h) => h >= 12 && h < 18],
  ["Noite", (h) => h >= 18],
]
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
  const [pay, setPay] = useState<PayMethod>("local")
  const [cat, setCat] = useState("Todos")
  const autoPick = useRef(false)
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
        const res = await getSlots(professional.id, format(date, "yyyy-MM-dd"), totalMin)
        setSlots(res)
        if (autoPick.current && res[0]) setSlot(res[0])
        autoPick.current = false
      } catch {
        toast.error("Não foi possível carregar os horários.")
        setSlots([])
      }
    })
  }, [date, professional, totalMin])

  const days = useMemo(() => {
    const base = new Date()
    base.setHours(0, 0, 0, 0)
    return Array.from({ length: Math.min(maxDaysAhead, 30) + 1 }, (_, i) => addDays(base, i))
  }, [maxDaysAhead])
  const categories = useMemo(() => [...new Set(services.map((s) => s.category))], [services])
  const shown = cat === "Todos" ? services : services.filter((s) => s.category === cat)

  // procura o primeiro dia com horário livre para o tempo escolhido
  function nextFree() {
    if (!professional || !totalMin) return
    startSlots(async () => {
      for (const d of days) {
        try {
          const res = await getSlots(professional.id, format(d, "yyyy-MM-dd"), totalMin)
          if (res.length) {
            autoPick.current = true
            setDate(d)
            return
          }
        } catch {
          break
        }
      }
      toast.info("Sem horários livres nos próximos dias. Entre na lista de espera.")
    })
  }

  const canNext =
    view === "confirmar" ? Boolean(form.name && form.email && form.phone) : view === "servicos" ? chosen.length > 0 : Boolean(slot)
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
    const part = (o: Intl.DateTimeFormatOptions) => new Date(slot).toLocaleDateString("pt-BR", { ...o, timeZone: TZ })
    const firstName = form.name.trim().split(" ")[0]
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-xl"
      >
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-pink text-neutral-900">
            <Check className="size-8" />
          </div>
          <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">Tudo certo, {firstName}</h1>
          <p className="mt-3 text-muted-foreground">
            Seu horário está reservado. Enviamos a confirmação para <span className="font-medium text-foreground">{form.email}</span>.
          </p>
        </div>

        <div className="mt-8 border bg-card shadow-xl shadow-brand/10">
          <div className="flex">
            <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-brand-soft px-2 py-6 text-center sm:w-36">
              <span className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">{part({ weekday: "short" }).replace(".", "")}</span>
              <span className="mt-1 font-display text-6xl leading-none sm:text-7xl">{part({ day: "numeric" })}</span>
              <span className="mt-1 text-sm font-semibold capitalize">{part({ month: "long" })}</span>
            </div>
            <div className="min-w-0 flex-1 p-5 sm:p-7">
              <p className="text-xs text-muted-foreground">Horário</p>
              <p className="text-2xl font-bold tabular-nums">{fmtTime(slot)}</p>
              <p className="mt-4 text-xs text-muted-foreground">Serviço</p>
              <p className="font-semibold">{chosen.map((s) => s.name).join(" + ")}</p>
              <p className="text-sm text-muted-foreground">{duration(totalMin)}</p>
            </div>
          </div>
          <dl className="grid gap-3 border-t-2 border-dashed p-5 text-sm sm:px-7">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Onde</dt><dd className="text-right">{address}</dd></div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Pagamento</dt>
              <dd className="text-right">{pay === "local" ? "No studio" : `${PAY_LABEL[pay]} (simulado)`} · {brl(totalPrice)}</dd>
            </div>
          </dl>
        </div>

        {waHref && (
          <a href={waHref} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "lg" }), "mt-5 h-14 w-full rounded-full bg-[#25D366] text-base font-bold text-white hover:bg-[#1fb857]")}>
            <MessageCircle /> Confirmar pelo WhatsApp
          </a>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center border bg-card text-sm font-semibold hover:bg-muted">Google</a>
          <a href={icsHref} download="agendamento.ics" className="flex h-12 items-center justify-center gap-1.5 border bg-card text-sm font-semibold hover:bg-muted"><Download className="size-4" /> iPhone</a>
          <a href={outlookCalendarUrl(event)} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center border bg-card text-sm font-semibold hover:bg-muted">Outlook</a>
        </div>
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><CalendarPlus className="size-3.5" /> Salve na sua agenda para não esquecer.</p>

        <div className="mt-7 flex justify-center gap-7 text-sm font-semibold">
          <Link href="/meus-agendamentos" className="underline underline-offset-[6px]">Remarcar ou cancelar</Link>
          <Link href="/" className="text-muted-foreground">Voltar ao início</Link>
        </div>
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
      <div className="border bg-card p-4 shadow-sm sm:p-8">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold">Reservar</p>
          <p className="text-muted-foreground">{step + 1} de {STEPS.length}</p>
        </div>
        <ol className="mt-3 grid grid-cols-3 gap-1.5" aria-label="Progresso">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button type="button" disabled={i > step} onClick={() => setStep(i)} aria-label={label} className="block w-full py-1 disabled:cursor-default">
                <span className={cn("block h-1 transition-colors", i <= step ? "bg-foreground" : "bg-border")} />
              </button>
            </li>
          ))}
        </ol>

        {step > 0 && (
          <div className="mt-6 grid gap-2">
            <button type="button" onClick={() => setStep(0)} className="flex items-center justify-between gap-4 border bg-background px-4 py-3 text-left text-sm">
              <span className="min-w-0"><span className="block text-xs text-muted-foreground">Serviço</span><span className="block truncate font-medium">{chosen.map((s) => s.name).join(", ")}</span></span>
              <span className="shrink-0 text-xs font-semibold text-brand underline">Alterar</span>
            </button>
            {step > 1 && slot && (
              <button type="button" onClick={() => setStep(1)} className="flex items-center justify-between gap-4 border bg-background px-4 py-3 text-left text-sm">
                <span className="min-w-0"><span className="block text-xs text-muted-foreground">Quando</span><span className="block font-medium first-letter:uppercase">{fmtDay(slot)} às {fmtTime(slot)}</span></span>
                <span className="shrink-0 text-xs font-semibold text-brand underline">Alterar</span>
              </button>
            )}
          </div>
        )}

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6"
        >
          {view === "servicos" && (
            <>
              <h1 className="font-display text-3xl sm:text-4xl">O que vamos fazer?</h1>
              {categories.length > 1 && (
                <div role="tablist" aria-label="Categorias" className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
                  {["Todos", ...categories].map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="tab"
                      aria-selected={cat === c}
                      onClick={() => setCat(c)}
                      className={cn("h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors", cat === c ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/70")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-5 grid gap-2.5">
                {shown.map((s) => {
                  const on = selected.includes(s.id)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSelected((cur) => (on ? cur.filter((x) => x !== s.id) : [...cur, s.id]))}
                      className={cn("flex items-center gap-3.5 border bg-background p-2.5 pr-3 text-left transition-colors hover:border-brand/50", on && "border-brand")}
                    >
                      <span className="relative size-16 shrink-0 overflow-hidden bg-muted">
                        <Image src={serviceImage(s.name, s.category).src} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] leading-snug font-semibold">{s.name}</span>
                        <span className="text-sm text-muted-foreground">{durationLabel(s)} · {brl(Number(s.price))}</span>
                      </span>
                      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full transition-colors", on ? "bg-pink text-neutral-900" : "bg-brand-soft text-foreground")}>
                        {on ? <Check className="size-5" /> : <Plus className="size-5" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {view === "data" && (
            <>
              <h1 className="font-display text-3xl sm:text-4xl">Quando fica bom?</h1>
              <button type="button" onClick={nextFree} disabled={loadingSlots} className="mt-5 flex w-full items-center justify-between bg-brand-soft px-4 py-3.5 text-left">
                <span>
                  <span className="block text-xs text-muted-foreground">Sem pressa de escolher?</span>
                  <span className="block font-semibold">Mostrar o próximo horário livre</span>
                </span>
                <span className="flex h-10 items-center rounded-full bg-pink px-4 text-sm font-semibold text-neutral-900">
                  {loadingSlots ? <Loader2 className="size-4 animate-spin" /> : "Escolher"}
                </span>
              </button>
              <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0" role="listbox" aria-label="Dias">
                {days.map((d) => {
                  const on = date && format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      role="option"
                      aria-selected={Boolean(on)}
                      onClick={() => { setDate(d); setSlot(undefined) }}
                      className={cn("flex h-[74px] w-14 shrink-0 flex-col items-center justify-center border transition-colors", on ? "border-foreground bg-foreground text-background" : "bg-background hover:border-brand/50")}
                    >
                      <span className="text-[11px] uppercase opacity-70">{format(d, "EEE", { locale: ptBR }).slice(0, 3)}</span>
                      <span className="mt-0.5 text-xl font-bold tabular-nums">{format(d, "d")}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-6">
                {!date ? (
                  <p className="border border-dashed p-6 text-sm text-muted-foreground">Escolha um dia para ver os horários livres.</p>
                ) : loadingSlots || slots === null ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 9 }, (_, i) => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="space-y-3 border border-dashed p-6 text-sm text-muted-foreground">
                    <p>Nenhum horário livre neste dia. Tente outro dia ou entre na lista de espera.</p>
                    <WaitlistButton date={format(date, "yyyy-MM-dd")} serviceIds={selected} />
                  </div>
                ) : (
                  <div className="space-y-5">
                    {PERIODS.map(([label, test]) => {
                      const list = slots.filter((x) => test(hourOf(x)))
                      if (!list.length) return null
                      return (
                        <div key={label}>
                          <p className="mb-2 text-sm font-semibold text-muted-foreground">{label}</p>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5" role="radiogroup" aria-label={`Horários da ${label.toLowerCase()}`}>
                            {list.map((x) => (
                              <button
                                key={x}
                                type="button"
                                role="radio"
                                aria-checked={slot === x}
                                onClick={() => setSlot(x)}
                                className={cn("h-12 border font-semibold tabular-nums transition-colors", slot === x ? "border-foreground bg-foreground text-background" : "bg-background hover:border-brand/50")}
                              >
                                {fmtTime(x)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    <p className="text-sm text-muted-foreground">Sem horário bom? <span className="font-semibold text-brand"><WaitlistButton date={format(date, "yyyy-MM-dd")} serviceIds={selected} /></span></p>
                  </div>
                )}
              </div>
            </>
          )}

          {view === "confirmar" && (
            <>
              <h1 className="font-display text-3xl sm:text-4xl">Confirme seu horário</h1>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" autoComplete="name" className="h-12 bg-background" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(17) 99999-9999" className="h-12 bg-background" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" inputMode="email" autoComplete="email" className="h-12 bg-background" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea id="notes" rows={2} className="bg-background" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <p className="mt-6 mb-2 text-sm font-semibold">Pagamento</p>
              <PaymentSegmented value={pay} onChange={setPay} />
              <p className="mt-3 text-xs text-muted-foreground">
                {pay === "local" ? "Você paga no dia do atendimento." : "Demonstração: o pagamento online é simulado e nenhum valor é cobrado."}
              </p>
            </>
          )}
        </motion.div>
      </div>

      <aside className="hidden border bg-card p-6 shadow-sm lg:sticky lg:top-28 lg:block">
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
            {step === 0 ? "Escolher horário" : step < last ? "Continuar" : pay === "pix" ? "Pagar com Pix" : pay === "mp" ? "Pagar com cartão" : "Confirmar horário"}
            {step < last && <ArrowRight />}
          </Button>
        </div>
      </aside>

      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden">
        <div className="glass-strong mx-auto flex max-w-xl items-center gap-2 rounded-[1.75rem] p-2 pl-4">
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
            {step === 0 ? "Escolher horário" : step < last ? "Continuar" : pay === "pix" ? "Pagar com Pix" : pay === "mp" ? "Pagar com cartão" : "Confirmar horário"}
            {step < last && <ArrowRight />}
          </Button>
        </div>
      </div>

      <PixDialog open={payDialog === "pix"} total={totalPrice} onPaid={book} onClose={() => setPayDialog(null)} />
      <CardDialog open={payDialog === "mp"} total={totalPrice} onPaid={book} onClose={() => setPayDialog(null)} />
    </div>
  )
}
