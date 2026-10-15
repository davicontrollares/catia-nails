import { addDays } from "date-fns"
import { PageTitle } from "@/components/page-title"
import { getAdminData } from "@/lib/admin"
import { ServiceManager } from "./client"

export const dynamic = "force-dynamic"

export default async function ServicosPage() {
  const now = new Date()
  const data = await getAdminData(addDays(now, -1), now)
  return (
    <>
      <PageTitle title="Serviços e valores" subtitle="O que aparece para as clientes no agendamento." />
      <ServiceManager services={data.services} />
    </>
  )
}
