"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Plus } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"
import { serviceImage } from "@/lib/images"
import type { Service } from "@/lib/types"
import { brl, cn, durationLabel } from "@/lib/utils"

/** Vitrine de serviços: abas por categoria e cartões com foto, nome, duração e preço. */
export function ServiceCards({ services }: { services: Service[] }) {
  const categories = [...new Set(services.map((s) => s.category))]
  const [tab, setTab] = useState<string>("Todos")
  const list = tab === "Todos" ? services : services.filter((s) => s.category === tab)

  return (
    <div>
      {categories.length > 1 && (
        <div role="tablist" aria-label="Categorias" className="mb-8 -mx-4 flex gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:gap-9 md:px-0">
          {["Todos", ...categories].map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={tab === c}
              onClick={() => setTab(c)}
              className={cn(
                "shrink-0 border-b-2 pb-2 text-xs font-semibold tracking-[0.2em] uppercase transition-colors",
                tab === c ? "border-foreground text-foreground" : "border-transparent text-muted-foreground/70 hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
        {list.map((s, i) => {
          const img = serviceImage(s.name, s.category)
          return (
            <Reveal key={s.id} delay={(i % 4) * 0.05}>
              <Link href={`/agendar?servico=${s.id}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted sm:rounded-[1.75rem]">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute right-2.5 bottom-2.5 flex size-11 items-center justify-center rounded-full bg-pink text-neutral-900 shadow-lg shadow-black/10 transition-transform group-hover:-translate-y-0.5">
                    <Plus className="size-4" />
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-1 px-0.5 sm:mt-4">
                  <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase">{s.category}</p>
                  <h3 className="font-display text-[1.05rem] leading-snug sm:text-xl">{s.name}</h3>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" /> {durationLabel(s)}
                    </span>
                    <span className="font-semibold whitespace-nowrap tabular-nums">{brl(Number(s.price))}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
