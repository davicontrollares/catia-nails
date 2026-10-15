import Link from "next/link"
import { AtSign, MessageCircle } from "lucide-react"

export function SiteFooter({
  name,
  address,
  phone,
  whatsapp,
  instagram,
  hours,
}: {
  name: string
  address: string
  phone: string
  whatsapp: string | null
  instagram: string | null
  hours: string
}) {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-10 border-t bg-background/60 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm md:grid-cols-12 md:px-6">
        <div className="md:col-span-4">
          <p className="font-display text-2xl">
            Catia Rodrigues <span className="text-primary italic">Nails</span>
          </p>
          <p className="mt-3 max-w-xs text-muted-foreground">Alongamento em fibra de vidro, banho em gel e esmaltação em gel em São José do Rio Preto.</p>
          <div className="mt-5 flex gap-2">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex size-10 items-center justify-center rounded-full border transition-colors hover:border-primary hover:text-primary"
              >
                <MessageCircle className="size-4" />
              </a>
            )}
            {instagram && (
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-10 items-center justify-center rounded-full border transition-colors hover:border-primary hover:text-primary"
              >
                <AtSign className="size-4" />
              </a>
            )}
          </div>
        </div>

        <nav className="md:col-span-2" aria-label="Rodapé">
          <p className="font-medium">Navegação</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/#servicos">Serviços</Link></li>
            <li><Link className="hover:text-foreground" href="/#sobre">Sobre</Link></li>
            <li><Link className="hover:text-foreground" href="/agendar">Agendar horário</Link></li>
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="font-medium">Contato</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>{phone}</li>
            {instagram && <li>@{instagram}</li>}
            <li className="max-w-[16rem]">{address}</li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="font-medium">Horário</p>
          <p className="mt-3 text-muted-foreground">{hours}</p>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between md:px-6">
          <p>© {year} {name}. Todos os direitos reservados.</p>
          <p>São José do Rio Preto, SP</p>
        </div>
      </div>
    </footer>
  )
}
