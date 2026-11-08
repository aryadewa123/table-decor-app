'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CalendarIcon,
  ClockIcon,
  ChartIcon,
  BoxIcon,
  DocumentIcon,
} from '@/components/icons/Icons'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [openMoreOnPath, setOpenMoreOnPath] = useState<string | null>(null)
  const moreOpen = openMoreOnPath === pathname
  const language = user?.language ?? 'id'
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key)

  const navItems = [
    { href: '/', label: t('nav.home'), icon: HomeIcon },
    { href: '/events', label: t('nav.events'), icon: CalendarIcon },
    { href: '/follow-up', label: t('nav.followUp'), icon: ClockIcon },
    { href: '/sales', label: t('nav.sales'), icon: ChartIcon },
  ]
  const moreItems = [
    { href: '/recap', label: t('nav.recap'), icon: DocumentIcon },
    { href: '/inventory', label: t('nav.inventory'), icon: BoxIcon },
    { href: '/settings', label: t('nav.settings'), icon: null },
  ]
  const isMoreActive = moreItems.some(
    item => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 sm:px-5"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.65rem)',
        paddingLeft: 'max(env(safe-area-inset-left), 0.75rem)',
        paddingRight: 'max(env(safe-area-inset-right), 0.75rem)',
      }}
    >
      <nav
        aria-label="Main navigation"
        className="app-glass-surface app-bottom-dock relative mx-auto flex w-full max-w-2xl items-stretch justify-around gap-0.5 px-1.5 py-1.5 sm:px-2"
      >
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const IconComponent = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setOpenMoreOnPath(null)}
              className={`nav-dock-item flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-all duration-300 ${
                isActive
                  ? 'bg-[#4A3E85]/10 font-bold text-[#453862] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]'
                  : 'text-[#716783] hover:bg-white/35 hover:text-[#2D2A3E]'
              }`}
            >
              <span className="nav-dock-icon">
                <IconComponent className="h-5 w-5 shrink-0" />
              </span>
              <span className="max-w-full truncate text-[11px] font-medium tracking-tight">
                {item.label}
              </span>
              {isActive && <span className="nav-dock-indicator" aria-hidden="true" />}
            </Link>
          )
        })}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setOpenMoreOnPath(moreOpen ? null : pathname)}
          className={`nav-dock-item flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-all duration-300 ${
            isMoreActive || moreOpen
              ? 'bg-[#4A3E85]/10 font-bold text-[#453862] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]'
              : 'text-[#716783] hover:bg-white/35 hover:text-[#2D2A3E]'
          }`}
        >
          <span className={`nav-dock-icon flex h-5 items-center text-lg leading-none ${moreOpen ? 'rotate-90' : ''}`} aria-hidden="true">···</span>
          <span className="max-w-full truncate text-[11px] font-medium tracking-tight">
            {t('nav.more')}
          </span>
          {(isMoreActive || moreOpen) && <span className="nav-dock-indicator" aria-hidden="true" />}
        </button>
      </nav>
      {moreOpen && (
        <div
          role="menu"
          className="app-glass-surface nav-dock-more-menu absolute bottom-[calc(100%+0.75rem)] right-3 z-10 w-52 rounded-2xl p-2 sm:right-5"
        >
          {moreItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const IconComponent = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setOpenMoreOnPath(null)}
                className={`nav-dock-menu-item flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                  isActive
                    ? 'bg-[#4A3E85]/10 text-[#453862]'
                    : 'text-[#6D658E] hover:bg-white/45'
                }`}
              >
                {IconComponent ? (
                  <IconComponent className="h-5 w-5" />
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" />
                  </svg>
                )}
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}