"use client"

import { useMemo, useState } from "react"
import { Check, Phone, Plus, X } from "lucide-react"
import { formatUs, type Studio } from "@/lib/studios"

const TIMES = ["9:00", "9:30", "10:30", "11:00", "12:30", "1:00", "2:00", "3:30", "4:00", "5:00", "5:30", "6:30"]
const priceOf = (p: string) => Number(p.replace(/[^0-9.]/g, "")) || 0
const usd = (n: number) => `$${n}`

/** Reserva simulada: mostra o fluxo de 3 passos, sem enviar nada. */
export function BookingDemo({ studio, onClose }: { studio: Studio; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [dayIdx, setDayIdx] = useState(1)
  const [time, setTime] = useState<string>()
  const [pay, setPay] = useState<"salon" | "card">("salon")
  const [form, setForm] = useState({ name: "", phone: "", email: "" })
  const [done, setDone] = useState(false)

  const days = useMemo(() => {
    const base = new Date()
    base.setHours(0, 0, 0, 0)
    return Array.from({ length: 14 }, (_, i) => new Date(base.getTime() + i * 86_400_000))
  }, [])
  const day = days[dayIdx]
  const chosen = studio.services.filter((s) => picked.includes(s.name))
  const total = chosen.reduce((t, s) => t + priceOf(s.price), 0)
  // alguns horários aparecem ocupados, de forma estável por dia
  const taken = (t: string, i: number) => (t.charCodeAt(0) + t.length + i * 3) % 4 === 0
  const canNext = step === 0 ? chosen.length > 0 : step === 1 ? Boolean(time) : Boolean(form.name && form.phone)
  const label = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", o)

  return (
    <div role="dialog" aria-modal="true" aria-label="Book online" className="fixed inset-0 z-50 overflow-y-auto bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pt-4 pb-32">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{done ? "Booked" : "Book online"}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-11 items-center justify-center rounded-full bg-surface"><X className="size-5" /></button>
        </div>

        {!done && (
          <>
            <div className="mt-3 flex items-center justify-between text-sm text-mute"><span>Step {step + 1} of 3</span></div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((i) => <span key={i} className={`h-1 rounded-full ${i <= step ? "bg-ink" : "bg-ink/15"}`} />)}
            </div>
          </>
        )}

        {!done && step === 0 && (
          <div className="mt-7">
            <h2 className="font-display text-3xl md:text-4xl">What are we doing?</h2>
            <div className="mt-5 grid gap-2.5">
              {studio.services.map((s) => {
                const on = picked.includes(s.name)
                return (
                  <button
                    key={s.name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked((c) => (on ? c.filter((x) => x !== s.name) : [...c, s.name]))}
                    className={`flex items-center gap-3 rounded-2xl border bg-surface/80 p-4 text-left backdrop-blur-xl ${on ? "border-accent" : "border-ink/10"}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-sm text-mute">{s.text}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{s.price}</span>
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${on ? "bg-[var(--btn)] text-[var(--btnink)]" : "bg-soft"}`}>
                      {on ? <Check className="size-5" /> : <Plus className="size-5" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!done && step === 1 && (
          <div className="mt-7">
            <h2 className="font-display text-3xl md:text-4xl">When works for you?</h2>
            <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {days.map((d, i) => (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => { setDayIdx(i); setTime(undefined) }}
                  className={`flex h-[74px] w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${i === dayIdx ? "border-ink bg-ink text-paper" : "border-ink/10 bg-surface"}`}
                >
                  <span className="text-[11px] uppercase opacity-70">{label(d, { weekday: "short" })}</span>
                  <span className="mt-0.5 text-xl font-bold tabular-nums">{d.getDate()}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {TIMES.map((t) => {
                const off = taken(t, dayIdx)
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={off}
                    onClick={() => setTime(t)}
                    className={`h-12 rounded-xl border font-semibold tabular-nums ${time === t ? "border-ink bg-ink text-paper" : "border-ink/10 bg-surface"} ${off ? "opacity-35 line-through" : ""}`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-mute">Sample times for this concept.</p>
          </div>
        )}

        {!done && step === 2 && (
          <div className="mt-7">
            <h2 className="font-display text-3xl md:text-4xl">Confirm your visit</h2>
            <div className="mt-5 rounded-2xl border border-ink/10 bg-surface/80 p-4 text-sm backdrop-blur-xl">
              <p className="font-semibold">{chosen.map((s) => s.name).join(" + ")}</p>
              <p className="mt-1 text-mute">{label(day, { weekday: "long", month: "long", day: "numeric" })} at {time}</p>
            </div>
            <div className="mt-5 grid gap-4">
              {([["name", "Name", "text"], ["phone", "Phone", "tel"], ["email", "Email (optional)", "email"]] as const).map(([k, l, type]) => (
                <div key={k}>
                  <label htmlFor={`bk-${k}`} className="mb-1.5 block text-sm font-semibold">{l}</label>
                  <input id={`bk-${k}`} type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="h-12 w-full rounded-2xl border border-ink/20 bg-surface/80 px-4 text-ink outline-none focus:border-accent" />
                </div>
              ))}
            </div>
            <p className="mt-5 mb-2 text-sm font-semibold">Payment</p>
            <div role="radiogroup" aria-label="Payment" className="grid grid-cols-2 gap-1 rounded-2xl border border-ink/15 bg-surface/80 p-1">
              {([["salon", "At the salon"], ["card", "Card"]] as const).map(([k, l]) => (
                <button key={k} type="button" role="radio" aria-checked={pay === k} onClick={() => setPay(k)} className={`h-11 rounded-xl text-sm font-semibold ${pay === k ? "bg-ink text-paper" : ""}`}>{l}</button>
              ))}
            </div>
            <p className="mt-3 text-xs text-mute">Demo only. Nothing is sent and no card is charged.</p>
          </div>
        )}

        {done && (
          <div className="mt-10 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--btn)] text-[var(--btnink)]"><Check className="size-8" /></div>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">All set, {form.name.split(" ")[0]}</h2>
            <p className="mt-3 text-mute">Your visit is reserved{form.email ? ` and a confirmation goes to ${form.email}` : ""}.</p>
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/85 text-left shadow-xl shadow-ink/10 backdrop-blur-xl">
              <div className="flex">
                <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-soft px-2 py-6 text-center sm:w-36">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-mute uppercase">{label(day, { weekday: "short" })}</span>
                  <span className="mt-1 font-display text-6xl leading-none sm:text-7xl">{day.getDate()}</span>
                  <span className="mt-1 text-sm font-semibold">{label(day, { month: "long" })}</span>
                </div>
                <div className="min-w-0 flex-1 p-5 sm:p-7">
                  <p className="text-xs text-mute">Time</p>
                  <p className="text-2xl font-bold tabular-nums">{time}</p>
                  <p className="mt-4 text-xs text-mute">Service</p>
                  <p className="font-semibold">{chosen.map((s) => s.name).join(" + ")}</p>
                </div>
              </div>
              <dl className="grid gap-3 border-t-2 border-dashed border-ink/15 p-5 text-sm sm:px-7">
                <div className="flex justify-between gap-4"><dt className="text-mute">Where</dt><dd className="text-right">{studio.address}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-mute">Payment</dt><dd className="text-right">{pay === "salon" ? "At the salon" : "Card (demo)"} · from {usd(total)}</dd></div>
              </dl>
            </div>
            <a href={`tel:+${studio.phone}`} className="mt-5 flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--btn)] font-bold text-[var(--btnink)]"><Phone className="size-4" /> Call {formatUs(studio.phone)}</a>
            <button type="button" onClick={onClose} className="mt-6 text-sm font-semibold underline underline-offset-[6px]">Back to the site</button>
          </div>
        )}
      </div>

      {!done && (
        <div className="fixed inset-x-0 bottom-0 z-10 px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-[1.75rem] border border-ink/10 bg-surface/70 p-2 pl-5 shadow-xl shadow-ink/15 backdrop-blur-xl backdrop-saturate-150">
            <div className="mr-auto min-w-0">
              <p className="text-[11px] text-mute">{chosen.length ? `${chosen.length} service${chosen.length > 1 ? "s" : ""}` : "Total"}</p>
              <p className="font-semibold tabular-nums">{chosen.length ? `from ${usd(total)}` : "-"}</p>
            </div>
            {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="h-12 shrink-0 rounded-full border border-ink/20 px-5 text-sm font-semibold">Back</button>}
            <button
              type="button"
              disabled={!canNext}
              onClick={() => (step < 2 ? setStep(step + 1) : setDone(true))}
              className="h-12 min-w-0 flex-1 rounded-full bg-[var(--btn)] px-6 text-sm font-bold text-[var(--btnink)] disabled:opacity-40 sm:flex-none"
            >
              {step === 0 ? "Choose a time" : step === 1 ? "Continue" : "Confirm visit"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
