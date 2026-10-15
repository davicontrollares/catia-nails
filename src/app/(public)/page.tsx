import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { Hero } from "@/components/landing/hero"
import { Marquee, Reveal } from "@/components/landing/reveal"
import { ServicesTabs } from "@/components/landing/services-tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicData } from "@/lib/data"
import { IMAGES } from "@/lib/images"
import { cn } from "@/lib/utils"

export const revalidate = 60

export default async function Home() {
  const { settings, services } = await getPublicData()
  const featured = services[0] ?? { name: "Alongamento", price: 0 }

  const steps = [
    { n: "01", title: "Serviço", text: "Escolha entre alongamento, banho em gel, esmaltação e os demais." },
    { n: "02", title: "Dia e hora", text: "A agenda mostra só os horários que estão livres de verdade." },
    { n: "03", title: "Confirmação", text: "Você recebe um e-mail com o horário e o link para salvar no Google Agenda ou no iPhone." },
  ]

  const faq = [
    {
      q: "Preciso criar conta para agendar?",
      a: "Não. Basta informar nome, e-mail e WhatsApp. Com conta, você vê seu histórico e cancela pelo site.",
    },
    {
      q: "Como cancelo ou remarco?",
      a: `Pela área Meus horários, com até ${settings.cancel_notice_hours} horas de antecedência. Fora desse prazo, chame no WhatsApp.`,
    },
    {
      q: "Com quanto tempo de antecedência posso marcar?",
      a: `A agenda abre ${settings.max_days_ahead} dias à frente. Para o mesmo dia, o horário precisa estar a pelo menos ${settings.min_notice_hours} horas.`,
    },
  ]

  return (
    <>
      <Hero whatsapp={settings.whatsapp} featured={{ name: featured.name, price: Number(featured.price) }} />

      <Marquee items={services.map((s) => s.name)} />

      <section aria-label="Galeria" className="-mx-4 overflow-x-auto px-4 pt-6 [scrollbar-width:none]">
        <div className="flex snap-x snap-mandatory gap-3 sm:grid sm:grid-cols-5">
          {IMAGES.gallery.map((img, i) => (
            <Reveal key={img.src} delay={i * 0.06} className="w-[62vw] shrink-0 snap-center sm:w-auto">
              <div className={cn("relative aspect-[3/4] overflow-hidden rounded-3xl shadow-lg", i % 2 === 1 && "sm:translate-y-8")}>
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 20vw, 62vw" className="object-cover transition-transform duration-700 hover:scale-105" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="servicos" className="scroll-mt-24 py-20">
        <Reveal className="mb-10 text-center">
          <p className="text-xs font-medium tracking-[0.3em] text-[var(--gold)] uppercase">Serviços</p>
          <h2 className="mt-2 font-serif text-5xl font-medium tracking-tight sm:text-6xl">Valores e duração</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ServicesTabs services={services} />
        </Reveal>
      </section>

      <section className="py-20">
        <Reveal className="mb-10 text-center">
          <p className="text-xs font-medium tracking-[0.3em] text-[var(--gold)] uppercase">Como funciona</p>
          <h2 className="mt-2 font-serif text-5xl font-medium tracking-tight sm:text-6xl">Agendar leva um minuto</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <Card className="h-full">
                <CardContent className="space-y-3">
                  <span className="font-serif text-6xl text-[var(--gold)] italic">{s.n}</span>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground">{s.text}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-20 lg:grid-cols-3">
        <Reveal>
          <div className="relative aspect-[4/5] h-full min-h-80 overflow-hidden rounded-3xl shadow-xl">
            <Image src={IMAGES.about.src} alt={IMAGES.about.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <Card className="h-full">
            <CardContent className="space-y-5">
              <p className="text-xs font-medium tracking-[0.3em] text-[var(--gold)] uppercase">Sobre</p>
              <h2 className="font-serif text-4xl font-medium">Catia Rodrigues</h2>
              <p className="text-lg text-muted-foreground">
                Nail designer desde 2015. Trabalha principalmente com alongamento em fibra de vidro e banho em gel, buscando
                unhas finas e com cara de naturais. Também faz esmaltação em gel, mão e pé e massagem.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  ["2015", "desde"],
                  ["+5 mil", "atendimentos"],
                  ["5,0", "no Google"],
                ].map(([v, l]) => (
                  <div key={l} className="glass-subtle rounded-2xl p-3 text-center">
                    <p className="font-serif text-3xl font-medium tabular-nums">{v}</p>
                    <p className="text-xs text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card className="h-full">
            <CardContent className="flex h-full flex-col space-y-5">
              <p className="text-xs font-medium tracking-[0.3em] text-[var(--gold)] uppercase">Endereço</p>
              <p className="flex gap-2 text-lg">
                <MapPin className="mt-1 size-5 shrink-0 text-primary" />
                {settings.address}
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <a
                  className={buttonVariants({ variant: "secondary" })}
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.address ?? "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir no mapa
                </a>
                {settings.instagram && (
                  <a className={buttonVariants({ variant: "ghost" })} href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer">
                    @{settings.instagram}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <section className="mx-auto max-w-2xl py-20">
        <Reveal className="mb-8 text-center">
          <h2 className="font-serif text-5xl font-medium">Dúvidas</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <Accordion className="glass rounded-3xl px-5">
            {faq.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="py-5 text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      <Reveal>
        <section className="glass-strong my-10 rounded-[2.5rem] px-6 py-16 text-center">
          <h2 className="mx-auto max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Veja os horários desta semana
          </h2>
          <Link href="/agendar" className={cn(buttonVariants({ size: "lg" }), "group mt-8 h-14 px-8 text-base")}>
            Agendar <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      </Reveal>

      <footer className="py-10 text-center text-sm text-muted-foreground">
        {settings.business_name} · São José do Rio Preto, SP
      </footer>
    </>
  )
}
