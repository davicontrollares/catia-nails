import { SiteHeader, TabBar } from "@/components/site-header"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="px-4 pt-6 pb-32 sm:pb-16">{children}</main>
      <TabBar />
    </>
  )
}
