"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BellRing, CalendarDays, Clock, LayoutDashboard, Scissors, Settings, Users, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

export const ADMIN_LINKS = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/disponibilidade", label: "Disponibilidade", icon: Clock },
  { href: "/admin/servicos", label: "Serviços", icon: Scissors },
  { href: "/admin/financas", label: "Finanças", icon: Wallet },
  { href: "/admin/espera", label: "Lista de espera", icon: BellRing },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

export function AdminNav({ mobile }: { mobile?: boolean }) {
  const path = usePathname()
  return (
    <nav className={cn(mobile ? "flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" : "grid gap-1")}>
      {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-medium transition active:scale-[0.97]",
              mobile ? "h-10" : "h-11",
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : cn("text-muted-foreground hover:bg-foreground/5 hover:text-foreground", mobile && "border bg-muted/60")
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
