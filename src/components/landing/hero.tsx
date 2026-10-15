"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { IMAGES } from "@/lib/images"
import { cn } from "@/lib/utils"

const ease = [0.16, 1, 0.3, 1] as const

export function Hero({ whatsapp }: { whatsapp: string | null }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  // a foto principal desce mais devagar que o texto: dá profundidade sem distrair
  const imgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90])
  const detailY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60])

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease, delay },
  })

  return (
    <section
      ref={ref}
      className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-10 px-4 pt-8 pb-12 md:grid-cols-12 md:gap-8 md:px-6"
    >
      <div className="md:col-span-6 lg:col-span-5">
        <motion.p {...enter(0)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="size-4 fill-brand text-brand" />
          5,0 no Google, mais de 100 avaliações
        </motion.p>

        <motion.h1
          {...enter(0.08)}
          className="font-display text-[2.9rem] leading-[1.02] text-balance lg:text-[4.75rem]"
        >
          Unhas finas que parecem <span className="text-brand">naturais.</span>
        </motion.h1>

        <motion.p {...enter(0.18)} className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
          Alongamento em fibra de vidro e banho em gel na Bela Flor, em São José do Rio Preto.
        </motion.p>

        <motion.div {...enter(0.28)} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/agendar" className={cn(buttonVariants({ size: "lg" }), "group h-13 bg-foreground px-7 text-base text-background hover:bg-foreground/85")}>
            Agendar horário
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-13 bg-background/50 px-7 text-base backdrop-blur")}
            >
              WhatsApp
            </a>
          )}
        </motion.div>
      </div>

      <div className="relative md:col-span-6 lg:col-span-6 lg:col-start-7">
        <motion.div
          style={{ y: imgY }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease }}
          className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-3xl bg-muted shadow-2xl shadow-primary/15 md:aspect-[5/6]"
        >
          <Image src={IMAGES.hero.src} alt={IMAGES.hero.alt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </motion.div>

        <motion.div
          style={{ y: detailY }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.45 }}
          className="absolute -bottom-6 -left-4 hidden aspect-square w-40 overflow-hidden rounded-3xl border-4 border-background shadow-xl shadow-foreground/10 sm:block lg:-left-16 lg:w-52"
        >
          <Image src={IMAGES.detail.src} alt={IMAGES.detail.alt} fill sizes="208px" className="object-cover" />
        </motion.div>
      </div>
    </section>
  )
}
