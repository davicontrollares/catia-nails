import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"
import { IMAGES } from "@/lib/images"

const ITEMS = [
  { title: "Manicure", text: "Perfeita em cada detalhe", img: IMAGES.experience[0] },
  { title: "Nail art", text: "Mostre o seu estilo", img: IMAGES.experience[1] },
  { title: "Gel e alongamento", text: "Força e elegância", img: IMAGES.experience[2] },
]

/** Faixa de três fotos altas, no estilo editorial das referências. */
export function Experience() {
  return (
    <section className="bg-brand-soft py-16 text-foreground md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-12 md:px-6">
        <Reveal className="md:col-span-4 md:self-center">
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] uppercase opacity-70">Mais que unhas</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">É uma experiência</h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-80">Dos clássicos às ideias mais ousadas, criamos unhas tão únicas quanto você.</p>
          <Link href="/agendar" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-xs font-semibold tracking-[0.2em] text-background uppercase">
            Agendar horário <ArrowUpRight className="size-4" />
          </Link>
        </Reveal>
        <div className="grid grid-cols-3 gap-3 md:col-span-8 md:gap-5">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.06}>
              <Link href="/agendar" className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted md:rounded-3xl">
                  <Image src={it.img.src} alt={it.img.alt} fill sizes="(min-width: 768px) 22vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <p className="mt-3 text-xs font-semibold tracking-[0.18em] uppercase md:text-sm">{it.title}</p>
                <p className="mt-1 hidden text-xs opacity-70 md:block">{it.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
