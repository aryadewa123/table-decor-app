'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function TopHeader() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 border-b border-[#E7E3F3] shadow-sm">
      {/* Floating flower petal animation */}
      <div className="absolute top-2 right-2 w-20 h-20 opacity-15 pointer-events-none animate-sway">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 15 C 70 20, 85 45, 70 60 C 55 75, 45 75, 30 60 C 15 45, 30 20, 50 15 Z" fill="#FFD166" opacity="0.4"/>
        </svg>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex flex-col items-start leading-none">
            <span className="font-serif text-2xl font-black tracking-tight text-[#4A3E85]">
              YABES
            </span>
            <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#7B739B] mt-0.5" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
              atelier
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full bg-[#FFF9E6] text-[#FFD166] flex items-center justify-center text-xs font-bold shadow-md shadow-[#FFD166]/30"
                  title={`${user.name} (${user.role})`}
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  title="Keluar / Ganti Akun"
                  className="text-xs font-medium text-[#7B739B] hover:text-[#2D2A3E] transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium text-[#4A3E85] hover:underline"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}