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

const publicRoutes = [
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

function getSafeNext(raw: string | undefined): string {
  if (!raw) return '/'
  const decoded = decodeURIComponent(raw)
  if (/^https?:\/\//i.test(decoded)) return '/'
  if (decoded.startsWith('//')) return '/'
  if (!decoded.startsWith('/')) return '/'
  return decoded
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    publicRoutes.some(route => pathname === route) ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/robots.txt')
  ) {
    return NextResponse.next()
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // no-op in proxy; cookies are read from request only
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.getSession()

  if (session && !error) {
    const requiresToken = protectedRoutes.some(
      route => pathname === route || pathname.startsWith(route + '/')
    )

    if (!requiresToken || hasVerifiedToken(request)) {
      return NextResponse.next()
    }

    const nextUrl = getSafeNext(pathname)
    const verifyUrl = new URL('/verify-token', request.url)
    verifyUrl.searchParams.set('next', nextUrl)
    return NextResponse.redirect(verifyUrl)
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt).*)',
  ],
}
