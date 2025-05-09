'use client'

import { useEffect, useRef, useState } from 'react'

// Simple animated loading spinner (wheel)
const Spinner = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="animate-spin"
    style={{ display: 'block' }}
  >
    <circle
      cx="32"
      cy="32"
      r="28"
      stroke="#222"
      strokeWidth="8"
      strokeDasharray="44 88"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

export function LoadingSplash({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          if (onComplete) setTimeout(onComplete, 300)
          return 100
        }
        return prev + 2
      })
    }, 16)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <Spinner />
    </div>
  )
} 