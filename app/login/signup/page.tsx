'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'Sales Staff' | 'Lead Sales' | 'Owner'>('Sales Staff')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
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
      setSuccess('Akun berhasil dibuat! Silakan cek email untuk verifikasi.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold text-[#4A3E85] mb-2">Daftar Akun Baru</h1>
          <p className="text-xs text-[#7B739B]">
            Untuk kebutuhan registrasi, hubungi admin atelier.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs text-rose-800 text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-800 text-center">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#4A3E85] mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED9F4] text-sm text-[#2D2A3E] placeholder-[#B8B1D0] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]/50 focus:border-[#B1A9DA] transition-all"
              required
            />
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-[#4A3E85] mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED9F4] text-sm text-[#2D2A3E] placeholder-[#B8B1D0] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]/50 focus:border-[#B1A9DA] transition-all"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A3E85] mb-1.5">
              Role Pengguna
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED9F4] text-sm text-[#2D2A3E] bg-white focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]/50 focus:border-[#B1A9DA] transition-all"
            >
              <option value="Sales Staff">Sales Staff</option>
              <option value="Lead Sales">Lead Sales</option>
              <option value="Owner">Owner</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#4A3E85] text-white font-semibold text-sm hover:bg-[#322A5E] transition-all"
          >
            {isLoading ? 'Mendaftar...' : 'Buat Akun'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#7B739B] mb-2">
            Sudah punya akun?
          </p>
          <a href="/login" className="text-xs font-semibold text-[#4A3E85] hover:text-[#322A5E] underline">
            Masuk di sini →
          </a>
        </div>
      </div>
    </div>
  )
}