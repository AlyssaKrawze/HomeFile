import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getSession() instead of getUser() to avoid a network request to Supabase
  // on every request. getSession() reads the JWT from cookies locally, keeping
  // middleware well under Vercel's 1.5s Edge runtime limit.
  // Server components and API routes should still use getUser() for verified auth.
  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/forgot-password')
  const isPublicPath =
    path === '/' ||
    path.startsWith('/auth/') ||   // allow /auth/callback
    path.startsWith('/api/') ||
    path.startsWith('/_next/')

  if (!session && !isAuthPage && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (session && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
