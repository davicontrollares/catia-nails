import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export const TZ = "America/Sao_Paulo"

export function duration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h${m ? ` ${m}min` : ""}` : `${m}min`
}
