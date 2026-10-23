import Image from "next/image"
import Link from "next/link"
import { Clock, Plus } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"
import { serviceImage } from "@/lib/images"
import type { Service } from "@/lib/types"
import { brl, durationLabel } from "@/lib/utils"

/** Serviços como produtos: foto, nome, duração, preço e atalho para agendar. */
export function ServiceCards({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3">
      {services.map((s, i) => {
        const img = serviceImage(s.name, s.category)
        return (
          <Reveal key={s.id} delay={(i % 3) * 0.06}>
            <Link href={`/agendar?servico=${s.id}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted sm:rounded-[1.75rem]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute right-2.5 bottom-2.5 flex size-11 items-center justify-center gap-1.5 rounded-full bg-pink text-sm font-semibold text-neutral-900 shadow-lg shadow-black/10 transition-transform group-hover:-translate-y-0.5 sm:right-4 sm:bottom-4 sm:w-auto sm:px-4">
                  <Plus className="size-4" /> <span className="hidden sm:inline">Agendar</span>
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-1 px-0.5 sm:mt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-1">
                <div>
                  <p className="text-xs font-medium tracking-wide text-brand">{s.category}</p>
                  <h3 className="mt-1 text-[0.95rem] leading-snug font-semibold tracking-tight sm:text-lg">{s.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5" /> {durationLabel(s)}
                  </p>
                </div>
                <p className="text-base font-semibold whitespace-nowrap tabular-nums sm:text-lg">{brl(Number(s.price))}</p>
              </div>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
