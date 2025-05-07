"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"

export function Nav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Initial session check:', !!session)
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session)
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setIsAuthenticated(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault()
      router.push('/projects')
    }
  }

  if (isLoading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-6 flex items-center space-x-2">
            <span className="font-bold">vibe</span>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-8">
          <Link 
            href={isAuthenticated ? '/projects' : '/'} 
            className="flex items-center space-x-2"
            onClick={handleLogoClick}
          >
            <span className="font-bold">vibe</span>
          </Link>
          
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link 
                href="/projects"
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  pathname === '/projects' 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'text-foreground/60 hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Projects
              </Link>
              <Link 
                href="/profile"
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  pathname === '/profile' 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'text-foreground/60 hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Profile
              </Link>
              <Link 
                href="/settings"
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  pathname === '/settings' 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'text-foreground/60 hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Settings
              </Link>
            </div>
          )}
        </div>

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