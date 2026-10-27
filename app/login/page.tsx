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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-transparent">
      {/* Soft ambient glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#B1A9DA]/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#FFEDA8]/25 blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Company Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center mb-3">
            <span className="font-serif text-3xl font-black text-[#4A3E85] leading-none tracking-tight">YABES</span>
            <span className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#7B739B] mt-1.5" style={{fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 400}}>atelier</span>
          </div>
          <p className="text-xs text-[#7B739B] mt-2 leading-relaxed">
            Table Decor Management &bull; Deal Recap &amp; Inventory
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E7E3F3] shadow-xl shadow-[#4A3E85]/5 p-6 sm:p-8 space-y-6">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs text-rose-800 text-center">{errorMsg}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A3E85] mb-1.5">Alamat Email Staff</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED9F4] text-sm text-[#2D2A3E] placeholder-[#B8B1D0] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]/50 focus:border-[#B1A9DA] transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3E85] mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED9F4] text-sm text-[#2D2A3E] placeholder-[#B8B1D0] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]/50 focus:border-[#B1A9DA] transition-all pr-12"
                  required
                  autoComplete="current-password"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B739B] hover:text-[#4A3E85] transition-colors p-1">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#DED9F4] text-[#B1A9DA] focus:ring-[#B1A9DA] cursor-pointer"
                  defaultChecked
                />
                <span className="text-xs text-[#4A3E85]">Ingat saya</span>
              </label>
              <Link
                href="/login/forgot-password"
                className="text-xs text-[#7B739B] hover:text-[#4A3E85] hover:underline transition-colors"
              >
                Lupa kata sandi?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 mt-2 py-2.5 px-4 rounded-xl bg-[#4A3E85] text-white font-semibold text-sm hover:bg-[#322A5E] active:scale-[0.98] transition-all shadow-lg shadow-[#4A3E85]/30 hover:shadow-[#4A3E85]/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-base">🌸</span>
                  <span>Memverifikasi Atelier...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Atelier Yabes</span>
                  <span className="font-serif">→</span>
                </>
              )}
            </button>
          </form>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#DED9F4] text-[#2D2A3E] font-semibold text-sm hover:bg-[#FAF9F6] active:scale-[0.98] transition-all"
          >
            <GoogleIcon className="w-4 h-4" />
            Masuk dengan Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DED9F4]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-[#9D93CD]">
              <span className="bg-white px-3 font-medium">Atau Daftar Akun Baru</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-xs text-[#7B739B] mb-2">
              Belum punya akun? Hubungi admin atelier untuk mendaftar.
            </p>
            <Link
              href="/login/signup"
              className="inline-block text-xs font-semibold text-[#4A3E85] hover:text-[#322A5E] underline"
            >
              Daftar Akun Baru →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
