import { getPublicData } from "@/lib/data"
import { BookingWizard } from "./wizard"

export const metadata = { title: "Agendar · Bela Flor Nails" }

export default async function AgendarPage({ searchParams }: { searchParams: Promise<{ servico?: string }> }) {
  const { servico } = await searchParams
  const { services, professionals, settings, demo } = await getPublicData()
  return (
    <BookingWizard
      services={services}
      professionals={professionals}
      maxDaysAhead={settings.max_days_ahead}
      initialServiceId={servico}
      demo={demo}
      address={settings.address ?? ""}
      whatsapp={settings.whatsapp}
    />
  )
}
