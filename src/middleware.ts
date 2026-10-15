import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { hasSupabase, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  // Sem Supabase configurado não há login: o painel fica fechado.
  if (!hasSupabase) {
    if (request.nextUrl.pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/", request.url))
    return response
  }
  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if ((path.startsWith("/admin") || path.startsWith("/meus-agendamentos")) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/entrar"
    url.searchParams.set("next", path)
    return NextResponse.redirect(url)
  }
  if (path.startsWith("/admin") && user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (data?.role !== "owner") return NextResponse.redirect(new URL("/", request.url))
  }
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|.*\.(?:svg|png|jpg|webp)$).*)"],
}
