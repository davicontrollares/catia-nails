import { BellRing, CalendarCheck, CreditCard, Mail } from "lucide-react"
import { About } from "@/components/landing/about"
import { Experience } from "@/components/landing/experience"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Reveal } from "@/components/landing/reveal"
import { Showcase } from "@/components/landing/showcase"
import { Reviews } from "@/components/landing/reviews"
import { ServiceCards } from "@/components/landing/service-cards"
import { Visit } from "@/components/landing/visit"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getPublicData } from "@/lib/data"
import { getGalleryPhotos } from "@/lib/gallery"
import { formatPhone, summarizeHours } from "@/lib/utils"

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
      <section aria-label="Como funciona" className="relative z-10 mx-auto -mt-2 max-w-7xl px-4 md:-mt-10 md:px-10">
        <ul className="glass-strong grid grid-cols-2 gap-px overflow-hidden rounded-3xl md:grid-cols-4">
          {[
            [CalendarCheck, "Agenda online", "Horários livres a qualquer hora"],
            [Mail, "Confirmação por e-mail", "Com botão para salvar na agenda"],
            [CreditCard, "Pagamento flexível", "No studio, com Pix ou cartão"],
            [BellRing, "Lista de espera", "Avisamos quando abrir uma vaga"],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof CalendarCheck
            return (
              <li key={title as string} className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <I className="size-6 text-brand" strokeWidth={1.5} />
                <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase">{title as string}</p>
                <p className="hidden text-xs text-muted-foreground md:block">{text as string}</p>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Serviços como produtos */}
      <section id="servicos" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
        <Reveal className="mb-10 max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl">Serviços e valores</h2>
          <p className="mt-3 text-muted-foreground">Escolha um serviço para ver os horários livres. Dá para juntar mais de um no mesmo horário.</p>
        </Reveal>
        <ServiceCards services={services} />
      </section>

      <HowItWorks />

      <Experience />

      <Showcase photos={photos} instagram={settings.instagram} />

      <About />

      <Reviews />

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

    </div>
  )
}
