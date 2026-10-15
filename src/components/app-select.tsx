"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Option = { value: string; label: string }

/** Select do shadcn com lista simples de opções. */
export function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  id,
  "aria-label": ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  id?: string
  "aria-label"?: string
}) {
  return (
    <Select items={options} value={value} onValueChange={(v) => v != null && onChange(String(v))}>
      <SelectTrigger id={id} aria-label={ariaLabel} className={cn("h-11 w-full rounded-xl bg-background/50 px-3", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border bg-popover shadow-xl rounded-2xl">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="rounded-xl">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
