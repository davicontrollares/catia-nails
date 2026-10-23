import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"
import { cn } from "@/lib/utils"
import type { Img } from "@/lib/images"

const ROWS = [
  {
    n: "01",
    title: "Fibra de vidro",
    text: "Alongamento fino e leve, com acabamento que parece natural e dura. Cada unha é moldada para a sua mão.",
  },
  {
    n: "02",
    title: "Banho em gel",
    text: "Mais resistência para a unha natural, com brilho de salão e manutenção simples, no seu ritmo.",
  },
]

/** Blocos alternados: foto grande de um lado, texto no espaço livre do outro. */
export function Showcase({ photos, instagram }: { photos: Img[]; instagram: string | null }) {
  const pics = [photos[4 % photos.length], photos[9 % photos.length]]
  return (
    <section aria-label="Sobre a Bela Flor" className="mx-auto max-w-7xl overflow-hidden px-4 py-16 md:px-6 md:py-28">
      <div className="space-y-20 md:space-y-36">
        {ROWS.map((r, i) => {
          const flip = i % 2 === 1
          const pic = pics[i]
          return (
            <div key={r.n} className="grid items-center gap-8 md:grid-cols-12 md:gap-0">
              <Reveal className={cn("md:col-span-7", flip ? "md:order-2 md:col-start-6" : "md:col-start-1")}>
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image src={pic.src} alt={pic.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
                </div>
              </Reveal>
              <Reveal delay={0.1} className={cn("md:col-span-4", flip ? "md:order-1 md:col-start-1" : "md:col-start-9")}>
                <p className="font-display text-6xl leading-none font-light text-brand/50 md:text-8xl">{r.n}</p>
                <h2 className="mt-5 text-xl font-medium tracking-[0.12em] uppercase md:text-2xl">{r.title}</h2>
                <span className="mt-5 block h-px w-12 bg-foreground/30" />
                <p className="mt-5 max-w-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </Reveal>
            </div>
          )
        })}
      </div>

      <Reveal className="mt-20 md:mt-32">
        <dl className="grid grid-cols-3 gap-6 border-t pt-10 md:max-w-2xl">
          {[
            ["2015", "atendendo desde"],
            ["5 mil+", "atendimentos"],
            ["5,0", "nota no Google"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col-reverse">
              <dt className="mt-1 text-sm text-muted-foreground">{l}</dt>
              <dd className="font-display text-3xl tabular-nums md:text-4xl">{v}</dd>
            </div>
          ))}
        </dl>
        {instagram && (
          <a
            href={`https://instagram.com/${instagram}`}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Mais trabalhos no Instagram @{instagram} <ArrowUpRight className="size-4" />
          </a>
        )}
      </Reveal>
    </section>
  )
}
