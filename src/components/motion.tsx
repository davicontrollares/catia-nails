"use client"

import { motion } from "framer-motion"

// Animação reduzida é tratada pelo MotionConfig reducedMotion="user" no layout.
export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay }}
    >
      {children}
    </motion.div>
  )
}

export { MotionConfig } from "framer-motion"
