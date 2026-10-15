"use client"

// Pagamento SIMULADO. Nenhum valor é cobrado: serve para mostrar o fluxo
// antes de integrar Pix/Mercado Pago de verdade.

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Check, Copy, CreditCard, Loader2, QrCode, Store } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { brl, cn } from "@/lib/utils"

export type PayMethod = "local" | "pix" | "mp"

export const PAY_LABEL: Record<PayMethod, string> = {
  local: "Pagar no studio",
  pix: "Pix",
  mp: "Cartão via Mercado Pago",
}

const METHODS: { id: PayMethod; title: string; help: string; icon: React.ElementType }[] = [
  { id: "pix", title: "Pix", help: "Aprovação na hora. QR code ou copia e cola.", icon: QrCode },
  { id: "mp", title: "Cartão via Mercado Pago", help: "Crédito em até 3x ou débito.", icon: CreditCard },
  { id: "local", title: "Pagar no studio", help: "Pix, dinheiro ou cartão no dia.", icon: Store },
]

export function PaymentChoice({ value, onChange, total }: { value: PayMethod; onChange: (v: PayMethod) => void; total: number }) {
  return (
    <>
      <h1 className="font-display text-3xl sm:text-4xl">Pagamento</h1>
      <p className="mt-2 text-muted-foreground">Total de {brl(total)}. Escolha como prefere pagar.</p>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as PayMethod)} className="mt-6 grid gap-3">
        {METHODS.map(({ id, title, help, icon: Icon }) => (
          <Label
            key={id}
            htmlFor={`pay-${id}`}
            className={cn(
              "flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border bg-background px-5 py-4 font-normal transition-colors hover:border-primary/40",
              value === id && "border-primary bg-accent/60"
            )}
          >
            <RadioGroupItem id={`pay-${id}`} value={id} />
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
              <Icon className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block text-base font-medium">{title}</span>
              <span className="text-sm text-muted-foreground">{help}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <p className="mt-4 rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
        Demonstração: o pagamento online é simulado e nenhum valor é cobrado.
      </p>
    </>
  )
}

/** Tela de Pix simulada: QR code, copia e cola e contagem regressiva. */
export function PixDialog({ open, total, onPaid, onClose }: { open: boolean; total: number; onPaid: () => void; onClose: () => void }) {
  const code = `SIMULACAO-PIX|BELA-FLOR-NAILS|VALOR=${total.toFixed(2)}`
  const [left, setLeft] = useState(600)
  useEffect(() => {
    if (!open) return
    setLeft(600)
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pague com Pix</DialogTitle>
          <DialogDescription>Abra o app do banco e escaneie o código. Ele expira em {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}.</DialogDescription>
        </DialogHeader>
        <div className="mx-auto rounded-2xl bg-white p-4">
          <QRCodeSVG value={code} size={184} />
        </div>
        <p className="text-center text-2xl font-semibold tabular-nums">{brl(total)}</p>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard?.writeText(code)
            toast.success("Código copiado")
          }}
        >
          <Copy /> Copiar código Pix
        </Button>
        <Button size="lg" className="h-12" onClick={onPaid}>
          <Check /> Simular pagamento aprovado
        </Button>
        <p className="text-center text-xs text-muted-foreground">Demonstração: este código não cobra nada.</p>
      </DialogContent>
    </Dialog>
  )
}

/** Checkout de cartão simulado (fluxo parecido com o do Mercado Pago). */
export function CardDialog({ open, total, onPaid, onClose }: { open: boolean; total: number; onPaid: () => void; onClose: () => void }) {
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" })
  const [installments, setInstallments] = useState(1)
  const [processing, setProcessing] = useState(false)

  function pay(e: React.FormEvent) {
    e.preventDefault()
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      onPaid()
    }, 1600)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !processing && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cartão via Mercado Pago</DialogTitle>
          <DialogDescription>Checkout simulado. Use dados fictícios, nada é cobrado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={pay} className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="cc-number">Número do cartão</Label>
            <Input id="cc-number" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" className="h-11 rounded-xl" value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cc-name">Nome impresso</Label>
            <Input id="cc-name" autoComplete="off" className="h-11 rounded-xl" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="cc-exp">Validade</Label>
              <Input id="cc-exp" inputMode="numeric" autoComplete="off" placeholder="MM/AA" className="h-11 rounded-xl" value={card.exp}
                onChange={(e) => setCard({ ...card, exp: e.target.value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(?=\d)/, "$1/") })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cc-cvv">CVV</Label>
              <Input id="cc-cvv" inputMode="numeric" autoComplete="off" placeholder="123" className="h-11 rounded-xl" value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Parcelas</Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setInstallments(n)}
                  className={cn("rounded-xl border px-2 py-2 text-sm tabular-nums transition-colors", installments === n && "border-primary bg-accent")}
                >
                  {n}x {brl(total / n)}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-2 h-12" disabled={processing}>
            {processing ? <><Loader2 className="animate-spin" /> Processando</> : `Pagar ${brl(total)}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
