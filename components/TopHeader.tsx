'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'

export default function TopHeader() {
  const { user, logout, isAuthenticated } = useAuth()
  const language = user?.language ?? 'id'
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profileMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileMenuOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

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
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  aria-label={translate(language, 'nav.profileMenu')}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  title={`${user.name} (${user.role})`}
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-white/55 bg-white/25 p-1 pr-2 shadow-[0_3px_14px_rgba(54,44,77,0.06)] transition-all hover:bg-white/55 active:scale-95"
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
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`mr-1 h-3.5 w-3.5 text-[#716783] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {profileMenuOpen && (
                  <div
                    role="menu"
                    className="app-glass-surface profile-menu absolute right-0 top-[calc(100%+0.65rem)] z-50 w-60 rounded-2xl p-2"
                  >
                    <div className="border-b border-white/45 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-[#3F355C]">{user.name}</p>
                      <p className="truncate text-[11px] text-[#817791]">{user.email}</p>
                    </div>
                    <Link
                      href="/settings"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                      className="profile-menu-item mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#51466C] transition-colors hover:bg-white/45"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <circle cx="12" cy="12" r="3" />
                        <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" />
                      </svg>
                      {translate(language, 'nav.settings')}
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        void logout()
                      }}
                      className="profile-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#76525C] transition-colors hover:bg-rose-50/55"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M10 17l5-5-5-5M15 12H3" />
                        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                      </svg>
                      {translate(language, 'nav.signOut')}
                    </button>
                  </div>
                )}
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