import Link from "next/link"
import { CalendarHeart, Home, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="glass mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full pr-2 pl-5">
        <Link href="/" className="font-serif text-lg italic tracking-tight">
          Catia Rodrigues <span className="font-sans text-sm font-semibold not-italic text-primary">NAILS</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/meus-agendamentos" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>
            Meus horários
          </Link>
          <ThemeToggle />
          <Link href="/agendar" className={cn(buttonVariants(), "hidden sm:inline-flex")}>
            Agendar
          </Link>
        </nav>
      </div>
    </header>
  )
}

const tabs = [
  { href: "/", label: "Início", icon: Home },
  { href: "/agendar", label: "Agendar", icon: CalendarHeart },
  { href: "/meus-agendamentos", label: "Meus horários", icon: User },
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
