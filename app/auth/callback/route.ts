import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange the code for a session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      if (sessionError) {
        console.error('Auth callback - Session error:', sessionError)
        return NextResponse.redirect(new URL('/', requestUrl.origin))
      }

      // Get the user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Auth callback - User error:', userError)
        return NextResponse.redirect(new URL('/', requestUrl.origin))
      }

      console.log('Auth callback - User:', user?.id)

      if (user) {
        // Check if user has completed onboarding
        const { data: userDetails, error: detailsError } = await supabase
          .from('user_details')
          .select('*')  // Select all fields to see what's stored
          .eq('id', user.id)
          .single()

        console.log('Auth callback - User details:', userDetails)
        console.log('Auth callback - Details error:', detailsError)

        // Redirect based on whether user has completed onboarding
        if (userDetails && userDetails.background && userDetails.experience) {
          console.log('Auth callback - User has completed onboarding, redirecting to projects')
          return NextResponse.redirect(new URL('/projects', requestUrl.origin))
        } else {
          console.log('Auth callback - User has not completed onboarding, redirecting to onboarding')
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }
      }
    } catch (error) {
      console.error('Auth callback - Unexpected error:', error)
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
  }

  // Return to home page if something goes wrong
  console.log('Auth callback - No code provided, redirecting to home')
  return NextResponse.redirect(new URL('/', requestUrl.origin))
} 