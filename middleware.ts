import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()

  // If user is authenticated and trying to access the home page
  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/projects', request.url))
  }

  return res
}

export const config = {
  matcher: ['/'],
} 