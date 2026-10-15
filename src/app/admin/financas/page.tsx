import Link from "next/link"
import { addDays } from "date-fns"
import { HBar, RevenueArea } from "@/components/charts"
import { Kpi, PageTitle } from "@/components/page-title"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAdminData } from "@/lib/admin"
import { dayKey, groupSum, revenueByDay, summarize } from "@/lib/finance"
import { PAYMENT_LABEL } from "@/lib/types"
import { brl, cn } from "@/lib/utils"
import { ExpenseForm, ExportCsv, RemoveExpense } from "./client"

export const dynamic = "force-dynamic"

const PERIODS = { "7": "7 dias", "30": "30 dias", "90": "90 dias" } as const

export default async function FinancasPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams
  const days = p && p in PERIODS ? Number(p) : 30
  const to = addDays(new Date(`${dayKey(new Date())}T00:00:00-03:00`), 1)
  const from = addDays(to, -days)
  const data = await getAdminData(from, to)
  const s = summarize(data.appointments, data.expenses, from, to, data.workingHours)
  const done = data.appointments.filter((a) => a.status === "completed")

  const byMethod = groupSum(done, (a) => (a.payment_method ? PAYMENT_LABEL[a.payment_method] : "Não informado"), (a) => Number(a.price))
  const byCategory = groupSum(data.expenses, (e) => e.category, (e) => Number(e.amount))
  const commissions = data.professionals.map((pro) => {
    const total = done.filter((a) => a.professional_id === pro.id).reduce((t, a) => t + Number(a.price), 0)
    return { name: pro.name, total, commission: (total * Number(pro.commission_pct)) / 100, pct: Number(pro.commission_pct) }
  })

  const csvRows = [
    ...done.map((a) => ({ data: dayKey(a.starts_at), tipo: "Receita", descricao: `${a.service_label ?? a.services?.name} (${a.client_name})`, forma: a.payment_method ? PAYMENT_LABEL[a.payment_method] : "", valor: Number(a.price) })),
    ...data.expenses.map((e) => ({ data: e.spent_on, tipo: "Despesa", descricao: `${e.category}: ${e.description ?? ""}`, forma: "", valor: -Number(e.amount) })),
  ].sort((a, b) => a.data.localeCompare(b.data))

  return (
    <>
      <PageTitle title="Finanças" subtitle={`Últimos ${PERIODS[String(days) as keyof typeof PERIODS]}`}>
        <div className="border bg-card shadow-sm flex rounded-full p-1">
          {Object.entries(PERIODS).map(([k, label]) => (
            <Link
              key={k}
              href={`?p=${k}`}
              className={cn("rounded-full px-3 py-1.5 text-sm font-medium", String(days) === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              {label}
            </Link>
          ))}
        </div>
        <ExportCsv rows={csvRows} filename={`financeiro-${days}d.csv`} />
      </PageTitle>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Receita" value={brl(s.revenue)} hint={`${s.count} atendimentos`} />
        <Kpi label="Despesas" value={brl(s.costs)} />
        <Kpi label="Lucro" value={brl(s.profit)} hint={s.revenue ? `Margem ${Math.round((s.profit / s.revenue) * 100)}%` : undefined} />
        <Kpi label="Ticket médio" value={brl(s.ticket)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Receita por dia</CardTitle></CardHeader>
        <CardContent><RevenueArea data={revenueByDay(data.appointments, from, to)} /></CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Receita por forma de pagamento</CardTitle></CardHeader>
          <CardContent><HBar data={byMethod} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Despesas por categoria</CardTitle></CardHeader>
          <CardContent>{byCategory.length ? <HBar data={byCategory} /> : <p className="text-sm text-muted-foreground">Sem despesas no período.</p>}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Despesas</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="tabular-nums">{new Date(`${e.spent_on}T12:00:00`).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{e.category}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{e.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{brl(Number(e.amount))}</TableCell>
                    <TableCell className="w-10"><RemoveExpense id={e.id} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Lançar despesa</CardTitle></CardHeader>
            <CardContent><ExpenseForm /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Comissões</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {commissions.map((c) => (
                <div key={c.name} className="flex justify-between">
                  <span>{c.name} <span className="text-muted-foreground">({c.pct}%)</span></span>
                  <span className="font-medium tabular-nums">{brl(c.commission)}</span>
                </div>
              ))}
              <Link href="/admin/configuracoes" className={cn(buttonVariants({ variant: "link" }), "px-0")}>Ajustar comissões</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
