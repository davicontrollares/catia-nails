import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BellRing, CalendarCheck, CreditCard, Mail } from "lucide-react"
import { GalleryCarousel } from "@/components/landing/gallery-carousel"
import { Hero } from "@/components/landing/hero"
import { Reveal } from "@/components/landing/reveal"
import { ServiceCards } from "@/components/landing/service-cards"
import { Visit } from "@/components/landing/visit"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { getPublicData } from "@/lib/data"
import { getGalleryPhotos } from "@/lib/gallery"
import { IMAGES } from "@/lib/images"
import { cn, formatPhone, summarizeHours } from "@/lib/utils"

export const revalidate = 60

export default async function Home() {
  const [{ settings, services, hours }, photos] = await Promise.all([getPublicData(), getGalleryPhotos()])


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

      {/* Benefícios do agendamento */}
      <section aria-label="Como funciona" className="mx-auto max-w-7xl px-4 md:px-6">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border bg-border md:grid-cols-4">
          {[
            [CalendarCheck, "Agenda online", "Horários livres a qualquer hora"],
            [Mail, "Confirmação por e-mail", "Com botão para salvar na agenda"],
            [CreditCard, "Pagamento flexível", "No studio, com Pix ou cartão"],
            [BellRing, "Lista de espera", "Avisamos quando abrir uma vaga"],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof CalendarCheck
            return (
              <li key={title as string} className="flex flex-col items-center gap-1.5 bg-card/80 px-4 py-6 text-center backdrop-blur">
                <I className="size-6 text-brand" strokeWidth={1.5} />
                <p className="text-sm font-semibold">{title as string}</p>
                <p className="text-xs text-muted-foreground">{text as string}</p>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Galeria em carrossel */}
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

      {/* Serviços como produtos */}
      <section id="servicos" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
        <Reveal className="mb-10 max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl">Serviços e valores</h2>
          <p className="mt-3 text-muted-foreground">Escolha um serviço para ver os horários livres. Dá para juntar mais de um no mesmo horário.</p>
        </Reveal>
        <ServiceCards services={services} />
      </section>

      {/* Sobre: texto grande, sem card */}
      <section id="sobre" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-8">
            <p className="text-3xl leading-[1.3] font-medium tracking-[-0.025em] text-balance md:text-[2.6rem]">
              A Bela Flor faz unhas desde 2015 e já passou de 5 mil atendimentos. O foco é alongamento em fibra de vidro e banho
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
          <h2 className="font-display text-4xl md:text-5xl">Dúvidas frequentes</h2>
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
              <h2 className="max-w-lg font-display text-4xl text-balance md:text-6xl">
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
