"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export function GalleryCarousel({ photos }: { photos: { src: string; alt: string }[] }) {
  // autoplay só para quem não pediu menos movimento no sistema
  const [plugins, setPlugins] = useState<ReturnType<typeof Autoplay>[]>([])
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    setPlugins([Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })])
  }, [])

  return (
    <Carousel key={plugins.length} opts={{ align: "start", loop: true, dragFree: true }} plugins={plugins} className="w-full">
      <CarouselContent className="-ml-3 md:-ml-4">
        {photos.map((p, i) => (
          <CarouselItem key={p.src} className="basis-[72%] pl-3 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 72vw"
                priority={i < 2}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <Link
                href="/agendar"
                aria-label="Agendar horário"
                className="glass-strong absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full text-foreground transition-transform hover:-translate-y-0.5"
              >
                <Plus className="size-5" />
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex justify-end gap-2">
        <CarouselPrevious className="static size-11 translate-y-0 bg-background/70 backdrop-blur" />
        <CarouselNext className="static size-11 translate-y-0 bg-background/70 backdrop-blur" />
      </div>
    </Carousel>
  )
}
