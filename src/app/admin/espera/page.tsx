import { PageTitle } from "@/components/page-title"
import { hasSupabase } from "@/lib/data"
import { WaitlistList, type WaitlistEntry } from "./client"

export const dynamic = "force-dynamic"

export default async function EsperaPage() {
  let entries: WaitlistEntry[] = []
  if (hasSupabase) {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase.from("waitlist").select("*").order("created_at")
    if (error) console.error("Falha ao ler lista de espera", error.message)
    entries = (data ?? []) as WaitlistEntry[]
  }
  return (
    <>
      <PageTitle title="Lista de espera" subtitle="Clientes esperando uma vaga. Quando abrir um horário, avise quem pediu." />
      <WaitlistList entries={entries} />
    </>
  )
}
