'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { EventRecord } from '@/lib/types'

export default function KPISalesOverview() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllEvents() {
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
    fetchAllEvents()
  }, [])

  // Metrics
  const metrics = useMemo(() => {
    const totalOmset = events.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0)
    const totalTransfer = events.reduce((sum, e) => sum + (Number(e.transfer_amount) || 0), 0)
    const totalPiutang = events.reduce((sum, e) => sum + (Number(e.remaining_amount) || 0), 0)
    const totalEvents = events.length

    // Sales PIC Attribution
    const picMap: Record<string, { omset: number; count: number; transfer: number }> = {}

    events.forEach((e) => {
      const pic = e.sales_pic || 'Belum Ditentukan'
      if (!picMap[pic]) {
        picMap[pic] = { omset: 0, count: 0, transfer: 0 }
      }
      picMap[pic].omset += Number(e.total_amount) || 0
      picMap[pic].count += 1
      picMap[pic].transfer += Number(e.transfer_amount) || 0
    })

    const picList = Object.entries(picMap).map(([name, data]) => ({
      name,
      ...data,
      percentage: totalOmset > 0 ? (data.omset / totalOmset) * 100 : 0,
    }))

    picList.sort((a, b) => b.omset - a.omset)

    // Monthly breakdown
    const monthMap: Record<string, { omset: number; count: number; transfer: number }> = {}
    events.forEach((e) => {
      const month = (e.event_date || '').substring(0, 7) || 'Lainnya'
      if (!monthMap[month]) {
        monthMap[month] = { omset: 0, count: 0, transfer: 0 }
      }
      monthMap[month].omset += Number(e.total_amount) || 0
      monthMap[month].count += 1
      monthMap[month].transfer += Number(e.transfer_amount) || 0
    })

    const monthList = Object.entries(monthMap).map(([month, data]) => ({
      month,
      ...data,
    }))
    monthList.sort((a, b) => a.month.localeCompare(b.month))

    // Top Venues
    const venueMap: Record<string, number> = {}
    events.forEach((e) => {
      if (e.venue) {
        venueMap[e.venue] = (venueMap[e.venue] || 0) + 1
      }
    })
    const topVenues = Object.entries(venueMap)
      .map(([venue, count]) => ({ venue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const avgDeal = totalEvents > 0 ? Math.round(totalOmset / totalEvents) : 0
    const collectionRate = totalOmset > 0 ? Math.round((totalTransfer / totalOmset) * 100) : 0

    return {
      totalOmset,
      totalTransfer,
      totalPiutang,
      totalEvents,
      avgDeal,
      collectionRate,
      picList,
      monthList,
      topVenues,
    }
  }, [events])

  const formatRupiah = (val: number) => 'Rp ' + Number(val || 0).toLocaleString('id-ID')

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-36 rounded-3xl skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 rounded-3xl skeleton" />
          <div className="h-24 rounded-3xl skeleton" />
          <div className="h-24 rounded-3xl skeleton" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-3xl skeleton" />
          <div className="h-80 rounded-3xl skeleton" />
        </div>
        <p className="text-center text-sm font-medium text-[#7B739B]">Menganalisis Performa Sales Yabes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Performance Header */}
      <div className="animate-fade-up p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#B1A9DA]/20 via-[#FAF9F6] to-[#FFEDA8]/30 border border-[#DED9F4] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#DED9F4] text-xs font-semibold text-[#564B95] mb-2">
              <span>🌸</span>
              <span>Yabes Atelier Executive Analytics</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#322A5E]">
              Performa Finansial &amp; Distribusi Sales
            </h2>
            <p className="text-xs sm:text-sm text-[#7B739B] mt-1 max-w-xl">
              Ringkasan konversi transaksi deal dekorasi, perolehan kas masuk riil,
              dan kontribusi sales PIC per event.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#DED9F4] shadow-sm">
            <div className="text-right">
              <p className="text-xs uppercase font-bold text-[#7B739B]">Collection Rate</p>
              <p className="text-2xl font-black text-[#2F7B56]">{metrics.collectionRate}%</p>
              <p className="text-[10px] text-[#7B739B]">Kas Masuk / Tagihan</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl">
              📈
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#DED9F4] shadow-sm">
          <p className="text-xs font-semibold uppercase text-[#7B739B]">Total Transaksi Deal</p>
          <p className="text-2xl font-bold text-[#322A5E] mt-1">{metrics.totalEvents} Acara</p>
          <p className="text-xs text-[#7B739B] mt-1">Akumulasi seluruh event tercatat</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#DED9F4] shadow-sm">
          <p className="text-xs font-semibold uppercase text-[#7B739B]">Rata-rata Nilai Deal (ARPU)</p>
          <p className="text-2xl font-bold text-[#564B95] mt-1">{formatRupiah(metrics.avgDeal)}</p>
          <p className="text-xs text-[#7B739B] mt-1">Rerata per paket dekorasi meja</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#DED9F4] shadow-sm">
          <p className="text-xs font-semibold uppercase text-[#7B739B]">Outstanding Piutang (Kurang)</p>
          <p className="text-2xl font-bold text-[#A3432B] mt-1">{formatRupiah(metrics.totalPiutang)}</p>
          <p className="text-xs text-[#7B739B] mt-1">Sisa tagihan yang belum dilunasi</p>
        </div>
      </div>

      {/* Two Column Layout: Sales PIC Leaderboard & Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales PIC Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-[#DED9F4] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👑</span>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#322A5E]">
                  Atribusi Sales PIC
                </h3>
                <p className="text-xs text-[#7B739B]">Kontribusi deal berdasarkan PIC</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFEDA8] text-[#7D6B14] border border-[#FAE489]">
              {metrics.picList.length} PIC
            </span>
          </div>

          {metrics.picList.length === 0 ? (
            <p className="text-xs text-[#7B739B] text-center py-8">Belum ada data sales PIC.</p>
          ) : (
            <div className="space-y-4">
              {metrics.picList.map((pic, idx) => (
                <div
                  key={pic.name}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EAE5F7] space-y-2 hover:border-[#B1A9DA] transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#B1A9DA] text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#322A5E] text-sm">{pic.name}</span>
                    </div>
                    <span className="font-bold text-[#564B95] text-sm">
                      {formatRupiah(pic.omset)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#EAE5F7] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="animate-grow-width bg-gradient-to-r from-[#B1A9DA] to-[#FFEDA8] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, pic.percentage))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7B739B]">
                    <span>
                      {pic.count} Acara | Kas Masuk: {formatRupiah(pic.transfer)}
                    </span>
                    <span className="font-bold text-[#4A3E85]">
                      {pic.percentage.toFixed(1)}% Share
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Breakdown & Top Venues */}
        <div className="space-y-6">
          {/* Monthly Trend */}
          <div className="p-6 rounded-3xl bg-white border border-[#DED9F4] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📅</span>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#322A5E]">
                  Tren Penjualan Bulanan
                </h3>
                <p className="text-xs text-[#7B739B]">Rekap omset menurut bulan pelaksanaan</p>
              </div>
            </div>

            {metrics.monthList.length === 0 ? (
              <p className="text-xs text-[#7B739B] text-center py-6">Belum ada data bulanan.</p>
            ) : (
              <div className="divide-y divide-[#F0EDF9]">
                {metrics.monthList.map((m) => (
                  <div key={m.month} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#322A5E] text-sm">{m.month}</p>
                      <p className="text-[11px] text-[#7B739B]">{m.count} Acara Terjadwal</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#322A5E] text-sm">{formatRupiah(m.omset)}</p>
                      <p className="text-[11px] text-[#2F7B56]">
                        Kas: {formatRupiah(m.transfer)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Venues */}
          <div className="p-6 rounded-3xl bg-white border border-[#DED9F4] shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏛️</span>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#322A5E]">
                  Top Lokasi / Venue Favorit
                </h3>
                <p className="text-xs text-[#7B739B]">Venue yang paling sering dipesan klien</p>
              </div>
            </div>

            {metrics.topVenues.length === 0 ? (
              <p className="text-xs text-[#7B739B] text-center py-4">Belum ada data venue.</p>
            ) : (
              <div className="space-y-2 pt-2">
                {metrics.topVenues.map((v, i) => (
                  <div
                    key={v.venue}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] text-xs"
                  >
                    <span className="font-medium text-[#322A5E]">
                      {i + 1}. {v.venue}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F4F2FB] text-[#564B95] font-bold text-[11px]">
                      {v.count}x Acara
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}