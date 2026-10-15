"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { serviceImage } from "@/lib/images"
import type { Service } from "@/lib/types"
import { brl, duration } from "@/lib/utils"

export function ServicesTabs({ services }: { services: Service[] }) {
  const categories = ["Todos", ...new Set(services.map((s) => s.category))]
  return (
    <Tabs defaultValue="Todos" className="gap-6">
      <TabsList className="glass mx-auto h-11 max-w-full overflow-x-auto rounded-full p-1 [scrollbar-width:none]">
        {categories.map((c) => (
          <TabsTrigger key={c} value={c} className="rounded-full px-4">
            {c}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((c) => (
        <TabsContent key={c} value={c}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((s) => c === "Todos" || s.category === c)
              .map((s) => (
                <Link key={s.id} href={`/agendar?servico=${s.id}`} className="group block h-full transition active:scale-[0.98]">
                  <Card className="h-full pt-0 transition-shadow group-hover:shadow-2xl">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={serviceImage(s.name, s.category).src}
                        alt={serviceImage(s.name, s.category).alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-lg leading-snug">{s.name}</CardTitle>
                        <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                      </div>
                      <CardDescription>{s.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto justify-between border-0 bg-transparent">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-4" /> {duration(s.duration_min)}
                      </span>
                      <span className="text-lg font-semibold tabular-nums">{brl(Number(s.price))}</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
