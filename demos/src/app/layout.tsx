import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Fraunces, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["500", "600"] })
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["500", "600", "700"] })
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["400", "500", "600"] })

export const metadata: Metadata = {
  title: "Nail studio demos",
  description: "Private design concepts. Not the official websites of the businesses shown.",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { viewportFit: "cover" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable} ${cormorant.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  )
}
