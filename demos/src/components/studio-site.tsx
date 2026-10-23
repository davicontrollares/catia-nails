"use client"

import Image from "next/image"
import { useRef, useState, type CSSProperties } from "react"
import { Check, ChevronLeft, ChevronRight, Clock, MapPin, Palette, Phone, Star } from "lucide-react"
import { BookingDemo } from "@/components/booking-demo"
import { formatUs, PALETTES, PHOTOS, type PaletteKey, type Studio } from "@/lib/studios"

function Photo({ i, off, className = "", sizes, priority }: { i: number; off: number; className?: string; sizes: string; priority?: boolean }) {
  const p = PHOTOS[(i + off) % PHOTOS.length]
  return (
    <div className={`relative overflow-hidden bg-soft ${className}`}>
      <Image src={p.src} alt={p.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  )
}

export function StudioSite({ studio }: { studio: Studio }) {
  const [key, setKey] = useState<PaletteKey>(studio.palette)
  const [booking, setBooking] = useState(false)
  const [palOpen, setPalOpen] = useState(false)
  const track = useRef<HTMLDivElement>(null)
  const t = PALETTES[key]
  const off = studio.photoOffset
  const vars = {
    "--paper": t.paper, "--surface": t.surface, "--ink": t.ink, "--mute": t.mute, "--accent": t.accent, "--soft": t.soft,
    "--btn": t.btn, "--btnink": t.btnInk, "--display": studio.display,
  } as CSSProperties
  const dark = key === "noite"
  const sheet = dark ? "border-white/15 bg-black/45 text-white" : "border-white/60 bg-white/45 text-neutral-900"
  const heroBg = `linear-gradient(90deg, ${t.heroA} 0%, ${t.heroB} 100%)`
  const tel = `tel:+${studio.phone}`
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${studio.name} ${studio.address}`)}`
  const slide = (d: 1 | -1) => track.current?.scrollBy({ left: d * track.current.clientWidth * 0.8, behavior: "smooth" })
  const hero = PHOTOS[off % PHOTOS.length]

  const callCls = "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--btn)] px-7 text-sm font-semibold text-[var(--btnink)] transition hover:opacity-90"

  return (
    <div style={vars} className="min-h-dvh bg-paper pb-24 text-ink transition-colors duration-300 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/55 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <a href="#top" className="font-display text-xl font-medium">{studio.name}</a>
          <nav className="hidden items-center gap-7 text-sm text-mute md:flex">
            <a href="#services" className="hover:text-ink">Services</a>
            <a href="#about" className="hover:text-ink">About</a>
            <a href="#visit" className="hover:text-ink">Visit</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={palOpen}
                onClick={() => setPalOpen((o) => !o)}
                className="flex h-11 items-center gap-2 rounded-full border border-ink/20 bg-surface px-4 text-sm font-semibold"
              >
                <Palette className="size-4 text-accent" />
                <span>Colors</span>
                <span className="size-3.5 rounded-full border border-ink/20" style={{ background: t.accent }} />
              </button>
              {palOpen && (
                <>
                  <button type="button" aria-label="Close colors" className="fixed inset-0 z-40 cursor-default" onClick={() => setPalOpen(false)} />
                  <div role="dialog" aria-label="Choose a color palette" className="absolute right-0 z-50 mt-2 w-72 rounded-3xl border border-ink/10 bg-surface/80 p-4 shadow-2xl shadow-ink/20 backdrop-blur-xl backdrop-saturate-150">
                    <p className="font-display text-xl">Try another look</p>
                    <p className="mt-1 text-xs leading-relaxed text-mute">This is a preview. Pick a palette to see how the whole site would look in different colors.</p>
                    <div role="radiogroup" aria-label="Color palette" className="mt-3 grid gap-1.5">
                      {(Object.keys(PALETTES) as PaletteKey[]).map((k) => (
                        <button
                          key={k}
                          type="button"
                          role="radio"
                          aria-checked={k === key}
                          onClick={() => setKey(k)}
                          className={`flex h-11 items-center gap-3 rounded-xl border px-3 text-left text-sm font-semibold ${k === key ? "border-ink" : "border-ink/10 hover:border-ink/30"}`}
                        >
                          <span className="flex">
                            {[PALETTES[k].paper, PALETTES[k].accent, PALETTES[k].btn].map((c, i) => (
                              <span key={i} className="-ml-1.5 size-5 rounded-full border border-ink/15 first:ml-0" style={{ background: c }} />
                            ))}
                          </span>
                          <span className="flex-1">{PALETTES[k].label}</span>
                          {k === key && <Check className="size-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button type="button" onClick={() => setBooking(true)} className={`${callCls} hidden h-10 px-5 md:inline-flex`}>Book now</button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-0">
          <div className="relative isolate flex min-h-[calc(100dvh-9rem)] flex-col overflow-hidden rounded-[2.25rem] bg-soft md:hidden">
            <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[center_60%]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/10 to-black/55" />
            <div className="px-6 pt-[16%] text-center text-white">
              <h1 className="font-display text-[2.8rem] leading-[1.05] text-balance">{studio.name}</h1>
              <p className="mt-4 text-sm tracking-wide opacity-90">{studio.tagline}</p>
            </div>
            <div className={`m-3 mt-auto rounded-[1.75rem] border p-4 backdrop-blur-xl backdrop-saturate-150 ${sheet}`}>
              <p className="font-display text-xl leading-tight">{studio.headline[0]} {studio.headline[1]}</p>
              <p className="mt-2 text-xs opacity-75">{studio.blurb}</p>
              <button type="button" onClick={() => setBooking(true)} className="mt-3.5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[var(--btn)] text-base font-semibold text-[var(--btnink)]">
                Book now
              </button>
            </div>
          </div>

          <div className="relative hidden min-h-[36rem] overflow-hidden rounded-[2.5rem] md:flex lg:min-h-[40rem]" style={{ background: heroBg }}>
            <div className="relative z-10 flex flex-1 items-center px-12 lg:px-20">
              <div className="max-w-md py-16">
                <p className="font-display text-xl text-mute italic">{studio.tagline}</p>
                <h1 className="mt-3 font-display text-[3.8rem] leading-[1.02] text-balance lg:text-[4.6rem]">
                  {studio.headline[0]} <span className="text-accent italic">{studio.headline[1]}</span>
                </h1>
                <div className="mt-6 flex items-center gap-3 text-accent" aria-hidden>
                  <span className="h-px w-16 bg-current opacity-40" /><span className="size-1.5 rotate-45 bg-current" /><span className="h-px w-16 bg-current opacity-40" />
                </div>
                <p className="mt-6 text-base leading-relaxed text-mute">{studio.blurb}</p>
                <div className="mt-8 flex items-center gap-6">
                  <button type="button" onClick={() => setBooking(true)} className="inline-flex h-13 items-center rounded-full bg-ink px-9 text-xs font-semibold tracking-[0.22em] text-paper uppercase hover:opacity-85">Book now</button>
                  <a href={maps} target="_blank" rel="noreferrer" className="text-xs font-semibold tracking-[0.22em] uppercase underline underline-offset-8 hover:text-accent">Directions</a>
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 w-[58%] [mask-image:linear-gradient(to_right,transparent,black_35%)]">
              <Image src={hero.src} alt={hero.alt} fill priority sizes="58vw" className="object-cover object-[center_65%]" />
            </div>
            <div className="absolute right-10 bottom-16 z-10 w-72 rounded-[1.75rem] border border-white/50 bg-surface/55 p-5 shadow-xl backdrop-blur-xl backdrop-saturate-150">
              <p className="flex items-center gap-2 text-sm font-semibold"><Star className="size-4 fill-accent text-accent" /> Book in a minute</p>
              <p className="mt-2 text-xs text-mute">{studio.address}</p>
              <button type="button" onClick={() => setBooking(true)} className={`${callCls} mt-4 w-full`}>Book now</button>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="relative z-10 mx-auto -mt-2 max-w-7xl px-4 md:-mt-10 md:px-10">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-ink/10 shadow-xl shadow-ink/10 md:grid-cols-4">
            {[
              ["Clean & calm", "A relaxing space"],
              ["Made for you", "Your shape, your color"],
              ["Nail art", "From simple to bold"],
              ["Easy booking", "Call and we handle it"],
            ].map(([title, text]) => (
              <li key={title} className="flex flex-col items-center gap-2 bg-surface/70 px-4 py-6 text-center backdrop-blur-xl">
                <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase">{title}</p>
                <p className="hidden text-xs text-mute md:block">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Serviços deslizantes */}
        <section id="services" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 md:px-6 md:py-24">
          <h2 className="font-display text-4xl md:text-5xl">Services</h2>
          <p className="mt-3 max-w-lg text-mute">Slide to see the menu. Ask us about anything you do not see here.</p>
          <div ref={track} className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
            {studio.services.map((s, i) => (
              <a key={s.name} href={tel} className="block w-[62%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[24%]">
                <Photo i={i + 3} off={off} sizes="(min-width:1024px) 25vw, 60vw" className="aspect-[4/5] rounded-2xl md:rounded-3xl" />
                <p className="mt-3 text-[0.65rem] font-semibold tracking-[0.2em] text-accent uppercase">{s.price}</p>
                <h3 className="mt-1 font-display text-xl leading-snug">{s.name}</h3>
                <p className="mt-1 text-sm text-mute">{s.text}</p>
              </a>
            ))}
          </div>
          <div className="mt-6 hidden items-center justify-between md:flex">
            <p className="text-xs text-mute">Sample menu for this concept. Final services and prices to be confirmed with the salon.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => slide(-1)} aria-label="Previous services" className="flex size-11 items-center justify-center rounded-full border border-ink/15 bg-surface hover:opacity-80"><ChevronLeft className="size-5" /></button>
              <button type="button" onClick={() => slide(1)} aria-label="Next services" className="flex size-11 items-center justify-center rounded-full border border-ink/15 bg-surface hover:opacity-80"><ChevronRight className="size-5" /></button>
            </div>
          </div>
        </section>

        {/* Experiência */}
        <section className="bg-soft py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-12 md:px-6">
            <div className="md:col-span-4 md:self-center">
              <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-mute uppercase">More than nails</p>
              <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">It&apos;s an experience</h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-mute">From timeless classics to bold statements, we create looks that are as unique as you are.</p>
              <button type="button" onClick={() => setBooking(true)} className="mt-7 inline-flex h-12 items-center rounded-full bg-ink px-7 text-xs font-semibold tracking-[0.2em] text-paper uppercase">Book now</button>
            </div>
            <div className="grid grid-cols-3 gap-3 md:col-span-8 md:gap-5">
              {[["Manicure", "Perfect in every detail"], ["Nail art", "Express your style"], ["Pedicure & spa", "Strength and comfort"]].map(([title, text], i) => (
                <div key={title}>
                  <Photo i={i + 6} off={off} sizes="(min-width:768px) 22vw, 33vw" className="aspect-[3/4] rounded-2xl md:rounded-3xl" />
                  <p className="mt-3 text-xs font-semibold tracking-[0.18em] uppercase md:text-sm">{title}</p>
                  <p className="mt-1 hidden text-xs text-mute md:block">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blocos alternados */}
        <section className="mx-auto max-w-7xl overflow-hidden px-4 py-16 md:px-6 md:py-28">
          <div className="space-y-20 md:space-y-36">
            {[
              { n: "01", title: "Our signature", text: "Clean shapes, smooth finishes and details that last. Every set is made around your hands.", ph: 2 },
              { n: "02", title: "Your color story", text: "Soft neutrals, bold brights or something in between. Bring an idea and we make it yours.", ph: 5 },
            ].map((r, i) => (
              <div key={r.n} className="grid items-center gap-8 md:grid-cols-12 md:gap-0">
                <div className={`md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : "md:col-start-1"}`}>
                  <Photo i={r.ph} off={off} sizes="(min-width:768px) 58vw, 100vw" className="aspect-[4/3] rounded-[2rem] md:rounded-[2.5rem]" />
                </div>
                <div className={`md:col-span-4 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-9"}`}>
                  <p className="font-display text-6xl leading-none font-light text-accent/50 md:text-8xl">{r.n}</p>
                  <h2 className="mt-5 text-xl font-medium tracking-[0.12em] uppercase md:text-2xl">{r.title}</h2>
                  <span className="mt-5 block h-px w-12 bg-ink/30" />
                  <p className="mt-5 max-w-sm leading-relaxed text-mute">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quem somos */}
        <section id="about" className="scroll-mt-20 bg-soft py-16 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-12 md:gap-0 md:px-6">
            <div className="md:col-span-5">
              <Photo i={1} off={off} sizes="(min-width:768px) 40vw, 100vw" className="aspect-[4/5] rounded-2xl md:rounded-3xl" />
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-accent uppercase">About us</p>
              <h2 className="mt-3 font-display text-4xl leading-tight text-balance md:text-5xl">A neighborhood nail studio in DeBary</h2>
              <p className="mt-5 max-w-lg leading-relaxed text-mute">{studio.name} is a place to unwind and leave with nails you love. [Short story of the salon goes here, to be written with the owner.]</p>
              <ul className="mt-7 space-y-3 border-t border-ink/15 pt-7 text-sm">
                {["Manicures, pedicures and nail art", "A clean and relaxing space", "Easy booking by phone"].map((p) => (
                  <li key={p} className="flex items-start gap-3"><span className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-accent" />{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section id="visit" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 md:px-6 md:py-24">
          <h2 className="font-display text-4xl md:text-5xl">Visit us</h2>
          <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
            <div className="space-y-8">
              {[
                { Icon: MapPin, title: "Address", body: studio.address, href: undefined as string | undefined },
                { Icon: Phone, title: "Phone", body: formatUs(studio.phone), href: tel },
                { Icon: Clock, title: "Hours", body: "Call us for today's hours.", href: undefined as string | undefined },
              ].map(({ Icon, title, body, href }) => (
                <div key={title} className="flex gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-soft text-accent"><Icon className="size-5" /></span>
                  <div>
                    <p className="font-medium">{title}</p>
                    {href ? <a href={href} className="mt-1 block text-mute hover:text-ink">{body}</a> : <p className="mt-1 max-w-sm text-mute">{body}</p>}
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setBooking(true)} className={callCls}>Book now</button>
                <a href={maps} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-full border border-ink/25 px-7 text-sm font-semibold hover:opacity-80">Open in Maps</a>
              </div>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-ink/10 bg-soft shadow-sm">
              <iframe
                title={`Map: ${studio.address}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${studio.name} ${studio.address}`)}&output=embed`}
                className="size-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/10 px-4 py-12 text-center">
        <p className="font-display text-3xl">{studio.name}</p>
        <p className="mt-2 text-sm text-mute">{studio.address}</p>
        <p className="mt-6 text-xs text-mute">Design concept for demonstration only. Not the official website of this business. Sample photos from Pexels.</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <button type="button" onClick={() => setBooking(true)} className={`${callCls} w-full shadow-xl shadow-black/20`}>Book now</button>
      </div>
    {booking && <BookingDemo studio={studio} onClose={() => setBooking(false)} />}
    </div>
  )
}
