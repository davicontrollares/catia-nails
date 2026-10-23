import Image from "next/image"
import { Reveal } from "@/components/landing/reveal"
import { IMAGES } from "@/lib/images"

const POINTS = [
  "Alongamento em fibra de vidro e banho em gel",
  "Agenda online com confirmação por e-mail",
  "Cancele ou remarque pelo site",
]

/** Apresentação do studio: foto de um lado, texto e compromissos do outro. */
export function About() {
  return (
    <section id="sobre" className="scroll-mt-24 bg-brand-soft py-16 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-12 md:gap-0 md:px-6">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted">
            <Image src={IMAGES.about.src} alt={IMAGES.about.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-6 md:col-start-7">
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-brand uppercase">Quem somos</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-balance md:text-5xl">Um studio feito para quem gosta de unhas bem cuidadas</h2>
          <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
            A Bela Flor faz unhas desde 2015 e já passou de 5 mil atendimentos. O foco é deixar cada unha fina, bem acabada e com durabilidade, no seu tempo.
          </p>
          <ul className="mt-7 space-y-3 border-t pt-7">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-brand" />
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
