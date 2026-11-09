'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthFlowerBackdrop, AuthInteractionEffects } from '@/components/AuthFlowerEffects'

type UserRole = 'Sales Staff' | 'Lead Sales' | 'Owner'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('Sales Staff')
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [activeRoleIndex, setActiveRoleIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const rolePickerRef = useRef<HTMLDivElement>(null)
  const roles: UserRole[] = ['Sales Staff', 'Lead Sales', 'Owner']

  useEffect(() => {
    if (!roleMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rolePickerRef.current?.contains(event.target as Node)) {
        setRoleMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [roleMenuOpen])

  const selectRole = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setActiveRoleIndex(roles.indexOf(selectedRole))
    setRoleMenuOpen(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess('Akun berhasil dibuat. Silakan cek email untuk verifikasi.')
      window.setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
    setIsLoading(false)
  }

  return (
    <main data-auth-interaction-root className="signup-scene relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-6 text-white sm:px-6 sm:py-10">
      <AuthFlowerBackdrop scene="signup" />
      <AuthInteractionEffects />

      <section className="login-glass-panel relative z-10 w-full max-w-[510px] overflow-hidden rounded-[28px] px-5 py-6 sm:rounded-[32px] sm:px-10 sm:py-9 lg:px-12">
        <div className="login-glass-inner pointer-events-none absolute inset-0" />
        <div className="relative">
          <header className="mb-6 text-center sm:mb-7">
            <Link href="/login" className="inline-flex flex-col leading-none">
              <span className="font-serif text-[26px] font-semibold tracking-[0.2em] text-white drop-shadow-[0_0_16px_rgba(255,244,217,0.42)]">
                YABES
              </span>
              <span className="mt-1.5 text-[9px] uppercase tracking-[0.48em] text-white/75">
                Atelier
              </span>
            </Link>
            <div className="mx-auto my-4 h-px w-12 bg-gradient-to-r from-transparent via-[#f2d89e]/90 to-transparent" />
            <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[#f5dfb6] drop-shadow-[0_0_12px_rgba(255,227,175,0.55)]">
              Bergabung dengan kami
            </p>
            <h1 className="mt-2 font-serif text-[27px] leading-tight tracking-tight text-white drop-shadow-[0_2px_18px_rgba(255,255,255,0.24)] sm:text-3xl">
              Daftar Akun Baru
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/75 sm:text-sm">
              Buat ruang kerja atelier Anda. Untuk registrasi, hubungi admin atelier.
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200/30 bg-rose-950/35 px-4 py-3 text-sm text-rose-50 shadow-[0_0_24px_rgba(251,113,133,0.1)] backdrop-blur-md"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-emerald-200/35 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-50 shadow-[0_0_24px_rgba(110,231,183,0.1)] backdrop-blur-md"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-xs font-medium tracking-wide text-white/90">
                Nama lengkap
              </label>
              <input
                id="signup-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                className="login-glass-input w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white/70 focus:bg-white/20 focus:ring-4 focus:ring-white/10"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium tracking-wide text-white/90">
                Email staff
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="login-glass-input w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white/70 focus:bg-white/20 focus:ring-4 focus:ring-white/10"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-xs font-medium tracking-wide text-white/90">
                Kata sandi
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="login-glass-input w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white/70 focus:bg-white/20 focus:ring-4 focus:ring-white/10"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label id="signup-role-label" className="mb-1.5 block text-xs font-medium tracking-wide text-white/90">
                Role pengguna
              </label>
              <div ref={rolePickerRef} className="relative">
                <button
                  type="button"
                  role="combobox"
                  aria-labelledby="signup-role-label"
                  aria-controls="signup-role-options"
                  aria-expanded={roleMenuOpen}
                  aria-haspopup="listbox"
                  aria-activedescendant={roleMenuOpen ? `signup-role-option-${activeRoleIndex}` : undefined}
                  onClick={() => {
                    setActiveRoleIndex(roles.indexOf(role))
                    setRoleMenuOpen((isOpen) => !isOpen)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setRoleMenuOpen(false)
                    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                      event.preventDefault()
                      if (!roleMenuOpen) {
                        setActiveRoleIndex(roles.indexOf(role))
                        setRoleMenuOpen(true)
                      } else {
                        const direction = event.key === 'ArrowDown' ? 1 : -1
                        setActiveRoleIndex((index) => (index + direction + roles.length) % roles.length)
                      }
                    } else if (roleMenuOpen && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault()
                      selectRole(roles[activeRoleIndex])
                    } else if (roleMenuOpen && event.key === 'Home') {
                      event.preventDefault()
                      setActiveRoleIndex(0)
                    } else if (roleMenuOpen && event.key === 'End') {
                      event.preventDefault()
                      setActiveRoleIndex(roles.length - 1)
                    }
                  }}
                  className="signup-role-trigger group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm text-white outline-none transition focus-visible:ring-4 focus-visible:ring-white/15"
                >
                  <span>{role}</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 text-white/70 transition-transform duration-300 ${roleMenuOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {roleMenuOpen && (
                  <div
                    id="signup-role-options"
                    role="listbox"
                    aria-labelledby="signup-role-label"
                    className="signup-role-menu absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl p-1.5"
                  >
                    {roles.map((option, index) => (
                      <button
                        key={option}
                        id={`signup-role-option-${index}`}
                        type="button"
                        role="option"
                        aria-selected={role === option}
                        onMouseEnter={() => setActiveRoleIndex(index)}
                        onClick={() => selectRole(option)}
                        className={`signup-role-option flex w-full items-center justify-between rounded-lg px-3.5 py-3 text-left text-sm transition ${
                          activeRoleIndex === index
                            ? 'bg-white/20 text-white'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{option}</span>
                        {role === option && (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-[#f5dfb6]"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-glow-button group mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  <span>Membuat akun...</span>
                </>
              ) : (
                <>
                  <span>Buat akun atelier</span>
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

          <div className="mt-6 border-t border-white/15 pt-5 text-center">
            <p className="text-xs leading-5 text-white/65">Sudah memiliki akun?</p>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#f5dfb6] drop-shadow-[0_0_10px_rgba(255,227,175,0.24)] transition hover:text-white hover:underline"
            >
              Masuk ke akun
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          <p className="mt-5 text-center text-[9px] uppercase tracking-[0.18em] text-white/40">
            Table Decor Management · Deal Recap · Inventory
          </p>
        </div>
      </section>
    </main>
  )
}
