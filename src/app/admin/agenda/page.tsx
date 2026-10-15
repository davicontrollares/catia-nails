import Link from "next/link"
import { addDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { buttonVariants } from "@/components/ui/button"
import { getAdminData } from "@/lib/admin"
import { dayKey } from "@/lib/finance"
import { cn } from "@/lib/utils"
import { AgendaList, LiveRefresh, ManualAppointment } from "./client"

export const dynamic = "force-dynamic"

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia } = await searchParams
  // dia sempre interpretado no fuso de São Paulo (UTC-3)
  const day = new Date(`${dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : dayKey(new Date())}T00:00:00-03:00`)
  const weekStart = addDays(day, -3)
  const data = await getAdminData(day, addDays(day, 1))
  const key = (d: Date) => dayKey(d)

  return (
    <>
      <LiveRefresh enabled={!data.demo} />
      <PageTitle title="Agenda" subtitle={format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}>
        <ManualAppointment services={data.services} professionals={data.professionals} day={key(day)} />
      </PageTitle>

      <div className="border bg-card shadow-sm flex items-center gap-1 rounded-full p-1.5">
        <Link href={`?dia=${key(addDays(day, -7))}`} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Semana anterior">
          <ChevronLeft />
        </Link>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d) => {
            const active = key(d) === key(day)
            return (
              <Link
                key={key(d)}
                href={`?dia=${key(d)}`}
                className={cn(
                  "flex flex-col items-center rounded-full py-1.5 text-xs transition active:scale-95",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-foreground/5"
                )}
              >
                <span className="capitalize opacity-70">{format(d, "EEE", { locale: ptBR }).slice(0, 3)}</span>
                <span className="text-base font-semibold tabular-nums">{format(d, "d")}</span>
              </Link>
            )
          })}
        </div>
        <Link href={`?dia=${key(addDays(day, 7))}`} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Próxima semana">
          <ChevronRight />
        </Link>
      </div>

      <AgendaList appointments={data.appointments} />
    </>
  )
}
