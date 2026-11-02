import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  let payload: { token?: string }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 })
  }

  const token = payload.token?.trim()

  if (!token) {
    return NextResponse.json({ error: 'Token wajib diisi' }, { status: 400 })
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => cookieStore.set(cookie))
        },
      },
    }
  )

  const { data: isValid, error: rpcError } = await supabase.rpc('verify_token', {
    p_token: token,
  })

  if (rpcError || !isValid) {
    return NextResponse.json(
      { error: rpcError?.message || 'Token tidak valid.' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set('token_verified', '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
