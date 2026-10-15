import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { MotionConfig } from "@/components/motion"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] })

export const metadata: Metadata = {
  title: "Catia Rodrigues Nails · Agendamento online",
  description:
    "Alongamento em fibra de vidro, banho em gel e esmaltação em gel em São José do Rio Preto. Agende seu horário online.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Catia Nails", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1615" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="mesh-bg" aria-hidden />
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
