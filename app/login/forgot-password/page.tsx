'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (supabaseError) {
      setError(supabaseError.message)
    } else {
      setMessage('Link reset kata sandi telah dikirim ke email Anda.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold text-[#4A3E85] mb-2">Lupa Kata Sandi?</h1>
          <p className="text-xs text-[#7B739B]">
            Masukkan email Anda untuk menerima link reset kata sandi
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-800 text-center">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs text-rose-800 text-center">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#4A3E85] mb-1.5">
              Email Staff
            </label>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#4A3E85] text-white font-semibold text-sm hover:bg-[#322A5E] transition-all"
          >
            {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-[#7B739B] hover:text-[#4A3E85] hover:underline">
            ← Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}