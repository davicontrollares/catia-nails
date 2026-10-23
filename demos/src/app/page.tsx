import Link from "next/link"
import { STUDIOS } from "@/lib/studios"

export default function Index() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Nail studio concepts</h1>
      <p className="mt-2 text-sm text-neutral-600">Private demos. Not the official websites of these businesses.</p>
      <ul className="mt-8 grid gap-3">
        {STUDIOS.map((s) => (
          <li key={s.slug}>
            <Link href={`/${s.slug}`} className="block rounded-2xl border border-neutral-200 p-5 hover:bg-neutral-50">
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-neutral-600">{s.address}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
