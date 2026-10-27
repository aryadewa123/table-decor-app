'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface NavbarProps {
  onNewEventClick?: () => void
}

export default function Navbar({ onNewEventClick }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/events', label: 'Rekap Deal Events', icon: '📋' },
    { href: '/analytics', label: 'KPI & Sales', icon: '📊' },
    { href: '/inventory', label: 'Master Inventaris', icon: '🌿' },
  ]

  const handleNewEvent = () => {
    if (onNewEventClick) {
      onNewEventClick()
    } else {
      router.push('/events?new=true')
    }
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FAF9F6]/90 border-b border-[#DED9F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B1A9DA] via-[#C9C3EA] to-[#FFEDA8] p-0.5 shadow-sm shadow-[#B1A9DA]/30 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#FAF9F6] flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                🌸
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-wider text-2xl font-bold text-[#322A5E]">
                  Yabes
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-full bg-[#FFEDA8] text-[#7D6B14] border border-[#FAE489]">
                  Atelier
                </span>
              </div>
              <p className="text-xs text-[#7B739B] tracking-wide font-light">
                Table Decor &amp; Event Recap Management
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-[#F0EDF9] border border-[#DED9F4]">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-white text-[#4A3E85] shadow-sm shadow-[#B1A9DA]/20 border border-[#DED9F4]'
                      : 'text-[#6D658E] hover:text-[#322A5E] hover:bg-white/50'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action: "+ Tambah Event" & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleNewEvent}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] active:scale-95 transition-all shadow-sm shadow-[#FFEDA8]/50 border border-[#FAE489]"
            >
              <span className="text-base font-bold">+</span>
              <span className="hidden sm:inline">Deal Event Baru</span>
              <span className="sm:hidden">Tambah</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-[#DED9F4]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E6E1F7] text-[#4A3E85] flex items-center justify-center text-xs font-bold border border-[#DED9F4]" title={`${user.name} (${user.role})`}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-[#322A5E] leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-[#7B739B]">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Keluar / Ganti Akun"
                  className="p-1.5 rounded-lg text-[#7B739B] hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs"
                >
                  🚪
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl border border-[#DED9F4] text-xs font-semibold text-[#564B95] hover:bg-white transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden border-t border-[#DED9F4]/60 py-2.5 gap-2 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#B1A9DA] text-white shadow-sm'
                    : 'text-[#6D658E] bg-[#F0EDF9]'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}