'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { GoogleIcon } from '@/components/icons/Icons'

export default function LoginPage() {
  const router = useRouter()
  const { signInWithPassword, user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // If already authenticated, redirect to verify-token
  useEffect(() => {
    if (user) {
      router.replace('/verify-token')
    }
  }, [user, router])

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mohon isi alamat email dan kata sandi Anda.')
      return
    }

    setIsLoading(true)
    const { error } = await signInWithPassword(email, password)

    if (error) {
      setErrorMsg(error)
      setIsLoading(false)
    } else {
      // Redirect to verify-token for token verification
      router.replace('/verify-token')
    }
  }

  const handleGoogleLogin = async () => {
    setErrorMsg('')
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="login-scene relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 text-white sm:px-6 sm:py-12">
      <div
        role="img"
        aria-label="Bunga poppy berwarna keemasan"
        className="login-photo-motion absolute inset-0 -z-30 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=2000&q=90')",
        }}
      />
      <div className="login-scene-wash absolute inset-0 -z-20" />
      <div className="login-scene-glow login-scene-glow--one absolute -z-10" />
      <div className="login-scene-glow login-scene-glow--two absolute -z-10" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="login-petal login-petal--one" aria-hidden="true" />
        <div className="login-petal login-petal--two" aria-hidden="true" />
        <div className="login-petal login-petal--three" aria-hidden="true" />
        <div className="login-petal login-petal--four" aria-hidden="true" />
        <div className="login-petal login-petal--leaf login-petal--five" aria-hidden="true" />
        <div className="login-petal login-petal--leaf login-petal--six" aria-hidden="true" />
        <div className="login-petal login-petal--leaf login-petal--seven" aria-hidden="true" />
        <div className="login-petal login-petal--leaf login-petal--eight" aria-hidden="true" />
        <div className="login-petal login-petal--leaf login-petal--nine" aria-hidden="true" />
        <div className="login-petal login-petal--leaf login-petal--ten" aria-hidden="true" />
        <div className="login-petal login-petal--leaf login-petal--eleven" aria-hidden="true" />
        <div className="login-petal login-petal--leaf login-petal--twelve" aria-hidden="true" />
        <div className="login-bloom login-bloom--one" aria-hidden="true">
          <FloralAccent />
        </div>
        <div className="login-bloom login-bloom--two" aria-hidden="true">
          <FloralAccent />
        </div>

      </div>

      <section className="login-glass-panel relative z-10 w-full max-w-[510px] overflow-hidden rounded-[28px] px-5 py-7 sm:rounded-[32px] sm:px-10 sm:py-10 lg:px-12 lg:py-11">
        <div className="login-glass-inner pointer-events-none absolute inset-0" />
        <div className="relative">
          <div className="mb-8 text-center sm:mb-9">
            <Link href="/login" className="inline-flex flex-col leading-none">
              <span className="font-serif text-[26px] font-semibold tracking-[0.2em] text-white drop-shadow-[0_0_16px_rgba(255,244,217,0.42)]">
                YABES
              </span>
              <span className="mt-1.5 text-[9px] uppercase tracking-[0.48em] text-white/75">
                Atelier
              </span>
            </Link>
            <div className="mx-auto my-5 h-px w-12 bg-gradient-to-r from-transparent via-[#f2d89e]/90 to-transparent" />
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#f5dfb6] drop-shadow-[0_0_12px_rgba(255,227,175,0.55)] sm:text-[11px]">
              Ruang untuk merangkai cerita
            </p>
            <h1 className="mt-3 font-serif text-[27px] leading-tight tracking-tight text-white drop-shadow-[0_2px_18px_rgba(255,255,255,0.24)] sm:text-3xl">
              Selamat datang kembali
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/75 sm:text-sm">
              Kelola setiap acara dan persiapan dalam satu ruang yang tertata.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-200/30 bg-rose-950/35 px-4 py-3 text-sm text-rose-50 shadow-[0_0_24px_rgba(251,113,133,0.1)] backdrop-blur-md"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-xs font-medium tracking-wide text-white/90">
                Alamat email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="login-glass-input w-full rounded-xl px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white/70 focus:bg-white/20 focus:ring-4 focus:ring-white/10"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-xs font-medium tracking-wide text-white/90">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="login-glass-input w-full rounded-xl py-3.5 pl-4 pr-12 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white/70 focus:bg-white/20 focus:ring-4 focus:ring-white/10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
                >
                  <PasswordVisibilityIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-0.5">
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-xs text-white/75">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/40 accent-[#e9d29b] focus:ring-[#e9d29b]"
                  defaultChecked
                />
                Ingat saya
              </label>
              <Link
                href="/login/forgot-password"
                className="text-xs font-medium text-[#f5dfb6] drop-shadow-[0_0_10px_rgba(255,227,175,0.22)] transition hover:text-white hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-glow-button group mt-1 inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke ruang kerja</span>
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-white/20" />
            <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.14em] text-white/55 sm:text-[10px] sm:tracking-[0.16em]">
              atau lanjutkan dengan
            </span>
            <span className="h-px flex-1 bg-white/20" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="login-glass-secondary inline-flex w-full items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <GoogleIcon className="h-4 w-4" />
            Masuk dengan Google
          </button>

          <div className="mt-7 border-t border-white/15 pt-5 text-center sm:mt-8 sm:pt-6">
            <p className="text-xs leading-5 text-white/65">
              Belum punya akun? Hubungi admin atelier untuk mendaftar.
            </p>
            <Link
              href="/login/signup"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#f5dfb6] drop-shadow-[0_0_10px_rgba(255,227,175,0.24)] transition hover:text-white hover:underline"
            >
              Daftar akun baru
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="mt-6 text-center text-[9px] uppercase tracking-[0.18em] text-white/40">
            Table Decor Management · Deal Recap · Inventory
          </p>
        </div>
      </section>
    </main>
  )
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      {visible ? (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4.1-.9" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      )}
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function FloralAccent() {
  return (
    <svg viewBox="0 0 120 150" fill="none" className="h-full w-full">
      <path d="M57 69c-7 22-4 44 3 71" stroke="currentColor" strokeWidth="1.5" />
      <path d="M58 104c-13-15-26-17-35-15 6 13 18 21 37 19M60 122c10-15 23-19 34-18-5 14-17 23-32 24" stroke="currentColor" strokeWidth="1.3" />
      <g transform="translate(57 47)" stroke="currentColor" strokeWidth="1.2">
        <ellipse cy="-20" rx="8" ry="17" />
        <ellipse cy="-20" rx="8" ry="17" transform="rotate(45)" />
        <ellipse cy="-20" rx="8" ry="17" transform="rotate(90)" />
        <ellipse cy="-20" rx="8" ry="17" transform="rotate(135)" />
        <circle r="7" fill="currentColor" fillOpacity=".22" />
      </g>
    </svg>
  )
}
