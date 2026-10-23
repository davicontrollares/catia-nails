"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, CalendarCheck, MessageCircle, Sparkles, Star } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { IMAGES } from "@/lib/images"
import { cn } from "@/lib/utils"

const ease = [0.16, 1, 0.3, 1] as const

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease, delay },
})

/** Celular: foto cheia com texto por cima, no estilo de app. Desktop: texto e foto lado a lado. */
export function Hero({ whatsapp }: { whatsapp: string | null }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70])
  const detailY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50])

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 pt-4 pb-10 md:px-6 md:pt-8 md:pb-16">
      {/* Mobile */}
      <div className="relative isolate flex min-h-[calc(100dvh-9.5rem)] flex-col justify-end overflow-hidden rounded-[2rem] bg-muted md:hidden">
        <Image src={IMAGES.hero.src} alt={IMAGES.hero.alt} fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[oklch(0.2_0.03_350/0.88)] via-[oklch(0.2_0.03_350/0.35)] to-transparent" />
        <div className="p-6 pb-7 text-white">
          <motion.p {...enter(0)} className="mb-4 flex items-center gap-1.5 text-xs tracking-wide text-white/85">
            <Star className="size-3.5 fill-white text-white" />
            5,0 no Google · mais de 100 avaliações
          </motion.p>
          <motion.h1 {...enter(0.08)} className="font-display text-[2.6rem] leading-[1.05] text-balance">
            Unhas finas que parecem naturais.
          </motion.h1>
          <motion.p {...enter(0.16)} className="mt-3 text-[0.95rem] leading-relaxed text-white/85">
            Alongamento em fibra de vidro e banho em gel, em São José do Rio Preto.
          </motion.p>
          <motion.div {...enter(0.24)} className="mt-6 flex gap-2.5">
            <Link href="/agendar" className={cn(buttonVariants({ size: "lg" }), "h-13 flex-1 rounded-full bg-pink text-base font-semibold text-neutral-900 hover:bg-pink/85")}>
              Agendar horário
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Chamar no WhatsApp"
                className="glass-strong flex size-13 shrink-0 items-center justify-center rounded-full text-foreground"
              >
                <MessageCircle className="size-5" />
              </a>
            )}
          </motion.div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden min-h-[calc(100dvh-10rem)] items-center gap-12 md:grid md:grid-cols-12">
        <div className="md:col-span-6">
          <motion.p {...enter(0)} className="mb-6 text-xs font-medium tracking-[0.22em] text-brand uppercase">
            Nail studio · São José do Rio Preto
          </motion.p>
          <motion.h1 {...enter(0.08)} className="font-display text-[4.4rem] leading-[1.02] text-balance lg:text-[5.4rem]">
            Unhas finas que parecem <span className="text-brand italic">naturais.</span>
          </motion.h1>
          <motion.p {...enter(0.18)} className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Alongamento em fibra de vidro e banho em gel, com acabamento fino e atendimento com hora marcada.
          </motion.p>
          <motion.div {...enter(0.28)} className="mt-9 flex gap-3">
            <Link href="/agendar" className={cn(buttonVariants({ size: "lg" }), "group h-13 rounded-full bg-pink px-8 text-base font-semibold text-neutral-900 hover:bg-pink/85")}>
              Agendar horário
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-13 bg-background/50 px-8 text-base backdrop-blur")}
              >
                WhatsApp
              </a>
            )}
          </motion.div>
          <motion.p {...enter(0.36)} className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex">
              {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-4 fill-brand text-brand" />)}
            </span>
            5,0 no Google, mais de 100 avaliações
          </motion.p>
        </div>

        <div className="relative md:col-span-6">
          <motion.div
            style={{ y: imgY }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease }}
            className="relative aspect-[5/6] overflow-hidden rounded-[2.5rem] bg-muted shadow-2xl shadow-primary/15"
          >
            <Image src={IMAGES.hero.src} alt={IMAGES.hero.alt} fill priority sizes="50vw" className="object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.6 }}
            className="glass-strong absolute right-6 bottom-8 w-72 rounded-[1.75rem] p-5"
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
          <motion.div
            style={{ y: detailY }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease, delay: 0.45 }}
            className="absolute -bottom-6 -left-10 aspect-square w-44 overflow-hidden rounded-3xl border-4 border-background shadow-xl shadow-foreground/10 lg:-left-16 lg:w-52"
          >
            <Image src={IMAGES.detail.src} alt={IMAGES.detail.alt} fill sizes="208px" className="object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
