'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  // Clear retry timer when component unmounts
  useEffect(() => {
    return () => {
      if (retryAfter) {
        clearTimeout(retryAfter)
      }
    }
  }, [retryAfter])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Check if it's a rate limit error
        if (error.message.includes('rate limit')) {
          const retryTime = 60 // 60 seconds
          setRetryAfter(retryTime)
          const timer = setTimeout(() => {
            setRetryAfter(null)
          }, retryTime * 1000)
          setRetryAfter(timer as unknown as number)
          throw new Error(`Rate limit reached. Please try again in ${retryTime} seconds.`)
        }
        throw error
      }

      if (data?.user) {
        // Show success message or redirect
        router.push('/login?message=Check your email to confirm your account')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleSignUp}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={loading || retryAfter !== null}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  disabled={loading || retryAfter !== null}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
              <Button disabled={loading || retryAfter !== null}>
                {loading ? 'Creating account...' : retryAfter ? 'Please wait...' : 'Create account'}
              </Button>
            </div>
          </form>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
} 