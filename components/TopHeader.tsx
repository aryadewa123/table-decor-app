'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'

export default function TopHeader() {
  const { user, logout, isAuthenticated } = useAuth()
  const language = user?.language ?? 'id'

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
                <Link
                  href="/settings"
                  aria-label={translate(language, 'nav.openSettings')}
                  title={`${user.name} (${user.role})`}
                  className="flex min-h-11 items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-[#F0EDF9]"
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#FFF9E6] text-xs font-bold text-[#4A3E85] ring-1 ring-[#DED9F4]">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span className="hidden max-w-32 truncate text-xs font-semibold text-[#4A3E85] sm:inline">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title={translate(language, 'nav.signOut')}
                  aria-label={translate(language, 'nav.signOut')}
                  className="hidden min-h-11 rounded-lg px-2 text-xs font-medium text-[#7B739B] transition-colors hover:text-[#2D2A3E] sm:inline-flex sm:items-center"
                >
                  {translate(language, 'nav.signOut')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium text-[#4A3E85] hover:underline"
              >
                {translate(language, 'nav.signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}