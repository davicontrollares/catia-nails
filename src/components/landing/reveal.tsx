"use client"

import { motion } from "framer-motion"

/** Surge quando entra na tela. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 110, damping: 20, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items]
  return (
    <div className="relative overflow-hidden py-5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max gap-10 motion-safe:animate-[marquee_32s_linear_infinite]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-serif text-2xl text-muted-foreground italic sm:text-3xl">
            {t}
            <span className="size-1.5 rounded-full bg-primary/60" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  )
}
