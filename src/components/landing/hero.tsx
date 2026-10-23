"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { CalendarCheck, MessageCircle, Sparkles, Star } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { IMAGES } from "@/lib/images"
import { cn } from "@/lib/utils"

const ease = [0.16, 1, 0.3, 1] as const

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease, delay },
})

/** Celular: foto cheia com texto por cima, no estilo de app. Desktop: faixa larga com foto à direita. */
export function Hero({ whatsapp }: { whatsapp: string | null }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60])

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-0">
      {/* Mobile: marca no meio da foto e cartão de reserva rosa embaixo */}
      <div className="relative isolate min-h-[calc(100dvh-8.5rem)] overflow-hidden bg-muted md:hidden">
        <Image src={IMAGES.hero.src} alt={IMAGES.hero.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[center_70%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[oklch(0.5_0.13_355/0.55)] via-[oklch(0.5_0.13_355/0.1)] to-[oklch(0.4_0.12_355/0.55)]" />
        <div className="absolute inset-x-0 top-[17%] px-6 text-center text-white">
          <motion.h1 {...enter(0)} className="font-display text-[3.1rem] leading-[1.02] font-normal text-balance [text-shadow:0_2px_30px_oklch(0.4_0.12_355/0.5)]">
            Bela Flor
            <span className="block text-[1.5rem] tracking-[0.32em] uppercase opacity-95">Nails</span>
          </motion.h1>
          <motion.p {...enter(0.1)} className="mt-4 text-sm tracking-wide opacity-90">
            Unhas finas que parecem naturais
          </motion.p>
        </div>
        <motion.div
          {...enter(0.2)}
          className="absolute inset-x-3 bottom-3 border border-white/70 bg-white/80 p-4 text-neutral-900 shadow-xl shadow-[oklch(0.4_0.12_355/0.3)] backdrop-blur-md dark:border-white/10 dark:bg-[oklch(0.22_0.03_350/0.92)] dark:text-white"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
              <Image src={IMAGES.detail.src} alt={IMAGES.detail.alt} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-pink/60 px-3 py-0.5 text-[0.68rem] font-semibold">Agenda aberta</span>
              <p className="mt-1 font-display text-lg leading-tight">Fibra de vidro e banho em gel</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold">
              <Star className="size-3.5 fill-current" /> 5,0
            </span>
          </div>
          <div className="mt-3.5 grid grid-cols-2 gap-3 border-t border-neutral-900/10 pt-3.5 text-xs dark:border-white/15">
            <div>
              <p className="opacity-60">Passo a passo</p>
              <p className="mt-0.5 font-semibold">Serviço, horário, dados</p>
            </div>
            <div className="border-l border-neutral-900/10 pl-3 dark:border-white/15">
              <p className="opacity-60">Confirmação</p>
              <p className="mt-0.5 font-semibold">Por e-mail</p>
            </div>
          </div>
          <div className="mt-3.5 flex gap-2.5">
            <Link href="/agendar" className={cn(buttonVariants({ size: "lg" }), "h-13 flex-1 rounded-full bg-pink text-base font-semibold text-neutral-900 hover:bg-pink/85")}>
              Agendar horário
            </Link>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chamar no WhatsApp" className="flex size-13 shrink-0 items-center justify-center rounded-full bg-pink/40">
                <MessageCircle className="size-5" />
              </a>
            )}
          </div>
          <p className="mt-2.5 text-center text-[0.68rem] opacity-65">Cancele ou remarque pelo site, sem complicação.</p>
        </motion.div>
      </div>

      {/* Desktop: faixa larga, texto sobre creme e foto à direita */}
      <div className="relative hidden min-h-[36rem] overflow-hidden bg-gradient-to-r from-[oklch(0.975_0.02_40)] via-[oklch(0.96_0.03_20)] to-[oklch(0.93_0.05_5)] dark:from-[oklch(0.22_0.03_350)] dark:via-[oklch(0.24_0.04_355)] dark:to-[oklch(0.29_0.06_355)] md:block lg:min-h-[40rem]">
        <motion.div
          style={{ y: imgY }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease }}
          className="absolute inset-y-0 right-0 w-[62%] [mask-image:linear-gradient(to_right,transparent,black_38%)]"
        >
          <Image src={IMAGES.hero.src} alt={IMAGES.hero.alt} fill priority sizes="62vw" className="object-cover object-[center_65%]" />
        </motion.div>

        <div className="relative flex min-h-[inherit] items-center px-12 lg:px-20">
          <div className="max-w-md py-16">
            <motion.p {...enter(0)} className="font-display text-xl text-foreground/70 italic">
              Nail studio · São José do Rio Preto
            </motion.p>
            <motion.h1 {...enter(0.08)} className="mt-3 font-display text-[4rem] leading-[1.02] text-balance lg:text-[4.8rem]">
              Unhas finas que parecem <span className="text-brand italic">naturais.</span>
            </motion.h1>
            <motion.div {...enter(0.16)} className="mt-6 flex items-center gap-3 text-brand" aria-hidden>
              <span className="h-px w-16 bg-current/40" />
              <span className="size-1.5 rotate-45 bg-current" />
              <span className="h-px w-16 bg-current/40" />
            </motion.div>
            <motion.p {...enter(0.22)} className="mt-6 text-base leading-relaxed text-muted-foreground">
              Alongamento em fibra de vidro e banho em gel, com acabamento fino e atendimento com hora marcada.
            </motion.p>
            <motion.div {...enter(0.3)} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/agendar"
                className={cn(buttonVariants({ size: "lg" }), "h-13 rounded-md bg-foreground px-9 text-xs font-semibold tracking-[0.22em] text-background uppercase hover:bg-foreground/85 dark:bg-pink dark:text-neutral-900 dark:hover:bg-pink/85")}
              >
                Agendar horário
              </Link>
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="text-xs font-semibold tracking-[0.22em] uppercase underline underline-offset-8 hover:text-brand">
                  WhatsApp
                </a>
              )}
            </motion.div>
            <motion.p {...enter(0.38)} className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-4 fill-brand text-brand" />)}
              </span>
              5,0 no Google, mais de 100 avaliações
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.6 }}
          className="glass-strong absolute right-10 bottom-16 w-72 p-5"
        >
          <p className="flex items-center gap-2 text-sm font-semibold">
            <CalendarCheck className="size-4 text-brand" /> Seu horário em 1 minuto
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Serviço", "Data e hora", "Dados"].map((c) => (
              <span key={c} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-foreground/80">{c}</span>
            ))}
          </div>
          <Link href="/agendar" className="mt-4 flex h-11 items-center justify-center gap-2 rounded-full bg-pink text-sm font-semibold text-neutral-900 transition hover:bg-pink/85">
            <Sparkles className="size-4" /> Agendar agora
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
