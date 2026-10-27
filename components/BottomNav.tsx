'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { HomeIcon, CalendarIcon, ClockIcon, ChartIcon, BoxIcon, DocumentIcon } from '@/components/icons/Icons'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Beranda', icon: HomeIcon },
    { href: '/events', label: 'Events', icon: CalendarIcon },
    { href: '/follow-up', label: 'Follow Up', icon: ClockIcon },
    { href: '/recap', label: 'Recap', icon: DocumentIcon },
    { href: '/sales', label: 'Sales', icon: ChartIcon },
    { href: '/inventory', label: 'Inventaris', icon: BoxIcon },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
      <nav className="bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E7E3F3] shadow-xl shadow-[#4A3E85]/10 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          const IconComponent = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-[#FFD166] font-bold bg-[#FFF9E6] animate-pulse-gold shadow-lg shadow-[#FFD166]/30'
                  : 'text-[#7B739B] hover:text-[#2D2A3E] hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="absolute -top-2 -right-2 w-3 h-3 opacity-60 pointer-events-none">
                <svg viewBox="0 0 10 10" className="w-full h-full">
                  <circle cx="5" cy="5" r="3" fill="#FFD166" opacity="0.5"/>
                  <circle cx="3" cy="3" r="1.5" fill="#FFEB3B" opacity="0.3"/>
                  <circle cx="7" cy="7" r="1.5" fill="#FFEB3B" opacity="0.3"/>
                </svg>
              </div>
              <IconComponent className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}