import type { Professional, Service, Settings } from "./types"

export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Usado só quando o Supabase ainda não está configurado (preview local).
export const DEMO_SETTINGS: Settings = {
  id: 1,
  business_name: "Catia Rodrigues Nails",
  tagline: "Especialista em fibra de vidro · +5 mil atendimentos desde 2015",
  address: "R. São Rafael, 96 - Vila São Pedro, São José do Rio Preto - SP",
  whatsapp: "5517996341375",
  instagram: "catiarodriguesnails",
  facebook: "studiocatiarodrigues",
  min_notice_hours: 2,
  max_days_ahead: 45,
  cancel_notice_hours: 12,
  slot_step_min: 30,
}

export const DEMO_PROFESSIONAL: Professional = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Catia Rodrigues",
  bio: "Nail designer desde 2015, especialista em alongamento em fibra de vidro e banho em gel.",
  photo_url: null,
  commission_pct: 0,
  active: true,
}

const s = (id: string, name: string, description: string, category: string, duration_min: number, price: number, sort: number): Service =>
  ({ id, name, description, category, duration_min, price, active: true, sort })

export const DEMO_SERVICES: Service[] = [
  s("d1", "Alongamento Fibra de Vidro", "Alongamento com aparência natural, acabamento fino e alta durabilidade.", "Alongamento", 150, 220, 1),
  s("d2", "Manutenção de Alongamento", "Manutenção a cada 20 a 25 dias para manter o alongamento perfeito.", "Alongamento", 90, 130, 2),
  s("d3", "Banho em Gel", "Camada de gel sobre a unha natural para fortalecer e dar brilho.", "Gel", 90, 120, 3),
  s("d4", "Esmaltação em Gel", "Esmaltação que dura semanas sem descascar.", "Gel", 60, 70, 4),
  s("d5", "Mão e Pé", "Cutilagem e esmaltação tradicional.", "Manicure", 90, 70, 5),
  s("d6", "Massagem Relaxante", "Massagem relaxante para o corpo.", "Estética", 60, 100, 6),
]

export async function getPublicData() {
  if (!hasSupabase) {
    return { settings: DEMO_SETTINGS, services: DEMO_SERVICES, professionals: [DEMO_PROFESSIONAL], demo: true }
  }
  const { createClient } = await import("./supabase/server")
  const supabase = await createClient()
  const [settings, services, professionals] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).single(),
    supabase.from("services").select("*").eq("active", true).order("sort"),
    supabase.from("professionals").select("*").eq("active", true).order("name"),
  ])
  return {
    settings: (settings.data as Settings) ?? DEMO_SETTINGS,
    services: (services.data as Service[]) ?? [],
    professionals: (professionals.data as Professional[]) ?? [],
    demo: false,
  }
}

export { duration } from "./utils"
