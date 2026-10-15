"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AtSign, MapPin, MessageCircle, Store } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppSelect } from "@/components/app-select"
import type { Settings } from "@/lib/types"
import { formatPhone } from "@/lib/utils"
import { saveSettings } from "../actions"

type Form = {
  business_name: string
  tagline: string
  address: string
  whatsapp: string
  instagram: string
  min_notice_hours: number
  max_days_ahead: number
  cancel_notice_hours: number
  slot_step_min: number
}

const RULES: { key: keyof Form; title: string; help: string; options: number[]; unit: (n: number) => string }[] = [
  {
    key: "min_notice_hours",
    title: "Antecedência para agendar",
    help: "Prazo mínimo para a cliente marcar.",
    options: [1, 2, 4, 12, 24],
    unit: (n) => `${n}h`,
  },
  {
    key: "max_days_ahead",
    title: "Agenda aberta até",
    help: "Quantos dias à frente a agenda mostra.",
    options: [15, 30, 45, 60, 90],
    unit: (n) => `${n} dias`,
  },
  {
    key: "cancel_notice_hours",
    title: "Antecedência para cancelar",
    help: "Depois disso, só pelo WhatsApp.",
    options: [2, 6, 12, 24, 48],
    unit: (n) => `${n}h`,
  },
  {
    key: "slot_step_min",
    title: "Intervalo entre horários",
    help: "Espaço entre os horários oferecidos.",
    options: [15, 30, 45, 60],
    unit: (n) => `${n} min`,
  },
]

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter()
  const [pending, run] = useTransition()
  const initial = useMemo<Form>(
    () => ({
      business_name: settings.business_name,
      tagline: settings.tagline ?? "",
      address: settings.address ?? "",
      whatsapp: settings.whatsapp ?? "",
      instagram: settings.instagram ?? "",
      min_notice_hours: settings.min_notice_hours,
      max_days_ahead: settings.max_days_ahead,
      cancel_notice_hours: settings.cancel_notice_hours,
      slot_step_min: settings.slot_step_min,
    }),
    [settings]
  )
  const [f, setF] = useState<Form>(initial)
  const dirty = JSON.stringify(f) !== JSON.stringify(initial)

  function save() {
    run(async () => {
      const res = await saveSettings(f)
      if (!res.ok) return void toast.error(res.error)
      toast.success("Configurações salvas")
      router.refresh()
    })
  }

  const field = (key: "business_name" | "tagline" | "address", label: string, icon: React.ReactNode, placeholder?: string) => (
    <div className="grid gap-2">
      <Label htmlFor={key}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">{icon}</span>
        <Input id={key} placeholder={placeholder} className="h-11 rounded-xl pl-10" value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
      </div>
    </div>
  )

  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Dados do studio</CardTitle>
          <CardDescription>Aparecem no site, no rodapé e no e-mail de confirmação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("business_name", "Nome", <Store />)}
          {field("tagline", "Frase de destaque", <Store />, "Ex.: Especialista em fibra de vidro")}
          {field("address", "Endereço", <MapPin />)}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="relative">
                <MessageCircle className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  inputMode="tel"
                  className="h-11 rounded-xl pl-10"
                  value={formatPhone(f.whatsapp) || f.whatsapp}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").replace(/^55/, "").slice(0, 11)
                    setF({ ...f, whatsapp: d ? `55${d}` : "" })
                  }}
                  placeholder="(17) 99999-9999"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="instagram"
                  className="h-11 rounded-xl pl-10"
                  value={f.instagram}
                  onChange={(e) => setF({ ...f, instagram: e.target.value.replace(/^@/, "").trim() })}
                  placeholder="seuperfil"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Regras de agendamento</CardTitle>
          <CardDescription>Valem para os próximos agendamentos.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {RULES.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.help}</p>
              </div>
              <AppSelect
                aria-label={r.title}
                value={String(f[r.key])}
                onChange={(v) => setF({ ...f, [r.key]: Number(v) })}
                options={r.options.map((o) => ({ value: String(o), label: r.unit(o) }))}
                className="h-10 w-32 shrink-0"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 xl:col-span-2">
        <div className="flex items-center gap-2">
          {dirty && <span className="text-sm text-muted-foreground">Alterações não salvas</span>}
          {dirty && <Button variant="ghost" onClick={() => setF(initial)}>Desfazer</Button>}
          <Button onClick={save} disabled={!dirty || pending}>Salvar</Button>
        </div>
      </div>
    </div>
  )
}
