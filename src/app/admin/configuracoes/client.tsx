"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Settings } from "@/lib/types"
import { saveSettings } from "../actions"

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [f, setF] = useState({
    business_name: settings.business_name,
    tagline: settings.tagline ?? "",
    address: settings.address ?? "",
    whatsapp: settings.whatsapp ?? "",
    instagram: settings.instagram ?? "",
    min_notice_hours: settings.min_notice_hours,
    max_days_ahead: settings.max_days_ahead,
    cancel_notice_hours: settings.cancel_notice_hours,
    slot_step_min: settings.slot_step_min,
  })

  const text = (key: keyof typeof f, label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} className="h-11 rounded-xl" value={String(f[key])} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
    </div>
  )
  const num = (key: keyof typeof f, label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} type="number" min={0} className="h-11 rounded-xl" value={Number(f[key])} onChange={(e) => setF({ ...f, [key]: Number(e.target.value) })} />
    </div>
  )

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await saveSettings(f)
      if (!res.ok) return void toast.error(res.error)
      toast.success("Configurações salvas")
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Studio</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {text("business_name", "Nome")}
          {text("tagline", "Frase de destaque")}
          {text("address", "Endereço")}
          {text("whatsapp", "WhatsApp (com DDI, só números)")}
          {text("instagram", "Instagram (sem @)")}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Regras de agendamento</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {num("min_notice_hours", "Antecedência mínima para agendar (horas)")}
          {num("max_days_ahead", "Agendar até quantos dias à frente")}
          {num("cancel_notice_hours", "Antecedência mínima para cancelar (horas)")}
          {num("slot_step_min", "Intervalo entre horários oferecidos (min)")}
        </CardContent>
      </Card>
      <Button type="submit" size="lg" className="lg:col-span-2" disabled={pending}>Salvar configurações</Button>
    </form>
  )
}
