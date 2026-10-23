// Fotos do Pexels (licença livre). Trocar pelas fotos reais de cada estúdio quando houver.
const px = (id: number, path?: string) => `https://images.pexels.com/photos/${id}/${path ?? `pexels-photo-${id}.jpeg`}`

export const PHOTOS = [
  { src: px(34311632, "pexels-photo-34311632/free-photo-of-elegant-jewelry-display-on-manicured-hands.jpeg"), alt: "Hands with delicate nails and a diamond necklace" },
  { src: px(7664093), alt: "Hand with delicate nails on peach silk" },
  { src: px(16363470, "pexels-photo-16363470/free-photo-of-hands-with-professional-manicure-done.jpeg"), alt: "Glitter pink nails on pink fabric" },
  { src: px(6941115), alt: "Hands with nude nails on white fabric" },
  { src: px(35491156, "pexels-photo-35491156/free-photo-of-elegant-nude-and-glitter-manicure-close-up.jpeg"), alt: "Nude and glitter manicure" },
  { src: px(20758448, "pexels-photo-20758448/free-photo-of-pink-flower-on-hand-with-polished-nails.jpeg"), alt: "Soft pink nails holding a flower" },
  { src: px(17280274, "pexels-photo-17280274/free-photo-of-manicure-on-woman-hands.jpeg"), alt: "Glossy manicure" },
  { src: px(34885842, "pexels-photo-34885842/free-photo-of-close-up-of-elegant-manicured-nails-with-floral-design.jpeg"), alt: "Pink nails with a floral detail" },
  { src: px(19192220, "pexels-photo-19192220/free-photo-of-rings-on-woman-hands.jpeg"), alt: "Hands with rings and polished nails" },
]

export type PaletteKey = "rose" | "cacau" | "floresta" | "magenta" | "noite"

type Palette = { label: string; paper: string; surface: string; ink: string; mute: string; accent: string; soft: string; btn: string; btnInk: string; heroA: string; heroB: string }

// Cores tiradas das paletas de referência (cada uma reduzida a papel, tinta, destaque e botão).
export const PALETTES: Record<PaletteKey, Palette> = {
  rose: { label: "Rosé", paper: "#FFF0F3", surface: "#FFFFFF", ink: "#590D22", mute: "#7B3346", accent: "#A4133C", soft: "#FFD6DE", btn: "#FF8FA3", btnInk: "#590D22", heroA: "#FFF0F3", heroB: "#FFC2CE" },
  cacau: { label: "Cacau", paper: "#FFF2DF", surface: "#FFFAF1", ink: "#3E2522", mute: "#7A5D52", accent: "#9A6B3E", soft: "#FFE0B2", btn: "#D3A376", btnInk: "#3E2522", heroA: "#FFF2DF", heroB: "#F2D2A8" },
  floresta: { label: "Floresta", paper: "#E3EED4", surface: "#F4F9EC", ink: "#0F2A1D", mute: "#375534", accent: "#3F6B49", soft: "#C5D8C6", btn: "#AEC3B0", btnInk: "#0F2A1D", heroA: "#E3EED4", heroB: "#AEC3B0" },
  magenta: { label: "Magenta", paper: "#FCEEF1", surface: "#FFFFFF", ink: "#4A0A1C", mute: "#881144", accent: "#B8244F", soft: "#F9DADD", btn: "#E8758F", btnInk: "#4A0A1C", heroA: "#FCEEF1", heroB: "#F2B3C1" },
  noite: { label: "Noite", paper: "#0B0E1A", surface: "#241829", ink: "#F3E9EC", mute: "#B9A0B0", accent: "#B47A9A", soft: "#2C1B2F", btn: "#B47A9A", btnInk: "#00030E", heroA: "#00030E", heroB: "#2C1B2F" },
}

export type Studio = {
  slug: string
  name: string
  tagline: string
  headline: [string, string]
  blurb: string
  address: string
  phone: string // só dígitos, com 1 na frente
  display: string // variável CSS da fonte dos títulos
  palette: PaletteKey
  photoOffset: number // desloca as fotos de exemplo para cada estúdio parecer diferente
  services: { name: string; text: string; price: string }[]
}

export const STUDIOS: Studio[] = [
  {
    slug: "hope-nail-spa",
    name: "Hope Nail Spa",
    tagline: "Nail spa in DeBary, FL",
    headline: ["Beautiful nails,", "a little time for you."],
    blurb: "Manicures, pedicures and nail art in a calm, clean space. Come in, sit back and leave with nails you love.",
    address: "35 S Charles Richard Beall Blvd, DeBary, FL 32713",
    phone: "13867427029",
    display: "var(--font-playfair)",
    palette: "rose",
    photoOffset: 0,
    services: [
      { name: "Classic Manicure", text: "Shape, cuticle care and polish.", price: "from $25" },
      { name: "Gel Manicure", text: "Long-lasting shine that stays put.", price: "from $38" },
      { name: "Spa Pedicure", text: "Soak, scrub, massage and polish.", price: "from $45" },
      { name: "Acrylic Full Set", text: "Custom length and shape.", price: "from $55" },
      { name: "Nail Art", text: "Hand-painted details and chrome.", price: "from $10" },
      { name: "Dip Powder", text: "Light, strong and glossy.", price: "from $48" },
    ],
  },
  {
    slug: "unique-nails",
    name: "Unique Nails",
    tagline: "Nail salon in DeBary, FL",
    headline: ["Your nails,", "uniquely yours."],
    blurb: "Custom sets, clean finishes and details made around your style. Every visit is designed just for you.",
    address: "28 N Charles Richard Beall Blvd, DeBary, FL 32713",
    phone: "13867531000",
    display: "var(--font-cormorant)",
    palette: "cacau",
    photoOffset: 2,
    services: [
      { name: "Signature Manicure", text: "Our full care service with gel finish.", price: "from $40" },
      { name: "Custom Acrylic Set", text: "Designed with you, shape to color.", price: "from $60" },
      { name: "Luxury Pedicure", text: "Extended massage and hot towels.", price: "from $55" },
      { name: "Gel-X Extensions", text: "Soft, natural-looking length.", price: "from $65" },
      { name: "Chrome & Cat Eye", text: "Mirror and shimmer effects.", price: "from $15" },
      { name: "Nail Repair", text: "Fix a break or a lifted nail.", price: "from $5" },
    ],
  },
  {
    slug: "katies-nails-spa",
    name: "Katie's Nails & Spa",
    tagline: "Nails and spa in DeBary, FL",
    headline: ["Treat yourself", "to something pretty."],
    blurb: "A friendly spa for nails, feet and a little pampering. Bring a friend, pick a color and relax.",
    address: "2851 Enterprise Rd #106b, DeBary, FL 32713",
    phone: "13867179033",
    display: "var(--font-fraunces)",
    palette: "floresta",
    photoOffset: 4,
    services: [
      { name: "Manicure", text: "Classic care with the polish you pick.", price: "from $24" },
      { name: "Gel Polish", text: "Shiny for weeks, no drying time.", price: "from $36" },
      { name: "Pedicure Spa", text: "Warm soak, scrub and massage.", price: "from $42" },
      { name: "Full Set", text: "Acrylic or dip, your length.", price: "from $50" },
      { name: "Kids & Teens", text: "Fun colors for the little ones.", price: "from $18" },
      { name: "Paraffin Treatment", text: "Deep moisture for hands and feet.", price: "from $15" },
    ],
  },
]

export const getStudio = (slug: string) => STUDIOS.find((s) => s.slug === slug)

export const formatUs = (digits: string) => {
  const d = digits.replace(/^1/, "")
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}
