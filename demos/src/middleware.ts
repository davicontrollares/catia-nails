import { NextResponse, type NextRequest } from "next/server"

// Cada estúdio tem um subdomínio (hope-nail-spa.dominio.com): a raiz mostra a página dele.
const SLUGS = ["hope-nail-spa", "unique-nails", "katies-nails-spa"]

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase()
  const slug = SLUGS.find((s) => host.startsWith(`${s}.`))
  if (slug && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone()
    url.pathname = `/${slug}`
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ["/"] }
