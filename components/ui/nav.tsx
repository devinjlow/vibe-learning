"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"

export function Nav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault()
      router.push('/projects')
    }
  }

  if (isLoading) {
    return null // Or a loading spinner if you prefer
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link 
          href={isAuthenticated ? '/projects' : '/'} 
          className="mr-6 flex items-center space-x-2"
          onClick={handleLogoClick}
        >
          <span className="font-bold">vibe</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-foreground hover:text-foreground/80"
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-foreground hover:text-foreground/80">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 