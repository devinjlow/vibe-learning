'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const BACKGROUND_OPTIONS = [
  "Student",
  "Engineering Professional",
  "Self-taught Developer",
  "Bootcamp Graduate",
  "Other"
]

const EXPERIENCE_OPTIONS = [
  "< 1 year",
  "1 - 3 years",
  "4 - 7 years",
  "8+ years"
]

const INTEREST_OPTIONS = [
  "Business",
  "Finance",
  "Engineering",
  "Health & Wellness",
  "Education",
  "Entertainment",
  "Social Impact",
  "Technology"
]

export default function Onboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    background: '',
    experience: '',
    interests: [] as string[],
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation parameters
    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
    }> = []

    // Create particles with more variety
    for (let i = 0; i < 100; i++) {
      const size = Math.random() * 3 + 1
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        color: `rgba(64, 64, 64, ${Math.random() * 0.4 + 0.2})`,
      })
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background gradient with lighter colors
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, 'rgba(240, 240, 240, 0.2)') // Light gray
      gradient.addColorStop(1, 'rgba(220, 220, 220, 0.2)') // Slightly darker light gray
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        // Draw solid particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Draw connections with increased visibility
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(64, 64, 64, ${0.2 * (1 - distance / 150)})`
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handleBackgroundSelect = (background: string) => {
    setFormData(prev => ({ ...prev, background }))
  }

  const handleExperienceSelect = (experience: string) => {
    setFormData(prev => ({ ...prev, experience }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No user found')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          background: formData.background,
          experience: formData.experience,
          interests: formData.interests,
          updated_at: new Date().toISOString(),
        })

      if (updateError) {
        throw updateError
      }

      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Label>What best describes your background?</Label>
            <div className="grid grid-cols-1 gap-2">
              {BACKGROUND_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant={formData.background === option ? "default" : "outline"}
                  onClick={() => handleBackgroundSelect(option)}
                  className="justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <Label>How long have you been coding?</Label>
            <div className="grid grid-cols-1 gap-2">
              {EXPERIENCE_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant={formData.experience === option ? "default" : "outline"}
                  onClick={() => handleExperienceSelect(option)}
                  className="justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <Label>Select your interests (choose multiple)</Label>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant={formData.interests.includes(option) ? "default" : "outline"}
                  onClick={() => handleInterestToggle(option)}
                  className="justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <Label>Selected interests:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.interests.map(interest => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.background
      case 2:
        return !!formData.experience
      case 3:
        return formData.interests.length > 0
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-100">
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Logo button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button variant="ghost" className="text-foreground hover:text-foreground/80">
            vibe
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl backdrop-blur-xl bg-background/95 shadow-2xl border-border">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-3xl text-center font-bold">Complete Your Profile</CardTitle>
              <CardDescription className="text-center text-lg">
                Step {currentStep} of 3
              </CardDescription>
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}
            {error && (
              <div className="mt-4 text-sm text-red-500">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1 || loading}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (currentStep === 3) {
                  handleSubmit()
                } else {
                  setCurrentStep(prev => prev + 1)
                }
              }}
              disabled={!canProceed() || loading}
            >
              {loading ? 'Saving...' : currentStep === 3 ? 'Complete' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 