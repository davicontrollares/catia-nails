"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, CalendarCheck, MessageCircle, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { IMAGES } from "@/lib/images"
import { brl, cn } from "@/lib/utils"

const spring = { type: "spring", stiffness: 120, damping: 20 } as const

function Words({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.4em", filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...spring, delay: delay + i * 0.06 }}
        >
          {w}{" "}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero({
  whatsapp,
  featured,
}: {
  whatsapp: string | null
  featured: { name: string; price: number }
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 60])
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative isolate -mt-20 flex min-h-[100svh] items-center overflow-hidden px-4 pt-28 pb-16">
      <motion.div style={{ y: orbY }} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[12%] left-[8%] size-[42vmax] rounded-full bg-[var(--mesh-1)] opacity-70 blur-3xl motion-safe:animate-[float_14s_ease-in-out_infinite]" />
        <div className="absolute right-[-10%] bottom-[5%] size-[36vmax] rounded-full bg-[var(--mesh-2)] opacity-60 blur-3xl motion-safe:animate-[float_18s_ease-in-out_infinite_reverse]" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div className="text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
            <Badge variant="secondary" className="glass-subtle mb-6 h-8 gap-1.5 rounded-full px-3 text-xs">
              <Star className="size-3.5 fill-[var(--gold)] text-[var(--gold)]" />
              Nota 5,0 no Google
            </Badge>
          </motion.div>

          <h1 className="font-serif text-[clamp(3rem,8vw,5.6rem)] leading-[0.92] font-medium tracking-[-0.02em] text-balance">
            <Words text="Unhas em gel e fibra de vidro" />
            <Words text="com acabamento fino." delay={0.35} className="italic text-primary" />
          </h1>

          <motion.p
            className="mx-auto mt-6 max-w-md text-lg text-pretty text-muted-foreground lg:mx-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Catia atende desde 2015 em São José do Rio Preto. Escolha o serviço, veja os horários livres e marque na hora.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.95 }}
          >
            <Link href="/agendar" className={cn(buttonVariants({ size: "lg" }), "group h-14 px-8 text-base bg-foreground text-background shadow-lg shadow-foreground/20 hover:bg-foreground/85")}>
              Ver horários livres
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "glass-subtle h-14 px-8 text-base")}
              >
                <MessageCircle /> WhatsApp
              </a>
            )}
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-md pb-10 lg:max-w-none">
          <motion.div
            style={{ y: imgY }}
            initial={{ opacity: 0, scale: 1.06, clipPath: "inset(12% 12% 12% 12% round 2.5rem)" }}
            animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 2.5rem)" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl"
          >
            <Image src={IMAGES.hero.src} alt={IMAGES.hero.alt} fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            style={{ y: cardY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.9 }}
            className="glass-strong absolute right-3 bottom-0 left-3 rounded-[1.75rem] p-4 sm:right-auto sm:-left-8 sm:w-80"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Próximo horário</p>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-2 animate-pulse rounded-full bg-current" /> Livre
              </span>
            </div>
            <p className="mt-1 text-lg font-semibold tracking-tight">{featured.name}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["09:00", "10:30", "14:00"].map((t, i) => (
                <div
                  key={t}
                  className={cn(
                    "rounded-xl py-2 text-center text-sm font-medium tabular-nums",
                    i === 1 ? "bg-primary text-primary-foreground shadow-md" : "glass-subtle"
                  )}
                >
                  {t}
                </div>
              ))}
            </div>
            <Link href="/agendar" className={cn(buttonVariants(), "mt-3 h-11 w-full")}>
              <CalendarCheck /> Reservar · {brl(featured.price)}
            </Link>
          </motion.div>

          <motion.div
            className="glass absolute top-6 -right-2 rounded-2xl px-4 py-3 text-sm shadow-xl sm:-right-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{ opacity: { delay: 1.1 }, scale: { delay: 1.1 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          >
            <p className="font-semibold">+5 mil</p>
            <p className="text-xs text-muted-foreground">atendimentos</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
