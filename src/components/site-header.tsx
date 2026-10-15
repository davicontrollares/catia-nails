import Link from "next/link"
import { CalendarHeart, Home } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display text-lg md:text-xl">
          Bela Flor <span className="font-normal text-brand">Nails</span>
        </Link>
        <nav className="flex items-center gap-1">
          {[
            ["/#servicos", "Serviços"],
            ["/#sobre", "Sobre"],
            ["/#visite", "Contato"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className={cn(buttonVariants({ variant: "ghost" }), "hidden text-muted-foreground hover:text-foreground md:inline-flex")}>
              {label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/agendar" className={cn(buttonVariants(), "hidden sm:inline-flex")}>
            Agendar horário
          </Link>
        </nav>
      </div>
    </header>
  )
}

const tabs = [
  { href: "/", label: "Início", icon: Home },
  { href: "/agendar", label: "Agendar", icon: CalendarHeart },
]

export function TabBar() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 px-6 sm:hidden" aria-label="Navegação">
      <div className="glass-strong mx-auto flex max-w-sm justify-around rounded-full p-1.5">
        {tabs.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium text-muted-foreground transition hover:text-foreground active:scale-95"
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
