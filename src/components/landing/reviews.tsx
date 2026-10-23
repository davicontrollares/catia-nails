import { Star } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"
import { REVIEWS } from "@/lib/reviews"

/** Depoimentos reais. Sem itens em src/lib/reviews.ts, a seção não aparece. */
export function Reviews() {
  if (!REVIEWS.length) return null
  return (
    <section aria-label="Depoimentos" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-brand uppercase">Clientes</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">O que dizem as clientes</h2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name + i} delay={i * 0.06}>
            <figure className="h-full border bg-card p-7">
              <div className="flex" aria-label="5 estrelas">
                {Array.from({ length: 5 }, (_, k) => <Star key={k} className="size-4 fill-brand text-brand" />)}
              </div>
              <blockquote className="mt-4 leading-relaxed">{r.text}</blockquote>
              <figcaption className="mt-5 text-sm font-semibold">{r.name}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
