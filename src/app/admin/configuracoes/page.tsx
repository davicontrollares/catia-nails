import { addDays } from "date-fns"
import { PageTitle } from "@/components/page-title"
import { getAdminData } from "@/lib/admin"
import { SettingsForm } from "./client"

export const dynamic = "force-dynamic"

export default async function ConfiguracoesPage() {
  const now = new Date()
  const { settings } = await getAdminData(addDays(now, -1), now)
  return (
    <>
      <PageTitle title="Configurações" subtitle="Dados do studio e regras de agendamento." />
      <SettingsForm settings={settings} />
    </>
  )
}
