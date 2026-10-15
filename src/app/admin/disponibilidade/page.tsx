import { addDays } from "date-fns"
import { PageTitle } from "@/components/page-title"
import { getAdminData } from "@/lib/admin"
import { HoursEditor, TimeOffEditor } from "./client"

export const dynamic = "force-dynamic"

export default async function DisponibilidadePage() {
  const now = new Date()
  const data = await getAdminData(addDays(now, -1), now)
  const pro = data.professionals[0]
  if (!pro) return <PageTitle title="Disponibilidade" subtitle="Cadastre uma profissional primeiro." />

  return (
    <>
      <PageTitle
        title="Disponibilidade"
        subtitle={`Clientes podem marcar com ${data.settings.min_notice_hours}h de antecedência e até ${data.settings.max_days_ahead} dias à frente.`}
      />
      <div className="grid items-start gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <HoursEditor professionalId={pro.id} initial={data.workingHours.filter((w) => w.professional_id === pro.id)} />
        </div>
        <div className="xl:col-span-2">
          <TimeOffEditor professionalId={pro.id} items={data.timeOff} />
        </div>
      </div>
    </>
  )
}
