'use client'

import { motion } from 'framer-motion'

export function LoadingSplash() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0 bg-foreground"
          style={{ originX: 0 }}
        />
        <span className="relative text-8xl font-bold text-background">
          vibe
        </span>
      </div>
    </div>
  )
} 