import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const protectedRoutes = [
  '/',
  '/events',
  '/analytics',
  '/sales',
  '/follow-up',
  '/recap',
  '/inventory',
]

const authRoutes = [
  '/login',
  '/login/forgot-password',
  '/login/signup',
  '/auth/callback',
  '/verify-token',
]

function hasVerifiedToken(request: NextRequest): boolean {
  const tokenCookie = request.cookies.get('token_verified')
  return tokenCookie?.value === '1'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes (login pages, favicon, manifest, etc.)
  if (authRoutes.some(route => pathname === route) ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/manifest') ||
      pathname.startsWith('/_next') ||
      pathname.includes('api/auth')) {
    return NextResponse.next()
  }

  // Check if user has a valid session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // No-op in proxy; cookies are read from request only
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.getSession()

  // Allow access if session is valid
  if (session && !error) {
    // Check if token verification is required
    const requiresToken = ['/', '/events', '/analytics', '/sales', '/follow-up', '/recap', '/inventory']
      .some(route => pathname === route || pathname.startsWith(route + '/'))

    if (!requiresToken || hasVerifiedToken(request)) {
      return NextResponse.next()
    }

    // Redirect to verify-token if not verified
    const verifyResponse = NextResponse.redirect(new URL('/verify-token', request.url))
    // Set callbackUrl cookie for the verify-token page
    const isProduction = process.env.NODE_ENV === 'production'
    verifyResponse.cookies.set('callbackUrl', pathname, {
      path: '/',
      maxAge: 300,
      httpOnly: false,
      sameSite: 'lax',
      secure: isProduction,
    })
    return verifyResponse
  }

  // No valid session - redirect to login
  const loginResponse = NextResponse.redirect(new URL('/login', request.url))
  loginResponse.cookies.set('callbackUrl', pathname, {
    path: '/',
    maxAge: 300,
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return loginResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (PWA service worker)
     * - robots.txt (SEO robots file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt).*)',
  ],
}
