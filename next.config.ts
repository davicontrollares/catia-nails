import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // garante que as fotos de public/instagram sejam lidas também no servidor da Vercel
  outputFileTracingIncludes: { "/": ["./public/instagram/**/*"] },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
}

export default nextConfig
