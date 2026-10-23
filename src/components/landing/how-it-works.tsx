import { Reveal } from "@/components/landing/reveal"

const STEPS = [
  { n: "01", title: "Escolha o serviço", text: "Veja os valores e junte mais de um serviço no mesmo horário." },
  { n: "02", title: "Diga quando", text: "Os horários livres aparecem na hora. Escolha o melhor para você." },
  { n: "03", title: "Relaxe, a gente cuida", text: "Você recebe a confirmação por e-mail e é só chegar no horário." },
]

/** Passo a passo do agendamento, em cartões numerados. */
export function HowItWorks() {
  return (
    <section aria-label="Como agendar" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-brand uppercase">Agendar é simples</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Reserve em três passos</h2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.06}>
            <div className="h-full border bg-card p-7 md:p-8">
              <p className="font-display text-5xl leading-none font-light text-brand/60">{s.n}</p>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
