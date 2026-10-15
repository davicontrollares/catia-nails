import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { hasSupabase } from "@/lib/data"
import { AdminNav } from "./nav"

export const metadata = { title: "Painel · Catia Rodrigues Nails" }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:flex">
      <aside className="border bg-card shadow-sm sticky top-4 m-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col rounded-[2rem] p-4 lg:flex">
        <Link href="/" className="mb-6 px-3 pt-2">
          <p className="text-lg font-semibold tracking-tight">Catia Rodrigues</p>
          <p className="text-sm text-muted-foreground">Painel</p>
        </Link>
        <AdminNav />
        <div className="mt-auto flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Ver site <ExternalLink className="size-3.5" />
          </Link>
          <ThemeToggle />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 space-y-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4">
            <p className="text-lg font-semibold tracking-tight">Painel</p>
            <ThemeToggle />
          </div>
          <AdminNav mobile />
        </header>
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-4 pb-16 lg:py-8 lg:pr-8 lg:pl-4">
          {!hasSupabase && (
            <div className="border bg-muted/60 rounded-2xl px-4 py-3 text-sm">
              Você está vendo dados de exemplo. Conecte o Supabase na Vercel para usar a agenda real.
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
