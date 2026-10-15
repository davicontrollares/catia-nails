// A integração Supabase da Vercel cria NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// projetos antigos usam NEXT_PUBLIC_SUPABASE_ANON_KEY. Aceita as duas.
// (referências literais para o Next.js embutir os valores no navegador)
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY)
