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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7E3F3] bg-white/95 backdrop-blur-xl shadow-[0_-8px_24px_rgba(74,62,133,0.08)]"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
        paddingLeft: 'max(env(safe-area-inset-left), 0.75rem)',
        paddingRight: 'max(env(safe-area-inset-right), 0.75rem)',
      }}
    >
      <nav
        aria-label="Main navigation"
        className="relative mx-auto flex w-full max-w-2xl items-stretch justify-around px-1 pt-1.5"
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
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-colors ${
                isActive
                  ? 'bg-[#FFF9E6] font-bold text-[#4A3E85]'
                  : 'text-[#7B739B] hover:text-[#2D2A3E] hover:bg-[#FAF9F6]'
              }`}
            >
              <IconComponent className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setOpenMoreOnPath(moreOpen ? null : pathname)}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-colors ${
            isMoreActive || moreOpen
              ? 'bg-[#FFF9E6] font-bold text-[#4A3E85]'
              : 'text-[#7B739B] hover:bg-[#FAF9F6] hover:text-[#2D2A3E]'
          }`}
        >
          <span className="flex h-5 items-center text-lg leading-none" aria-hidden="true">···</span>
          <span className="max-w-full truncate text-[10px] font-medium tracking-tight">
            {t('nav.more')}
          </span>
        </button>
        {moreOpen && (
          <div
            role="menu"
            className="absolute bottom-full right-0 mb-2 w-52 rounded-2xl border border-[#E7E3F3] bg-white p-2 shadow-xl"
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-[#F6F4FC] text-[#4A3E85]'
                      : 'text-[#6D658E] hover:bg-[#FAF9F6]'
                  }`}
                >
                  {IconComponent ? (
                    <IconComponent className="h-5 w-5" />
                  ) : (
                    <span className="w-5 text-center" aria-hidden="true">⚙</span>
                  )}
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>
    </div>
  )
}