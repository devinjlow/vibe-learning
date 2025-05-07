import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('background')
        .eq('id', user.id)
        .single()

      // If no profile or no background set, redirect to onboarding
      if (!profile?.background) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // If user has completed onboarding or no code, redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
} 