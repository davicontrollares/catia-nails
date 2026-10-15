"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Clock, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { duration } from "@/lib/utils"
import type { Service } from "@/lib/types"
import { brl, cn } from "@/lib/utils"
import { saveService } from "../actions"

type Draft = Omit<Service, "id" | "sort"> & { id?: string }
const EMPTY: Draft = { name: "", description: "", category: "Gel", duration_min: 60, price: 0, active: true }

export function ServiceManager({ services }: { services: Service[] }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [pending, start] = useTransition()

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    start(async () => {
      const res = await saveService(draft)
      if (!res.ok) return void toast.error(res.error)
      toast.success("Serviço salvo")
      setDraft(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setDraft(EMPTY)}><Plus /> Novo serviço</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className={cn("border bg-card shadow-sm flex flex-col gap-3 rounded-3xl p-5", !s.active && "opacity-60")}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="outline">{s.category}</Badge>
                <p className="mt-2 font-semibold">{s.name}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Editar ${s.name}`} onClick={() => setDraft({ ...s, price: Number(s.price) })}>
                <Pencil className="size-4" />
              </Button>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-auto flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground"><Clock className="size-4" /> {duration(s.duration_min)}</span>
              <span className="text-lg font-semibold">{brl(Number(s.price))}</span>
            </div>
            {!s.active && <Badge variant="secondary" className="w-fit">Inativo</Badge>}
          </div>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="border bg-popover shadow-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <form onSubmit={save} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="s-name">Nome</Label>
                <Input id="s-name" required className="h-11 rounded-xl" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-desc">Descrição</Label>
                <Textarea id="s-desc" className="rounded-xl" value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="s-cat">Categoria</Label>
                  <Input id="s-cat" required className="h-11 rounded-xl" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-dur">Duração (min)</Label>
                  <Input id="s-dur" type="number" min={5} step={5} required className="h-11 rounded-xl" value={draft.duration_min} onChange={(e) => setDraft({ ...draft, duration_min: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-price">Preço (R$)</Label>
                  <Input id="s-price" type="number" min={0} step="0.01" required className="h-11 rounded-xl" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
                </div>
              </div>
              <label className="flex items-center justify-between rounded-xl px-1 py-2">
                <span className="text-sm font-medium">Disponível para agendamento</span>
                <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
              </label>
              <Button type="submit" size="lg" className="w-full" disabled={pending}>Salvar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
