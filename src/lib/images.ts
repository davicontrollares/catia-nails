// Fotos do Pexels (licença livre). Trocar pelas fotos reais do studio quando houver.
const px = (id: number, path?: string) =>
  `https://images.pexels.com/photos/${id}/${path ?? `pexels-photo-${id}.jpeg`}`

type Img = { src: string; alt: string }

export const IMAGES = {
  hero: { src: px(20758448, "pexels-photo-20758448/free-photo-of-pink-flower-on-hand-with-polished-nails.jpeg"), alt: "Mão com unhas rosa claro segurando uma flor" },
  detail: { src: px(34835283, "pexels-photo-34835283/free-photo-of-close-up-of-artistic-pink-manicure-with-glitter.jpeg"), alt: "Detalhe de unhas em gel rosa" },
  menu: { src: px(3997391), alt: "Aplicação de gel nas unhas durante o atendimento" },
  about: { src: px(4783262), alt: "Atendimento de manicure no studio" },
  cta: { src: px(34885842, "pexels-photo-34885842/free-photo-of-close-up-of-elegant-manicured-nails-with-floral-design.jpeg"), alt: "Unhas rosa com detalhe floral" },
  gallery: [
    { src: px(34885844, "pexels-photo-34885844/free-photo-of-elegant-hand-with-pink-nail-art-and-gold-ring.jpeg"), alt: "Unhas alongadas rosa com anel dourado" },
    { src: px(7795525), alt: "Mão com unhas feitas e relógio dourado" },
    { src: px(34871556, "pexels-photo-34871556/free-photo-of-stylish-red-manicure-on-fluffy-surface.jpeg"), alt: "Unhas vermelhas sobre tecido branco" },
    { src: px(3738369), alt: "Unhas cor vinho" },
  ] satisfies Img[],
} satisfies Record<string, Img | Img[]>
