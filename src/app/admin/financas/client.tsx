"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AppSelect } from "@/components/app-select"
import { Input } from "@/components/ui/input"
import { toCsv } from "@/lib/finance"
import { addExpense, removeExpense } from "../actions"

const CATEGORIES = ["Produtos", "Aluguel", "Contas", "Marketing", "Salários", "Impostos", "Outros"]

export function ExpenseForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [f, setF] = useState({ category: "Produtos", description: "", amount: "", spent_on: new Date().toLocaleDateString("en-CA") })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await addExpense(f)
      if (!res.ok) return void toast.error(res.error)
      toast.success("Despesa lançada")
      setF({ ...f, description: "", amount: "" })
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <AppSelect
        aria-label="Categoria"
        value={f.category}
        onChange={(v) => setF({ ...f, category: v })}
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      />
      <Input placeholder="Descrição" className="h-11 rounded-xl" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" step="0.01" min="0.01" required placeholder="Valor (R$)" className="h-11 rounded-xl" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <Input type="date" required className="h-11 rounded-xl" value={f.spent_on} onChange={(e) => setF({ ...f, spent_on: e.target.value })} aria-label="Data" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>Lançar</Button>
    </form>
  )
}

export function RemoveExpense({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Excluir despesa"
      disabled={pending}
      onClick={() => {
        if (!confirm("Excluir esta despesa?")) return
        start(async () => {
          const res = await removeExpense(id)
          if (!res.ok) toast.error(res.error)
          else router.refresh()
        })
      }}
    >
      <Trash2 />
    </Button>
  )
}

export function ExportCsv({ rows, filename }: { rows: Record<string, string | number | null>[]; filename: string }) {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        // BOM para o Excel abrir acentos corretamente
        const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
        URL.revokeObjectURL(a.href)
      }}
    >
      <Download /> Exportar CSV
    </Button>
  )
}
