"use client"

import { Suspense, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function EntrarPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const next = useSearchParams().get("next") ?? "/meus-agendamentos"
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" })
  const [pending, start] = useTransition()
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const redirectTo = () => `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!configured) return void toast.error("Conecte o Supabase para ativar o login.")
    start(async () => {
      const supabase = createClient()
      const { error } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
          : await supabase.auth.signUp({
              email: form.email,
              password: form.password,
              options: { data: { full_name: form.name, phone: form.phone }, emailRedirectTo: redirectTo() },
            })
      if (error) return void toast.error(error.message)
      if (mode === "signup") toast.success("Conta criada! Confira seu e-mail para confirmar.")
      router.push(next)
      router.refresh()
    })
  }

  function magicLink() {
    if (!configured) return void toast.error("Conecte o Supabase para ativar o login.")
    if (!form.email) return void toast.error("Digite seu e-mail.")
    start(async () => {
      const { error } = await createClient().auth.signInWithOtp({ email: form.email, options: { emailRedirectTo: redirectTo() } })
      if (error) toast.error(error.message)
      else toast.success("Enviamos um link de acesso para seu e-mail.")
    })
  }

  async function google() {
    if (!configured) return void toast.error("Conecte o Supabase para ativar o login.")
    await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } })
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{mode === "login" ? "Entrar" : "Criar conta"}</CardTitle>
        <CardDescription>Acompanhe e gerencie seus horários.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <Field id="name" label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
              <Field id="phone" label="WhatsApp" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
            </>
          )}
          <Field id="email" label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" />
          <Field
            id="password"
            label="Senha"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        <div className="mt-3 grid gap-2">
          <Button variant="secondary" onClick={magicLink} disabled={pending}>
            <Mail /> Receber link por e-mail
          </Button>
          <Button variant="secondary" onClick={google}>Continuar com Google</Button>
          <Button variant="link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Não tem conta? Criar agora" : "Já tenho conta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  autoComplete?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required autoComplete={autoComplete} className="h-12 rounded-xl" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
