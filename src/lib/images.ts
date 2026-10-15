// Fotos do Pexels (licença livre), escolhidas em tons claros e nude para combinarem.
// Trocar pelas fotos reais do studio quando houver (ver public/instagram).
const px = (id: number, path?: string) =>
  `https://images.pexels.com/photos/${id}/${path ?? `pexels-photo-${id}.jpeg`}`

export type Img = { src: string; alt: string }

export const IMAGES = {
  hero: { src: px(6941115), alt: "Mãos com unhas nude sobre tecido branco" },
  detail: { src: px(34941685, "pexels-photo-34941685/free-photo-of-elegant-close-up-of-hand-with-manicure-and-pearl-details.jpeg"), alt: "Unhas feitas com detalhes de pérolas" },
  about: { src: px(4783262), alt: "Atendimento de manicure no studio" },
  cta: { src: px(34941704, "pexels-photo-34941704/free-photo-of-elegant-hand-holding-decorative-white-poinsettia.jpeg"), alt: "Mão com unhas feitas segurando uma flor branca" },
  gallery: [
    { src: px(35491156, "pexels-photo-35491156/free-photo-of-elegant-nude-and-glitter-manicure-close-up.jpeg"), alt: "Unhas nude com glitter e flor" },
    { src: px(19192220, "pexels-photo-19192220/free-photo-of-rings-on-woman-hands.jpeg"), alt: "Mãos com anéis e unhas feitas" },
    { src: px(20758448, "pexels-photo-20758448/free-photo-of-pink-flower-on-hand-with-polished-nails.jpeg"), alt: "Unhas rosa claro segurando flor" },
    { src: px(15001876, "pexels-photo-15001876/free-photo-of-a-person-wearing-gold-rings.jpeg"), alt: "Mãos com anéis dourados" },
    { src: px(17280274, "pexels-photo-17280274/free-photo-of-manicure-on-woman-hands.jpeg"), alt: "Unhas nude com glitter" },
    { src: px(34885842, "pexels-photo-34885842/free-photo-of-close-up-of-elegant-manicured-nails-with-floral-design.jpeg"), alt: "Unhas rosa com detalhe floral" },
  ] satisfies Img[],
} satisfies Record<string, Img | Img[]>

// Foto por serviço (pelo nome); categoria como reserva.
const BY_NAME: Record<string, Img> = {
  "Alongamento Fibra de Vidro": { src: px(35491156, "pexels-photo-35491156/free-photo-of-elegant-nude-and-glitter-manicure-close-up.jpeg"), alt: "Alongamento nude com acabamento fino" },
  "Manutenção de Alongamento": { src: px(35103938, "pexels-photo-35103938/free-photo-of-elegant-manicure-with-gel-nail-polish-application.jpeg"), alt: "Aplicação de gel na manutenção" },
  "Banho em Gel": { src: px(17280274, "pexels-photo-17280274/free-photo-of-manicure-on-woman-hands.jpeg"), alt: "Unhas com banho em gel" },
  "Esmaltação em Gel": { src: px(35103940, "pexels-photo-35103940/free-photo-of-woman-applying-nude-nail-polish-up-close.jpeg"), alt: "Esmaltação em gel nude" },
  "Mão e Pé": { src: px(3997375), alt: "Manicure cuidando das unhas" },
  "Massagem Relaxante": { src: px(3738377), alt: "Tratamento e massagem nas mãos" },
}
const BY_CATEGORY: Record<string, Img> = {
  Alongamento: BY_NAME["Alongamento Fibra de Vidro"],
  Gel: BY_NAME["Banho em Gel"],
  Manicure: BY_NAME["Mão e Pé"],
  Estética: BY_NAME["Massagem Relaxante"],
}

export const serviceImage = (name: string, category: string): Img =>
  BY_NAME[name] ?? BY_CATEGORY[category] ?? IMAGES.gallery[0]
