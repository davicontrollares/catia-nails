import { addDays } from "date-fns"
import { PageTitle } from "@/components/page-title"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAdminData } from "@/lib/admin"
import { brl, TZ } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ClientesPage() {
  const now = new Date()
  const data = await getAdminData(addDays(now, -365), addDays(now, 60))

  // agrupa pelo telefone (clientes de balcão não têm conta)
  const map = new Map<string, { name: string; phone: string; visits: number; spent: number; last: string | null; next: string | null }>()
  for (const a of data.appointments) {
    const key = a.client_phone.replace(/\D/g, "") + a.client_name
    const c = map.get(key) ?? { name: a.client_name, phone: a.client_phone, visits: 0, spent: 0, last: null, next: null }
    if (a.status === "completed") {
      c.visits++
      c.spent += Number(a.price)
      if (!c.last || a.starts_at > c.last) c.last = a.starts_at
    }
    if (a.status === "confirmed" && new Date(a.starts_at) > now && (!c.next || a.starts_at < c.next)) c.next = a.starts_at
    map.set(key, c)
  }
  const clients = [...map.values()].sort((a, b) => b.spent - a.spent)
  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: TZ }) : "—")

  return (
    <>
      <PageTitle title="Clientes" subtitle={`${clients.length} clientes nos últimos 12 meses`} />
      <div className="border bg-card shadow-sm overflow-hidden rounded-3xl p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Visitas</TableHead>
              <TableHead className="text-right">Total gasto</TableHead>
              <TableHead className="hidden sm:table-cell">Última visita</TableHead>
              <TableHead className="hidden sm:table-cell">Próximo horário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.phone + c.name}>
                <TableCell>
                  <p className="font-medium">{c.name}</p>
                  <a className="text-xs text-muted-foreground hover:underline" href={`https://wa.me/55${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    {c.phone}
                  </a>
                </TableCell>
                <TableCell className="text-right tabular-nums">{c.visits}</TableCell>
                <TableCell className="text-right tabular-nums">{brl(c.spent)}</TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">{fmt(c.last)}</TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">{fmt(c.next)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
