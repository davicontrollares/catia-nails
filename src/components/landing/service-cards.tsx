"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"
import { serviceImage } from "@/lib/images"
import type { Service } from "@/lib/types"
import { brl, cn, durationLabel } from "@/lib/utils"

/** Vitrine de serviços: abas por categoria e cartões com foto, nome, duração e preço. */
export function ServiceCards({ services }: { services: Service[] }) {
  const categories = [...new Set(services.map((s) => s.category))]
  const [tab, setTab] = useState<string>("Todos")
  const list = tab === "Todos" ? services : services.filter((s) => s.category === tab)
  const track = useRef<HTMLDivElement>(null)
  const slide = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" })

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

      <div ref={track} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {list.map((s, i) => {
          const img = serviceImage(s.name, s.category)
          return (
            <Reveal key={s.id} delay={(i % 4) * 0.05} className="w-[62%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[24%]">
              <Link href={`/agendar?servico=${s.id}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
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

      <div className="mt-6 hidden justify-end gap-2 md:flex">
        <button type="button" onClick={() => slide(-1)} aria-label="Serviços anteriores" className="flex size-11 items-center justify-center rounded-full border bg-card transition hover:bg-muted">
          <ChevronLeft className="size-5" />
        </button>
        <button type="button" onClick={() => slide(1)} aria-label="Próximos serviços" className="flex size-11 items-center justify-center rounded-full border bg-card transition hover:bg-muted">
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  )
}
