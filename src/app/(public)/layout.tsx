import { SiteFooter } from "@/components/site-footer"
import { SiteHeader, TabBar } from "@/components/site-header"
import { getPublicData } from "@/lib/data"
import { formatPhone, summarizeHours } from "@/lib/utils"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings, hours } = await getPublicData()
  return (
    <>
      <SiteHeader />
      <main className="px-4 pt-[calc(4.5rem+env(safe-area-inset-top)+1.5rem)] pb-16">{children}</main>
      <SiteFooter
        name={settings.business_name}
        address={settings.address ?? ""}
        phone={formatPhone(settings.whatsapp)}
        whatsapp={settings.whatsapp}
        instagram={settings.instagram}
        hours={summarizeHours(hours)}
      />
      {/* espaço para a barra inferior do celular não cobrir o rodapé */}
      <div className="h-24 sm:hidden" aria-hidden />
      <TabBar />
    </>
  )
}
