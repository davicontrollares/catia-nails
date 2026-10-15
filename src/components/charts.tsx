"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { brl } from "@/lib/utils"

const config = { total: { label: "Receita", color: "var(--chart-1)" } } satisfies ChartConfig

export function RevenueArea({ data }: { data: { label: string; total: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.45} />
            <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeOpacity={0.4} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v) => `R$${v}`} />
        <ChartTooltip content={<ChartTooltipContent formatter={(v) => brl(Number(v))} />} />
        <Area dataKey="total" type="monotone" stroke="var(--color-total)" strokeWidth={2.5} fill="url(#fillTotal)" />
      </AreaChart>
    </ChartContainer>
  )
}

export function HBar({ data }: { data: { name: string; total: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(160, data.length * 44) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} />
        <ChartTooltip content={<ChartTooltipContent formatter={(v) => brl(Number(v))} />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={10} />
      </BarChart>
    </ChartContainer>
  )
}
