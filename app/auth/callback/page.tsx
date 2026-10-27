'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error.message)
      }
      
      // Redirect to verify-token after successful auth
      router.replace('/verify-token')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#B1A9DA]/20 mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h3 className="font-serif text-xl font-semibold text-[#2D2A3E] mb-2">
          Memproses Masuk...
        </h3>
        <p className="text-xs text-[#7B739B]">
          Sedang memverifikasi Anda dengan Google...
        </p>
      </div>
    </div>
  )
}