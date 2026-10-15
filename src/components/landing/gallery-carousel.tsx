"use client"

import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export function GalleryCarousel({ photos }: { photos: { src: string; alt: string }[] }) {
  return (
    <Carousel opts={{ align: "start", loop: true, dragFree: true }} className="w-full">
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
