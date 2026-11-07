'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'

export default function TopHeader() {
  const { user, logout, isAuthenticated } = useAuth()
  const language = user?.language ?? 'id'
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null)

  return (
    <header className="app-glass-header sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div className="flex h-[clamp(3.75rem,8vw,4.5rem)] items-center justify-between">
          <Link
            href="/"
            aria-label="Yabes Atelier — Beranda"
            className="group flex min-w-0 items-center gap-2.5 rounded-2xl py-1 pr-3 transition-transform duration-300 hover:scale-[1.015] sm:gap-3"
          >
            <Image
              src="/icon.svg"
              alt=""
              width={42}
              height={42}
              className="h-9 w-9 shrink-0 rounded-[13px] shadow-[0_5px_16px_rgba(54,44,77,0.2)] transition-transform duration-500 group-hover:rotate-[-4deg] sm:h-10 sm:w-10 sm:rounded-[15px]"
            />
            <span className="flex min-w-0 flex-col leading-none">
              <span
                className="truncate text-[clamp(1.2rem,4vw,1.55rem)] font-semibold tracking-[-0.045em] text-[#3F355C]"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                Yabes
              </span>
              <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.28em] text-[#897D9E] sm:text-[9px]">
                Atelier
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  aria-label={translate(language, 'nav.openSettings')}
                  title={`${user.name} (${user.role})`}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-white/55 bg-white/25 p-1 pr-2 shadow-[0_3px_14px_rgba(54,44,77,0.06)] transition-colors hover:bg-white/55"
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#EEE8F4] text-xs font-bold text-[#4A3E85] ring-1 ring-white/80">
                    {user.avatarUrl && failedAvatarUrl !== user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="h-full w-full object-cover"
                        onError={() => setFailedAvatarUrl(user.avatarUrl ?? null)}
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
                  className="hidden min-h-11 rounded-xl px-2 text-xs font-medium text-[#716783] transition-colors hover:bg-white/40 hover:text-[#2D2A3E] sm:inline-flex sm:items-center"
                >
                  {translate(language, 'nav.signOut')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-white/55 bg-white/30 px-4 py-2 text-xs font-semibold text-[#4A3E85] shadow-sm transition-colors hover:bg-white/60"
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