import "server-only"
import { IMAGES, type Img } from "./images"

/**
 * Fotos da carrossel: usa os arquivos de public/instagram quando existirem,
 * senão as fotos de exemplo. Só roda no servidor.
 */
export async function getGalleryPhotos(): Promise<Img[]> {
  const { readdir } = await import("node:fs/promises")
  const path = await import("node:path")
  try {
    const files = (await readdir(path.join(process.cwd(), "public", "instagram")))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
    if (files.length) return files.map((f, i) => ({ src: `/instagram/${f}`, alt: `Trabalho da Catia Rodrigues ${i + 1}` }))
  } catch {
    // pasta ausente: segue com as fotos de exemplo
  }
  return [IMAGES.hero, IMAGES.detail, ...IMAGES.gallery, IMAGES.cta]
}
