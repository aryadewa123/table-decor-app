'use client'

import { useState, useEffect, useMemo } from 'react'
import TopHeader from '@/components/TopHeader'
import BottomNav from '@/components/BottomNav'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'
import { useToday } from '@/lib/use-today'
import type { EventRecord } from '@/lib/types'

export default function FollowUpPage() {
  const { user } = useAuth()
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(user?.language ?? 'id', key)
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUnpaid() {
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
    fetchUnpaid()
  }, [])

  const todayStr = useToday()

  // Filter clients with unpaid balance
  const unpaidEvents = useMemo(() => {
    return events.filter(
      (e) => (e.remaining_amount && e.remaining_amount > 0) || e.status === 'Kurang'
    )
  }, [events])

  // Segmen Merah: Acara SUDAH LEWAT tapi BELUM LUNAS
  const overdueEvents = useMemo(() => {
    return unpaidEvents
      .filter((e) => e.event_date < todayStr)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
  }, [unpaidEvents, todayStr])

  // Segmen Urgent Mendatang: Acara BELUM LEWAT, diurutkan paling dekat hari H
  const upcomingUnpaidEvents = useMemo(() => {
    return unpaidEvents
      .filter((e) => e.event_date >= todayStr)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
  }, [unpaidEvents, todayStr])

  const totalPiutang = useMemo(() => {
    return unpaidEvents.reduce((acc, curr) => acc + (curr.remaining_amount || 0), 0)
  }, [unpaidEvents])

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID')
  }

  const getDaysDiff = (dateStr: string) => {
    const today = new Date(todayStr).getTime()
    const target = new Date(dateStr).getTime()
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-[#FFEDA8] selection:text-[#322A5E]">
      <TopHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
        {/* Page Title & Summary Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DED9F4]/70 pb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#322A5E]">
              {t('page.followUp')}
            </h1>
            <p className="text-xs text-[#7B739B] mt-0.5">
              {t('page.followUpDescription')}
            </p>
          </div>

          <div className="p-3 px-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between sm:justify-end gap-4 shadow-sm">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800">
                Total Sisa Piutang
              </span>
              <p className="text-lg font-black text-amber-900">
                {formatRupiah(totalPiutang)}
              </p>
            </div>
            <span className="text-2xl">⚠️</span>
          </div>
        </div>

        {/* SEGMEN MERAH: CLIENT SUDAH LEWAT TANGGAL ACARA TAPI BELUM LUNAS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-pulse" />
            <h2 className="font-serif text-xl sm:text-2xl font-black text-rose-700 tracking-tight">
              Overdue
            </h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
              {overdueEvents.length} KLIEN
            </span>
          </div>
          <p className="text-xs text-rose-700 font-medium">
            Acara telah berlangsung namun pembayaran belum lunas. Memerlukan penagihan prioritas tinggi!
          </p>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-xs text-[#7B739B]">
              Memuat data follow up...
            </div>
          ) : overdueEvents.length === 0 ? (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 font-medium text-center">
              ✨ Luar biasa! Tidak ada tagihan yang melewati tanggal acara. Semua acara yang lalu sudah lunas.
            </div>
          ) : (
            <div className="space-y-4">
              {overdueEvents.map((evt) => {
                const daysAgo = Math.abs(getDaysDiff(evt.event_date))
                return (
                  <div
                    key={evt.id}
                    className="p-6 rounded-3xl bg-rose-50/80 border-2 border-rose-400 shadow-md shadow-rose-900/10 space-y-4"
                  >
                    {/* NAMA CLIENT CUKUP BESAR */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                          LEWAT {daysAgo} HARI ({evt.event_date})
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-950 mt-1 uppercase tracking-wide">
                          {evt.client_name}
                        </h3>
                        <p className="text-xs font-semibold text-rose-800">
                          {evt.decor_type} • {evt.venue || 'Lokasi belum ditentukan'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[11px] font-bold text-rose-700 uppercase">
                          Kekurangan Pembayaran
                        </span>
                        <p className="text-2xl sm:text-3xl font-black text-rose-600">
                          {formatRupiah(evt.remaining_amount || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Detail Informasi & Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900">
                      <div className="flex flex-wrap gap-4">
                        <p>
                          <strong>Nilai Total:</strong> {formatRupiah(evt.total_amount)}
                        </p>
                        <p>
                          <strong>Sudah Transfer:</strong> {formatRupiah(evt.transfer_amount || 0)}
                        </p>
                        <p>
                          <strong>Sales PIC:</strong> {evt.sales_pic || '-'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/?text=Halo%20Kak%20${encodeURIComponent(
                            evt.client_name
                          )},%20kami%20dari%20Yabes%20Atelier%20mengingatkan%20terkait%20sisa%20pelunasan%20dekorasi%20sebesar%20${encodeURIComponent(
                            formatRupiah(evt.remaining_amount || 0)
                          )}.%20Terima%20kasih.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          💬 Follow Up WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* SEGMEN MENDATANG: CLIENT BELUM LUNAS MENJELANG HARI H */}
        <section className="space-y-4 pt-4 border-t border-[#DED9F4]/70">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏳</span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#322A5E]">
              Menjelang Hari H (Belum Lunas)
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EAE5F8] text-[#564B95]">
              {upcomingUnpaidEvents.length} Klien
            </span>
          </div>
          <p className="text-xs text-[#7B739B]">
            Diurutkan dari jadwal acara yang paling dekat untuk persiapan penagihan pelunasan
          </p>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#DED9F4] text-xs text-[#7B739B]">
              Memuat antrean...
            </div>
          ) : upcomingUnpaidEvents.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-2xl border border-[#DED9F4] text-xs text-[#7B739B]">
              Semua event mendatang sudah lunas atau belum ada jadwal tersisa.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingUnpaidEvents.map((evt) => {
                const diff = getDaysDiff(evt.event_date)
                const isImminent = diff <= 3
                return (
                  <div
                    key={evt.id}
                    className={`p-5 rounded-2xl bg-white border transition-all space-y-3 ${
                      isImminent
                        ? 'border-amber-400 shadow-md shadow-amber-500/10'
                        : 'border-[#DED9F4] hover:border-[#B1A9DA]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isImminent
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-[#F0EDF9] text-[#564B95]'
                          }`}
                        >
                          {diff === 0 ? 'HARI INI' : diff === 1 ? 'BESOK' : `${diff} HARI LAGI`} ({evt.event_date})
                        </span>
                        <h3 className="text-lg font-bold text-[#322A5E] mt-1.5">
                          {evt.client_name}
                        </h3>
                        <p className="text-xs text-[#6D658E]">
                          {evt.decor_type}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-amber-700">
                          Sisa Tagihan
                        </span>
                        <p className="text-base font-black text-amber-900">
                          {formatRupiah(evt.remaining_amount || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-[#7B739B] pt-2 border-t border-[#DED9F4]/70 flex items-center justify-between">
                      <span>📍 {evt.venue || '-'}</span>
                      <span>PIC: <strong>{evt.sales_pic || '-'}</strong></span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}