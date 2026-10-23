import { notFound } from "next/navigation"
import { StudioSite } from "@/components/studio-site"
import { getStudio, STUDIOS } from "@/lib/studios"

export const dynamicParams = false

export function generateStaticParams() {
  return STUDIOS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const studio = getStudio((await params).slug)
  return { title: studio ? `${studio.name} · concept` : "Demo" }
}

export default async function StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const studio = getStudio((await params).slug)
  if (!studio) notFound()
  return <StudioSite studio={studio} />
}
