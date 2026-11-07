'use client'

import { useState, useEffect, useMemo } from 'react'
import TopHeader from '@/components/TopHeader'
import BottomNav from '@/components/BottomNav'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'
import { useToday } from '@/lib/use-today'
import type { EventRecord } from '@/lib/types'

export default function EventsPage() {
  const { user } = useAuth()
  const language = user?.language ?? 'id'
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key)
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUpcoming() {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    }
    fetchUpcoming()
  }, [])

  const todayStr = useToday()

  // Segment 1: Today's Event
  const todaysEvents = useMemo(() => {
    return events.filter((e) => e.event_date === todayStr)
  }, [events, todayStr])

  // Segment 2: Ongoing / Upcoming Events (event_date > today)
  const ongoingEvents = useMemo(() => {
    return events.filter((e) => e.event_date > todayStr)
  }, [events, todayStr])

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID')
  }

  const getDaysDiff = (dateStr: string) => {
    const today = new Date(todayStr).getTime()
    const target = new Date(dateStr).getTime()
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Hari ini'
    if (diffDays === 1) return 'Besok'
    if (diffDays > 1) return `${diffDays} hari lagi`
    return `${Math.abs(diffDays)} hari lalu`
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-[#FFEDA8] selection:text-[#322A5E]">
      <TopHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
        {/* Page Title Header */}
        <div className="flex items-center justify-between border-b border-[#DED9F4]/70 pb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#322A5E]">
              {t('page.events')}
            </h1>
            <p className="text-xs text-[#7B739B] mt-0.5">
              {t('page.eventsDescription')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EAE5F8] text-[#4A3E85] border border-[#DED9F4]">
            <span>🗓️</span>
            <span>{todaysEvents.length + ongoingEvents.length} {t('page.activeEvents')}</span>
          </div>
        </div>

        {/* SEGMENT 1: Today's Event */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#322A5E]">
                {t('page.todayEvent')}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {todaysEvents.length}
              </span>
            </div>
            <span className="text-xs text-[#7B739B]">{t('page.todayEvent')}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#DED9F4] text-xs text-[#7B739B]">
              {t('page.eventsLoading')}
            </div>
          ) : todaysEvents.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-2xl border border-[#DED9F4] text-xs text-[#7B739B]">
              🌸 {t('page.noTodayEvents')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todaysEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="relative p-5 rounded-2xl bg-white border-2 border-[#564B95] shadow-md shadow-[#B1A9DA]/20 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFEDA8] text-[#7D6B14]">
                        Hari Ini
                      </span>
                      <h3 className="text-lg font-bold text-[#322A5E] mt-1">
                        {evt.client_name}
                      </h3>
                      <p className="text-xs text-[#564B95] font-medium">
                        {evt.decor_type}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        evt.status === 'Lunas'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div className="text-xs text-[#7B739B] space-y-1 pt-2 border-t border-[#DED9F4]">
                    <p>📍 <strong>Venue:</strong> {evt.venue || '-'}</p>
                    <p>👤 <strong>Sales PIC:</strong> {evt.sales_pic || '-'}</p>
                    <p>💰 <strong>Total:</strong> {formatRupiah(evt.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SEGMENT 2: Ongoing Events */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏳</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#322A5E]">
                Ongoing Events
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F0EDF9] text-[#564B95]">
                {ongoingEvents.length}
              </span>
            </div>
            <span className="text-xs text-[#7B739B]">Mendatang</span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#DED9F4] text-xs text-[#7B739B]">
              Memuat event mendatang...
            </div>
          ) : ongoingEvents.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#DED9F4] text-xs text-[#7B739B]">
              Tidak ada event mendatang yang terdaftar.
            </div>
          ) : (
            <div className="stagger-children grid grid-cols-1 md:grid-cols-2 gap-4">
              {ongoingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl bg-white border border-[#DED9F4] hover:border-[#B1A9DA] shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0EDF9] text-[#564B95]">
                        {getDaysDiff(evt.event_date)} ({evt.event_date})
                      </span>
                      <h3 className="text-base font-bold text-[#322A5E] mt-1.5">
                        {evt.client_name}
                      </h3>
                      <p className="text-xs text-[#6D658E]">
                        {evt.decor_type}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        evt.status === 'Lunas'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div className="text-xs text-[#7B739B] space-y-1 pt-2 border-t border-[#DED9F4]/70">
                    <div className="flex items-center justify-between">
                      <span>📍 {evt.venue || '-'}</span>
                      <span className="font-semibold text-[#322A5E]">
                        {formatRupiah(evt.total_amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>PIC: {evt.sales_pic || '-'}</span>
                      {Number(evt.remaining_amount || 0) > 0 && (
                        <span className="text-amber-700 font-bold">
                          Kurang: {formatRupiah(evt.remaining_amount || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}