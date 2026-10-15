import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { GalleryCarousel } from "@/components/landing/gallery-carousel"
import { Hero } from "@/components/landing/hero"
import { Reveal } from "@/components/landing/reveal"
import { Visit } from "@/components/landing/visit"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { getPublicData } from "@/lib/data"
import { getGalleryPhotos } from "@/lib/gallery"
import { IMAGES } from "@/lib/images"
import type { Service } from "@/lib/types"
import { brl, cn, duration, formatPhone, summarizeHours } from "@/lib/utils"

export const revalidate = 60

export default async function Home() {
  const [{ settings, services, hours }, photos] = await Promise.all([getPublicData(), getGalleryPhotos()])

  const groups = services.reduce<Record<string, Service[]>>((acc, s) => {
    ;(acc[s.category] ??= []).push(s)
    return acc
  }, {})

  const faq = [
    {
      q: "Preciso criar conta para agendar?",
      a: "Não. Basta nome, e-mail e WhatsApp. Com conta, você vê o histórico e cancela pelo site.",
    },
    {
      q: "Como cancelo ou remarco?",
      a: `Em Meus horários, com até ${settings.cancel_notice_hours} horas de antecedência. Depois disso, chame no WhatsApp.`,
    },
    {
      q: "Com quanto tempo posso marcar?",
      a: `A agenda abre ${settings.max_days_ahead} dias à frente. Para o mesmo dia, o horário precisa estar a pelo menos ${settings.min_notice_hours} horas.`,
    },
    {
      q: "Recebo alguma confirmação?",
      a: "Sim. Chega um e-mail com o horário e um botão para salvar no Google Agenda, no Outlook ou no calendário do iPhone.",
    },
  ]


  return (
    <div className="-mx-4 -mt-6">
      <Hero whatsapp={settings.whatsapp} />

      {/* Galeria: bento de 4 fotos, rolagem lateral no celular */}
      <section aria-label="Galeria" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <GalleryCarousel photos={photos} />
        {settings.instagram && (
          <a
            href={`https://instagram.com/${settings.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Mais trabalhos no Instagram @{settings.instagram} <ArrowUpRight className="size-4" />
          </a>
        )}
      </section>

      {/* Cardápio de serviços: foto fixa à esquerda, lista de preços à direita */}
      <section id="servicos" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-4 py-16 md:grid-cols-12 md:px-6 md:py-24">
        <div className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted md:sticky md:top-24">
            <Image src={IMAGES.menu.src} alt={IMAGES.menu.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>

        <div className="md:col-span-7 md:pl-6">
          <Reveal>
            <h2 className="font-display text-4xl tracking-[-0.02em] md:text-6xl">Serviços e valores</h2>
            <p className="mt-4 max-w-[52ch] text-muted-foreground">Toque no serviço para ver os horários livres.</p>
          </Reveal>

          <div className="mt-12 space-y-12">
            {Object.entries(groups).map(([category, items]) => (
              <Reveal key={category}>
                <h3 className="mb-2 text-sm font-medium text-primary">{category}</h3>
                <ul>
                  {items.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/agendar?servico=${s.id}`}
                        className="group -mx-4 grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 rounded-2xl px-4 py-4 transition-colors hover:bg-accent"
                      >
                        <span className="text-lg font-medium">{s.name}</span>
                        <span className="text-lg font-medium tabular-nums">{brl(Number(s.price))}</span>
                        <span className="text-sm text-muted-foreground">{s.description}</span>
                        <span className="flex items-center justify-end gap-1 text-sm whitespace-nowrap text-muted-foreground">
                          {duration(s.duration_min)}
                          <ArrowRight className="size-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre: texto grande, sem card */}
      <section id="sobre" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-8">
            <p className="font-display text-3xl leading-[1.3] text-balance md:text-[2.75rem]">
              Catia faz unhas desde 2015 e já passou de 5 mil atendimentos. O foco é alongamento em fibra de vidro e banho
              em gel,<span className="text-muted-foreground"> com unhas finas, bem acabadas e que duram.</span>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-3 md:col-start-10">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
              <Image src={IMAGES.about.src} alt={IMAGES.about.alt} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.05}>
          <dl className="mt-14 grid grid-cols-3 gap-6 md:max-w-2xl">
            {[
              ["2015", "atendendo desde"],
              ["5 mil+", "atendimentos"],
              ["5,0", "nota no Google"],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-muted-foreground">{l}</dt>
                <dd className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* Dúvidas */}
      <section className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <Reveal>
          <h2 className="font-display text-4xl tracking-[-0.02em] md:text-6xl">Dúvidas frequentes</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <Accordion className="mt-8">
            {faq.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="py-5 text-base font-medium md:text-lg">{f.q}</AccordionTrigger>
                <AccordionContent className="max-w-[60ch] text-base text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      <Visit
        address={settings.address ?? ""}
        phone={formatPhone(settings.whatsapp)}
        whatsapp={settings.whatsapp}
        hours={summarizeHours(hours)}
      />

      {/* Chamada final sobre foto */}
      <section className="px-4 py-10 md:px-6">
        <Reveal>
          <div className="relative mx-auto flex min-h-[28rem] max-w-7xl items-end overflow-hidden rounded-3xl bg-muted md:min-h-[34rem]">
            <Image src={IMAGES.cta.src} alt={IMAGES.cta.alt} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative p-6 text-white md:p-12">
              <h2 className="max-w-lg font-display text-4xl tracking-[-0.02em] text-balance md:text-6xl">
                Escolha um horário livre.
              </h2>
              <Link
                href="/agendar"
                className={cn(buttonVariants({ size: "lg" }), "group mt-8 h-13 bg-white px-7 text-base text-neutral-900 hover:bg-white/90")}
              >
                Agendar horário <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  )
}
