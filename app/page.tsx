'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import TopHeader from '@/components/TopHeader'
import BottomNav from '@/components/BottomNav'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { EventRecord } from '@/lib/types'
import EventModal from '@/components/EventModal'
import FAB from '@/components/FAB'
import { CalendarIcon, ChevronRightIcon } from '@/components/icons/Icons'
import { motion } from 'motion/react'
import CountUp from '@/components/motion/CountUp'

export default function HomePage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Financial aggregates
  const stats = useMemo(() => {
    const totalOmset = events.reduce((sum, e) => sum + Number(e.total_amount || 0), 0)
    const totalCashIn = events.reduce((sum, e) => sum + Number(e.transfer_amount || 0), 0)
    const totalPiutang = events.reduce((sum, e) => sum + Number(e.remaining_amount || 0), 0)
    const totalEvents = events.length
    const lunasCount = events.filter((e) => e.status === 'Lunas').length
    const kurangCount = events.filter((e) => e.status === 'Kurang').length
    const collectionRate = totalOmset > 0 ? (totalCashIn / totalOmset) * 100 : 0

    return {
      totalOmset,
      totalCashIn,
      totalPiutang,
      totalEvents,
      lunasCount,
      kurangCount,
      collectionRate,
    }
  }, [events])

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID')
  }

  const recentEvents = useMemo(() => events.slice(0, 8), [events])

  const [todayFormatted, setTodayFormatted] = useState('')
  const [greetingText, setGreetingText] = useState('Selamat datang')

  useEffect(() => {
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
    const months = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ]
    const d = new Date()
    const day = days[d.getDay()]
    const date = d.getDate()
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    setTodayFormatted(`${day}, ${date} ${month} ${year}`)

    const hour = d.getHours()
    if (hour < 11) setGreetingText('Selamat pagi')
    else if (hour < 15) setGreetingText('Selamat siang')
    else if (hour < 18) setGreetingText('Selamat sore')
    else setGreetingText('Selamat malam')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <TopHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 pb-32 sm:pb-24 pt-4">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7B739B]">
            {todayFormatted}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2A3E] leading-tight">
            {greetingText}, {user?.name?.split(' ')[0] || 'St. Yabes'}!
          </h1>
        </div>

        <section className="mb-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E7E3F3] shadow-sm text-center animate-fade-up">
            <span className="text-xs uppercase tracking-wider font-medium text-[#7B739B] mb-1.5 block">
              Total Omset
            </span>
            <div className="font-serif text-3xl sm:text-4xl font-black text-[#4A3E85] leading-none mb-2">
              {loading ? (
                <span className="opacity-50">...</span>
              ) : (
                <CountUp value={stats.totalOmset} format={formatRupiah} />
              )}
            </div>
            <p className="text-xs text-[#7B739B]">
              {stats.totalEvents} deal{stats.totalEvents !== 1 ? 's' : ''} tercatat
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <motion.div className="bg-white rounded-xl p-4 border border-[#E7E3F3] shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFEDA8] flex items-center justify-center text-base font-bold text-[#4A3E85]">
                +
              </div>
              <div>
                <p className="text-xs font-medium text-[#7B739B]">Cash In</p>
                <p className="text-sm font-semibold text-[#2D2A3E]">
                  {loading ? '...' : <CountUp value={stats.totalCashIn} format={formatRupiah} />}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-4 border border-[#E7E3F3] shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFEDA8]/30 flex items-center justify-center text-base font-bold text-[#C9A227]">
                +
              </div>
              <div>
                <p className="text-xs font-medium text-[#7B739B]">Piutang</p>
                <p className="text-sm font-semibold text-[#2D2A3E]">
                  {loading ? '...' : <CountUp value={stats.totalPiutang} format={formatRupiah} />}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base font-bold text-[#2D2A3E]">Deal Event Terbaru</h2>
            <Link href="/events" className="text-xs font-medium text-[#4A3E85] hover:underline flex items-center gap-0.5">
              Lihat Semua →
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E3F3] shadow-sm overflow-hidden">
            {loading ? (
              <div className="divide-y divide-[#E7E3F3]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="h-4 bg-[#E7E3F3] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[#E7E3F3] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentEvents.length > 0 ? (
              <div className="divide-y divide-[#E7E3F3]">
                {recentEvents.map((evt) => (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.id}`}
                    className="block p-4 hover:bg-[#FAF9F6] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#2D2A3E] text-sm truncate">
                          {evt.client_name}
                        </p>
                        <p className="text-xs text-[#7B739B] truncate">
                          {evt.decor_type} • {evt.venue}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#4A3E85] text-sm">
                          {formatRupiah(evt.total_amount)}
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            evt.status === 'Lunas'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : evt.status === 'Kurang'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#7B739B]">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{evt.event_date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[#7B739B] text-sm">Belum ada data acara</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <FAB onClick={() => setModalOpen(true)} />
      <BottomNav />

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  )
}

