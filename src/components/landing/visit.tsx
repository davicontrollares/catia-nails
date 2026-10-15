import { Clock, MapPin, Phone } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Visit({ address, phone, whatsapp, hours }: { address: string; phone: string; whatsapp: string | null; hours: string }) {
  const q = encodeURIComponent(address)
  const rows = [
    { icon: MapPin, title: "Endereço", body: address },
    { icon: Phone, title: "Telefone e WhatsApp", body: phone, href: whatsapp ? `https://wa.me/${whatsapp}` : undefined },
    { icon: Clock, title: "Horário", body: hours },
  ]

  return (
    <section id="visite" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <h2 className="font-display text-4xl md:text-5xl">Venha nos visitar</h2>
      </Reveal>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
        <Reveal className="space-y-8">
          {rows.map(({ icon: Icon, title, body, href }) => (
            <div key={title} className="flex gap-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-medium">{title}</p>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="mt-1 block text-muted-foreground hover:text-foreground">
                    {body}
                  </a>
                ) : (
                  <p className="mt-1 max-w-sm text-muted-foreground">{body}</p>
                )}
              </div>
            </div>
          ))}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 bg-background/60 px-6")}
          >
            Abrir rotas no Maps
          </a>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl border bg-muted shadow-sm">
            <iframe
              title={`Mapa: ${address}`}
              src={`https://www.google.com/maps?q=${q}&output=embed`}
              className="size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
