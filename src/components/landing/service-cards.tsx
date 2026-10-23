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
    <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => {
        const img = serviceImage(s.name, s.category)
        return (
          <Reveal key={s.id} delay={(i % 3) * 0.06}>
            <Link href={`/agendar?servico=${s.id}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-muted">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="glass absolute right-4 bottom-4 flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-foreground transition-transform group-hover:-translate-y-0.5">
                  <Plus className="size-4" /> Agendar
                </span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4 px-1">
                <div>
                  <p className="text-xs font-medium tracking-wide text-brand">{s.category}</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight">{s.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5" /> {durationLabel(s)}
                  </p>
                </div>
                <p className="text-lg font-semibold whitespace-nowrap tabular-nums">{brl(Number(s.price))}</p>
              </div>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
