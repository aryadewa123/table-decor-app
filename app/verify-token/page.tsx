'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function VerifyTokenPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Get callback URL from cookie (set by middleware)
  const getCallbackUrl = () => {
    const match = document.cookie.match(/callbackUrl=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : '/'
  }

  // If no user, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data: isValid, error: rpcError } = await supabase.rpc('verify_token', {
        p_token: token
      })

      if (rpcError) {
        setError(rpcError.message || 'Token verifikasi gagal')
        setIsLoading(false)
        return
      }

      if (isValid) {
        // Set token verified cookie and redirect
        const isProduction = process.env.NODE_ENV === 'production'
        const secureFlag = isProduction ? '; Secure' : ''
        document.cookie = `token_verified=1; path=/; max-age=31536000; SameSite=Lax${secureFlag}`
        // Clear callbackUrl cookie after use
        document.cookie = 'callbackUrl=; path=/; max-age=0; SameSite=Lax'
        router.replace(getCallbackUrl())
      } else {
        setError('Token tidak valid. Silakan coba lagi.')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi nanti.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold text-[#4A3E85] mb-2">
            Verifikasi Akses
          </h1>
          <p className="text-xs text-[#7B739B] mt-2">
            Masukkan kode akses untuk mengakses dashboard atelier
          </p>
          {user && (
            <p className="text-xs text-[#B8B1D0] mt-1">
              Logged in as: {user.email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs text-rose-800 text-center">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#4A3E85] mb-1.5">
              Kode Akses
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Masukkan kode akses"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED9F4] text-sm text-[#2D2A3E] placeholder-[#B8B1D0] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]/50 focus:border-[#B1A9DA] transition-all"
              required
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#4A3E85] text-white font-semibold text-sm hover:bg-[#322A5E] transition-all disabled:opacity-70"
          >
            {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-[#7B739B] hover:text-[#4A3E85] hover:underline"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}