'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/sales')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-[#7B739B]">
      Mengarahkan ke halaman Sales...
    </div>
  )
}