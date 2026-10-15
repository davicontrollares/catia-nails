import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { MotionConfig } from "@/components/motion"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

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
    { media: "(prefers-color-scheme: light)", color: "#faf6f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1615" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={jakarta.variable} suppressHydrationWarning>
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
