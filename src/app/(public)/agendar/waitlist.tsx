"use client"

import { useState, useTransition } from "react"
import { BellRing } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { joinWaitlist } from "./actions"

export function WaitlistButton({ date, serviceIds }: { date: string; serviceIds: string[] }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", email: "" })
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await joinWaitlist({ ...form, date, serviceIds })
      if (!res.ok) return void toast.error(res.error)
      toast.success("Pronto, avisamos você se abrir uma vaga.")
      setOpen(false)
    })
  }

  return (
    <>
      <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => setOpen(true)}>
        <BellRing /> Entrar na lista de espera
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-4 rounded-3xl p-6 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Lista de espera</DialogTitle>
            <DialogDescription>Se um horário abrir perto desse dia, a gente chama você.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="w-name">Nome</Label>
              <Input id="w-name" required autoComplete="name" className="h-12 rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="w-phone">WhatsApp</Label>
              <Input id="w-phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="(17) 99999-9999" className="h-12 rounded-xl" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="w-email">E-mail (opcional)</Label>
              <Input id="w-email" type="email" inputMode="email" autoComplete="email" className="h-12 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <Button type="submit" size="lg" className="mt-1 h-12" disabled={pending}>Quero ser avisada</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
