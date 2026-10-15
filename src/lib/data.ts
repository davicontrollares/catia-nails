import type { Professional, Service, Settings, WorkingHour } from "./types"

export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Só usado se o Supabase não estiver configurado: o site mostra a agenda como indisponível.
const FALLBACK_SETTINGS: Settings = {
  id: 1,
  business_name: "Bela Flor Nails",
  tagline: null,
  address: null,
  whatsapp: null,
  instagram: null,
  facebook: null,
  min_notice_hours: 2,
  max_days_ahead: 45,
  cancel_notice_hours: 12,
  slot_step_min: 30,
}

export { FALLBACK_SETTINGS }

export async function getPublicData() {
  if (!hasSupabase) {
    console.error("Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.")
    return { settings: FALLBACK_SETTINGS, services: [] as Service[], professionals: [] as Professional[], hours: [] as WorkingHour[] }
  }
  const { createClient } = await import("./supabase/server")
  const supabase = await createClient()
  const [settings, services, professionals, hours] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).single(),
    supabase.from("services").select("*").eq("active", true).order("sort"),
    supabase.from("professionals").select("*").eq("active", true).order("name"),
    supabase.from("working_hours").select("*").order("weekday").order("start_time"),
  ])
  return {
    settings: (settings.data as Settings) ?? FALLBACK_SETTINGS,
    services: (services.data as Service[]) ?? [],
    professionals: (professionals.data as Professional[]) ?? [],
    hours: (hours.data as WorkingHour[]) ?? [],
  }
}

export { duration } from "./utils"
