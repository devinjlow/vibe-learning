'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface LoadingSplashProps {
  onComplete?: () => void
  duration?: number
}

export function LoadingSplash({ onComplete, duration = 2000 }: LoadingSplashProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [duration, onComplete])

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      {/* Large centered logo */}
      <div className="relative w-64 h-64">
        {/* Background logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl font-bold text-muted-foreground">vibe</span>
        </div>
        
        {/* Animated fill logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            width: `${progress}%`,
          }}
        >
          <span className="text-8xl font-bold text-foreground whitespace-nowrap">vibe</span>
        </motion.div>
      </div>
    </div>
  )
} 