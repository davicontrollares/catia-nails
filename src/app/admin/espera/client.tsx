"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Mail, MessageCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPhone } from "@/lib/utils"
import { markWaitlistNotified, notifyWaitlistByEmail, removeWaitlistEntry } from "../actions"

export type WaitlistEntry = {
  id: string
  client_name: string
  client_phone: string
  client_email: string | null
  wanted_date: string | null
  notified_at: string | null
}

const fmtDate = (d: string) => new Date(`${d}T12:00:00-03:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })

function Row({ e }: { e: WaitlistEntry }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const digits = e.client_phone.replace(/\D/g, "")
  const text = `Oi, ${e.client_name.split(" ")[0]}! Abriu um horário na Bela Flor Nails. Quer agendar? ${window.location.origin}/agendar`
  const wa = `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}?text=${encodeURIComponent(text)}`

  function act(fn: () => Promise<{ ok: true } | { ok: false; error: string }>, ok?: string) {
    start(async () => {
      const res = await fn()
      if (!res.ok) return void toast.error(res.error)
      if (ok) toast.success(ok)
      router.refresh()
    })
  }

  return (
    <div className="border bg-card shadow-sm flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {e.client_name}
          {e.notified_at && <Badge variant="secondary">Avisada</Badge>}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatPhone(e.client_phone)}
          {e.client_email && ` · ${e.client_email}`}
        </p>
        {e.wanted_date && <p className="text-sm text-muted-foreground first-letter:uppercase">Queria {fmtDate(e.wanted_date)}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          onClick={() => act(() => markWaitlistNotified(e.id))}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-medium text-white hover:bg-[#1fb857]"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
        {e.client_email && (
          <Button variant="outline" className="h-11 rounded-full" disabled={pending} onClick={() => act(() => notifyWaitlistByEmail(e.id), "E-mail enviado.")}>
            <Mail /> E-mail
          </Button>
        )}
        <ConfirmDialog
          title="Tirar da lista de espera?"
          description={`${e.client_name} não será mais avisada.`}
          confirmLabel="Tirar da lista"
          onConfirm={() => act(() => removeWaitlistEntry(e.id))}
          trigger={(open) => (
            <Button variant="ghost" size="icon" className="size-11" aria-label="Tirar da lista" disabled={pending} onClick={open}>
              <Trash2 />
            </Button>
          )}
        />
      </div>
    </div>
  )
}

export function WaitlistList({ entries }: { entries: WaitlistEntry[] }) {
  if (!entries.length) {
    return <p className="border bg-card shadow-sm mt-4 rounded-3xl p-8 text-center text-muted-foreground">Ninguém na lista de espera por enquanto.</p>
  }
  return (
    <div className="mt-4 grid gap-3">
      {entries.map((e) => <Row key={e.id} e={e} />)}
    </div>
  )
}
