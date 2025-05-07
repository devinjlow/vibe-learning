import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Log the current path and session state
  console.log('Middleware - Path:', request.nextUrl.pathname, 'Session:', !!session)

  // If user is authenticated and trying to access auth pages, redirect to projects
  if (session && (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  )) {
    console.log('Middleware - Redirecting authenticated user to /projects')
    return NextResponse.redirect(new URL('/projects', request.url))
  }

  // If user is not authenticated and trying to access protected pages, redirect to login
  // But only if they're not already on the login or signup page
  if (!session && 
    !request.nextUrl.pathname.startsWith('/login') && 
    !request.nextUrl.pathname.startsWith('/signup') && 
    (
      request.nextUrl.pathname.startsWith('/projects') ||
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/settings')
    )
  ) {
    console.log('Middleware - Redirecting unauthenticated user to /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/projects/:path*',
    '/profile/:path*',
    '/settings/:path*'
  ]
} 