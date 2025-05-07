'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface LoadingSplashProps {
  onComplete: () => void
}

export function LoadingSplash({ onComplete }: LoadingSplashProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => prev + 1)
      } else {
        onComplete()
      }
    }, 20)

    return () => clearTimeout(timer)
  }, [progress, onComplete])

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="relative w-64 h-64">
        <motion.div
          className="absolute inset-0 bg-primary rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 bg-background rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 0.9 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-4xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {progress}%
        </motion.div>
      </div>
    </div>
  )
} 