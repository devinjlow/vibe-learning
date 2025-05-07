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
      if (sessionError) throw sessionError

      // Get the user's details
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (user) {
        // Check if user has completed onboarding
        const { data: userDetails, error: detailsError } = await supabase
          .from('user_details')
          .select('background, experience')
          .eq('id', user.id)
          .single()

        if (detailsError && detailsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching user details:', detailsError)
          throw detailsError
        }

        // Redirect based on onboarding status
        if (!userDetails?.background || !userDetails?.experience) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/projects`)
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_callback_failed`)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${requestUrl.origin}/?error=auth_callback_missing_code`)
} 