// Fotos do Pexels (licença livre). Trocar pelas fotos reais do studio quando houver.
const px = (id: number, path?: string) =>
  `https://images.pexels.com/photos/${id}/${path ?? `pexels-photo-${id}.jpeg`}`

export const IMAGES = {
  hero: { src: px(3997391), alt: "Manicure aplicando gel em unhas no studio" },
  about: { src: px(4783262), alt: "Atendimento de manicure em salão" },
  byCategory: {
    Alongamento: { src: px(34885844, "pexels-photo-34885844/free-photo-of-elegant-hand-with-pink-nail-art-and-gold-ring.jpeg"), alt: "Unhas alongadas rosa com anel dourado" },
    Gel: { src: px(34835283, "pexels-photo-34835283/free-photo-of-close-up-of-artistic-pink-manicure-with-glitter.jpeg"), alt: "Unhas em gel rosa com glitter" },
    Manicure: { src: px(3997375), alt: "Manicure lixando unhas de cliente" },
    "Estética": { src: px(3738377), alt: "Tratamento de mãos em salão" },
  } as Record<string, { src: string; alt: string }>,
  gallery: [
    { src: px(20758448, "pexels-photo-20758448/free-photo-of-pink-flower-on-hand-with-polished-nails.jpeg"), alt: "Unhas rosa claro segurando flor" },
    { src: px(34885842, "pexels-photo-34885842/free-photo-of-close-up-of-elegant-manicured-nails-with-floral-design.jpeg"), alt: "Unhas rosa com detalhe floral" },
    { src: px(7795525), alt: "Mão com unhas feitas e relógio dourado" },
    { src: px(34871556, "pexels-photo-34871556/free-photo-of-stylish-red-manicure-on-fluffy-surface.jpeg"), alt: "Unhas vermelhas sobre tecido branco" },
    { src: px(3738369), alt: "Unhas cor vinho em salão" },
  ],
}

export const FALLBACK_IMAGE = IMAGES.byCategory.Gel

// Fotos específicas por serviço, para não repetir dentro da mesma categoria.
const BY_SERVICE: Record<string, { src: string; alt: string }> = {
  "Manutenção de Alongamento": { src: px(22668317, "pexels-photo-22668317/free-photo-of-woman-making-nails-at-beautician.jpeg"), alt: "Manutenção de unhas em andamento" },
  "Esmaltação em Gel": { src: px(3997382), alt: "Esmaltação em gel vermelha no salão" },
}

export const serviceImage = (name: string, category: string) =>
  BY_SERVICE[name] ?? IMAGES.byCategory[category] ?? FALLBACK_IMAGE
