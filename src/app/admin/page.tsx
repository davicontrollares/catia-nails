import Link from "next/link"
import { addDays, startOfDay } from "date-fns"
import { HBar, RevenueArea } from "@/components/charts"
import { Kpi, PageTitle } from "@/components/page-title"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminData } from "@/lib/admin"
import { dayKey, groupSum, revenueByDay, revenueOf, summarize } from "@/lib/finance"
import { STATUS_LABEL } from "@/lib/types"
import { brl, TZ } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminHome() {
  const today = startOfDay(new Date())
  const from = addDays(today, -29)
  const to = addDays(today, 7)
  const data = await getAdminData(from, to)

  const past = data.appointments.filter((a) => new Date(a.starts_at) < addDays(today, 1))
  const s = summarize(past, data.expenses, from, addDays(today, 1), data.workingHours)
  const todayKey = dayKey(new Date())
  const todayList = data.appointments.filter((a) => dayKey(a.starts_at) === todayKey && a.status !== "cancelled")
  const week = past.filter((a) => new Date(a.starts_at) >= addDays(today, -6))
  const byService = groupSum(past.filter((a) => a.status === "completed"), (a) => a.service_label ?? a.services?.name ?? "-", (a) => Number(a.price))
  const byHour = groupSum(
    past.filter((a) => a.status !== "cancelled"),
    (a) => `${new Date(a.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", timeZone: TZ })}h`,
    () => 1
  ).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <PageTitle title="Visão geral" subtitle="Últimos 30 dias">
        <Link href="/admin/agenda" className={buttonVariants()}>Abrir agenda</Link>
      </PageTitle>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Faturamento hoje" value={brl(revenueOf(todayList))} hint={`${todayList.length} atendimentos hoje`} />
        <Kpi label="Últimos 7 dias" value={brl(revenueOf(week))} />
        <Kpi label="Últimos 30 dias" value={brl(s.revenue)} hint={`Lucro ${brl(s.profit)}`} />
        <Kpi label="Ticket médio" value={brl(s.ticket)} hint={`${s.count} concluídos`} />
        <Kpi label="Ocupação da agenda" value={`${Math.round(s.occupancy * 100)}%`} />
        <Kpi label="Cancelamentos / faltas" value={`${Math.round(s.lossRate * 100)}%`} />
        <Kpi label="Despesas (30d)" value={brl(s.costs)} />
        <Kpi label="Próximos 7 dias" value={String(data.appointments.filter((a) => new Date(a.starts_at) >= new Date() && a.status === "confirmed").length)} hint="agendamentos confirmados" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Receita por dia</CardTitle></CardHeader>
          <CardContent><RevenueArea data={revenueByDay(past, from, addDays(today, 1))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Hoje</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {todayList.length === 0 && <p className="text-sm text-muted-foreground">Sem atendimentos hoje.</p>}
            {todayList.map((a) => (
              <div key={a.id} className="border bg-muted/60 flex items-center justify-between rounded-2xl px-3 py-2 text-sm">
                <div>
                  <p className="font-medium tabular-nums">
                    {new Date(a.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })} · {a.client_name}
                  </p>
                  <p className="text-muted-foreground">{a.service_label ?? a.services?.name}</p>
                </div>
                <Badge variant="outline">{STATUS_LABEL[a.status]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Receita por serviço</CardTitle></CardHeader>
          <CardContent><HBar data={byService} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Horários de pico</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-2">
              {byHour.map((h) => {
                const max = Math.max(...byHour.map((x) => x.total))
                return (
                  <div key={h.name} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-xl bg-primary/80" style={{ height: `${(h.total / max) * 150}px` }} title={`${h.total} atendimentos`} />
                    <span className="text-xs text-muted-foreground">{h.name}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
