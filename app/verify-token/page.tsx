'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { AuthFlowerBackdrop, AuthInteractionEffects } from '@/components/AuthFlowerEffects'

function VerifyTokenForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, isAuthenticated } = useAuth()

  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const rawNext = searchParams.get('next') || '/'
  const safeNext = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  // If no user, redirect to login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Token tidak valid. Silakan coba lagi.')
        setIsLoading(false)
        return
      }

      router.replace(safeNext)
    } catch {
      setError('Terjadi kesalahan. Coba lagi nanti.')
      setIsLoading(false)
    }
  }

  return (
    <main data-auth-interaction-root className="verify-scene relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 text-white sm:px-6 sm:py-12">
      <AuthFlowerBackdrop scene="verify" />
      <AuthInteractionEffects />

      <div className="verify-ripple z-[3]" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden" aria-hidden="true">
        <span className="login-petal login-petal--one" />
        <span className="login-petal login-petal--two" />
        <span className="login-petal login-petal--three" />
        <span className="login-petal login-petal--leaf login-petal--six" />
        <span className="login-petal login-petal--leaf login-petal--nine" />
      </div>

      {loading ? (
        <section className="login-glass-panel relative z-10 w-full max-w-[440px] overflow-hidden rounded-[28px] px-6 py-10 text-center sm:rounded-[32px] sm:px-10">
          <div className="login-glass-inner pointer-events-none absolute inset-0" />
          <div className="relative">
            <span className="mx-auto mb-4 block h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="font-serif text-xl text-white">Menyiapkan ruang atelier</p>
            <p className="mt-2 text-sm text-white/70">Memuat sesi Anda...</p>
          </div>
        </section>
      ) : (
        <section className="login-glass-panel verify-card relative z-10 w-full max-w-[470px] overflow-hidden rounded-[28px] px-5 py-7 sm:rounded-[32px] sm:px-10 sm:py-10">
          <div className="login-glass-inner pointer-events-none absolute inset-0" />
          <div className="relative">
            <header className="mb-8 text-center sm:mb-9">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f2d89e] shadow-[0_0_10px_rgba(242,216,158,0.9)]" />
                Ruang privat Yabes Atelier
              </span>
              <h1 className="mt-5 font-serif text-[30px] leading-tight tracking-tight text-white drop-shadow-[0_2px_18px_rgba(255,255,255,0.24)] sm:text-4xl">
                Verifikasi Akses
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/78">
                Satu langkah lagi untuk kembali ke ruang kerja Anda.
              </p>
              {user && (
                <p className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-black/10 px-3 py-1.5 text-xs text-white/75 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_9px_rgba(110,231,183,0.8)]" />
                  <span className="truncate">{user.email}</span>
                </p>
              )}
            </header>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-rose-200/30 bg-rose-950/35 px-4 py-3 text-sm text-rose-50 shadow-[0_0_24px_rgba(251,113,133,0.1)] backdrop-blur-md"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="access-token" className="mb-2 block text-xs font-medium tracking-wide text-white/90">
                  Kode akses atelier
                </label>
                <input
                  id="access-token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Masukkan kode akses"
                  className="login-glass-input w-full rounded-xl px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white/70 focus:bg-white/20 focus:ring-4 focus:ring-white/10"
                  required
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-glow-button group mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke ruang kerja</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/20" />
              <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.16em] text-white/50">
                akses terenkripsi
              </span>
              <span className="h-px flex-1 bg-white/20" />
            </div>

            <button
              onClick={() => supabase.auth.signOut()}
              className="login-glass-secondary inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white/85 transition hover:bg-white/20 hover:text-white"
            >
              Keluar dari akun
            </button>
            <p className="mt-6 text-center text-[9px] uppercase tracking-[0.18em] text-white/45">
              Yabes Atelier · Akses khusus anggota
            </p>
          </div>
        </section>
      )}
    </main>
  )
}

export default function VerifyTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="verify-scene relative isolate flex min-h-dvh items-center justify-center overflow-hidden p-4 text-white">
          <AuthFlowerBackdrop scene="verify" />
          <section className="login-glass-panel relative z-10 w-full max-w-[440px] rounded-[28px] px-6 py-10 text-center sm:rounded-[32px] sm:px-10">
            <div className="login-glass-inner pointer-events-none absolute inset-0" />
            <div className="relative">
              <span className="mx-auto mb-4 block h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <p className="font-serif text-xl text-white">Menyiapkan ruang atelier</p>
              <p className="mt-2 text-sm text-white/70">Memuat halaman verifikasi...</p>
            </div>
          </section>
        </div>
      }
    >
      <VerifyTokenForm />
    </Suspense>
  )
}
