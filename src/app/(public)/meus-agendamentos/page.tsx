import Link from "next/link"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { hasSupabase } from "@/lib/data"
import { getSessionProfile } from "@/lib/supabase/server"
import { STATUS_LABEL, type Appointment } from "@/lib/types"
import { brl, TZ } from "@/lib/utils"
import { CancelButton, SignOutButton } from "./buttons"

export const metadata = { title: "Meus horários · Catia Rodrigues Nails" }

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ })

export default async function MeusAgendamentos() {
  if (!hasSupabase) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="space-y-3">
          <h1 className="text-2xl font-bold">Meus horários</h1>
          <p className="text-muted-foreground">Disponível após conectar o Supabase.</p>
        </CardContent>
      </Card>
    )
  }

  const { supabase, user, profile } = await getSessionProfile()
  if (!user) redirect("/entrar?next=/meus-agendamentos")

  const { data } = await supabase
    .from("appointments")
    .select("*, services(name), professionals(name)")
    .eq("client_id", user.id)
    .order("starts_at", { ascending: false })
  const list = (data ?? []) as Appointment[]
  const now = Date.now()
  const upcoming = list.filter((a) => new Date(a.starts_at).getTime() >= now && a.status === "confirmed").reverse()
  const past = list.filter((a) => !upcoming.includes(a))

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-foreground">Olá, {profile?.full_name?.split(" ")[0] ?? "cliente"}</p>
          <h1 className="text-3xl font-bold tracking-tight">Meus horários</h1>
        </div>
        <div className="flex gap-2">
          {profile?.role === "owner" && <Link href="/admin" className={buttonVariants({ variant: "secondary" })}>Painel</Link>}
          <SignOutButton />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase">Próximos</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="space-y-3 text-center">
              <p className="text-muted-foreground">Nenhum horário marcado.</p>
              <Link href="/agendar" className={buttonVariants()}>Agendar agora</Link>
            </CardContent>
          </Card>
        ) : (
          upcoming.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{a.services?.name}</p>
                  <p className="text-sm text-muted-foreground">{fmt(a.starts_at)} · {a.professionals?.name}</p>
                </div>
                <CancelButton id={a.id} />
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-semibold text-muted-foreground uppercase">Histórico</h2>
          {past.map((a) => (
            <div key={a.id} className="glass-subtle flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{a.services?.name}</p>
                <p className="text-muted-foreground">{fmt(a.starts_at)}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline">{STATUS_LABEL[a.status]}</Badge>
                <p className="mt-1 text-muted-foreground">{brl(Number(a.price))}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
