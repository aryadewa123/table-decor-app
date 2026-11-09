'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'
import type { EventRecord, PaymentStatus } from '@/lib/types'
import EventModal from '@/components/EventModal'
import FloralSelect from '@/components/FloralSelect'

interface EventManagerProps {
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
}

export default function EventManager({
  isModalOpen,
  setIsModalOpen,
}: EventManagerProps) {
  const { user } = useAuth()
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(user?.language ?? 'id', key)
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('all') // 'all', '2026-08', '2026-09', etc.
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPic, setSelectedPic] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)

  // Modal State for Edit
  const [eventToEdit, setEventToEdit] = useState<EventRecord | null>(null)

  const fetchEvents = useCallback(async () => {
    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })

    if (selectedMonth !== 'all') {
      const [yearStr, monthStr] = selectedMonth.split('-')
      const y = parseInt(yearStr, 10)
      const m = parseInt(monthStr, 10)
      const startDate = `${yearStr}-${monthStr}-01`
      const lastDay = new Date(y, m, 0).getDate()
      const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`
      query = query.gte('event_date', startDate).lte('event_date', endDate)
    }

    if (selectedStatus !== 'all') {
      query = query.eq('status', selectedStatus)
    }

    if (selectedPic !== 'all') {
      query = query.eq('sales_pic', selectedPic)
    }

    return query
  }, [selectedMonth, selectedStatus, selectedPic])

  const refreshEvents = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchErr } = await fetchEvents()

    if (fetchErr) {
      setError(`Gagal memuat rekap event: ${fetchErr.message}`)
      console.error('Error fetching events:', fetchErr)
    } else {
      setError(null)
      setEvents(data || [])
    }
    setLoading(false)
  }, [fetchEvents])

  useEffect(() => {
    let active = true
    void fetchEvents().then(({ data, error: fetchErr }) => {
      if (!active) return

      if (fetchErr) {
        setError(`Gagal memuat rekap event: ${fetchErr.message}`)
        console.error('Error fetching events:', fetchErr)
      } else {
        setError(null)
        setEvents(data || [])
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [fetchEvents])

  // Filter by search query (client name or venue)
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events
    const q = searchQuery.toLowerCase()
    return events.filter(
      (e) =>
        e.client_name.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.decor_type.toLowerCase().includes(q)
    )
  }, [events, searchQuery])

  // Financial metrics calculated client-side
  const metrics = useMemo(() => {
    const totalOmset = filteredEvents.reduce(
      (sum, e) => sum + (Number(e.total_amount) || 0),
      0
    )
    const totalTransfer = filteredEvents.reduce(
      (sum, e) => sum + (Number(e.transfer_amount) || 0),
      0
    )
    const totalPiutang = filteredEvents.reduce(
      (sum, e) => sum + (Number(e.remaining_amount) || 0),
      0
    )
    const lunasCount = filteredEvents.filter((e) => e.status === 'Lunas').length

    return { totalOmset, totalTransfer, totalPiutang, lunasCount }
  }, [filteredEvents])

  // Delete Event Handler
  async function handleDeleteEvent(id: string, client: string) {
    const confirmed = window.confirm(
      `Hapus transaksi rekap event untuk klien "${client}"?`
    )
    if (!confirmed) return

    const { error: delErr } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (delErr) {
      alert(`Gagal menghapus: ${delErr.message}`)
    } else {
      await refreshEvents()
    }
  }

  // CSV Export (compatible with Google Sheets import)
  const handleCSVExport = useCallback(() => {
    if (filteredEvents.length === 0) {
      alert('Tidak ada data untuk diekspor.')
      return
    }

    setExporting(true)
    try {
      const headers = [
        'No', 'Tanggal Deal', 'Tanggal Acara', 'Nama Klien', 'Jenis Dekor',
        'Venue', 'Total Omset', 'Transfer/Cash In', 'Piutang',
        'Status', 'Charge Overtime', 'Sales PIC', 'Catatan'
      ]

      const rows = filteredEvents.map((evt, i) => {
        const esc = (v: string | number | null | undefined) => {
          const s = String(v ?? '')
          return s.includes(',') || s.includes('"') || s.includes('\n')
            ? '"' + s.replace(/"/g, '""') + '"'
            : s
        }
        return [
          i + 1,
          evt.dealing_date,
          evt.event_date,
          esc(evt.client_name),
          esc(evt.decor_type),
          esc(evt.venue),
          Number(evt.total_amount) || 0,
          Number(evt.transfer_amount) || 0,
          Number(evt.remaining_amount) || 0,
          evt.status,
          Number(evt.charge_overtime) || 0,
          esc(evt.sales_pic),
          esc(evt.notes)
        ].join(',')
      })

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      link.href = url
      link.download = `Recap_Deals_${selectedMonth === 'all' ? 'Semua' : selectedMonth}_${y}${m}${d}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Terjadi kesalahan saat mengekspor.')
    }
    setExporting(false)
  }, [filteredEvents, selectedMonth])

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Lunas':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'DP':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Kurang':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
      case 'Batal':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Decorative flower */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-20 pointer-events-none animate-sway">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 15 C 70 20, 85 45, 70 60 C 55 75, 45 75, 30 60 C 15 45, 30 20, 50 15 Z" fill="#FFD166" opacity="0.4"/>
          <circle cx="50" cy="45" r="8" fill="#FFEB3B" opacity="0.3"/>
        </svg>
      </div>
      {/* Financial Summary Cards (Lavender Dream & Pale Lemon Palette) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omset */}
        <div className="p-5 rounded-3xl bg-white border border-[#DED9F4] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#B1A9DA]/15 group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7B739B]">
              {t('events.totalRevenue')}
            </span>
            <span className="text-xl">🌸</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#322A5E]">
            {formatRupiah(metrics.totalOmset)}
          </p>
          <p className="text-[11px] text-[#7B739B] mt-1 font-medium">
            {filteredEvents.length} {t('events.eventCount')}
          </p>
        </div>

        {/* Card 2: Cash In (Transfer) */}
        <div className="p-5 rounded-3xl bg-white border border-[#DED9F4] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-emerald-100/40 group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F7B56]">
              Cash In (Transfer)
            </span>
            <span className="text-xl">💳</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#2F7B56]">
            {formatRupiah(metrics.totalTransfer)}
          </p>
          <p className="text-[11px] text-[#2F7B56]/80 mt-1 font-medium">
            {t('events.cashIn')}
          </p>
        </div>

        {/* Card 3: Sisa Piutang (Kurang) */}
        <div className="p-5 rounded-3xl bg-[#FFFDF2] border border-[#FAE489] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#FFEDA8]/40 group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A3432B]">
              {t('events.outstanding')}
            </span>
            <span className="text-xl">⚠️</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#A3432B]">
            {formatRupiah(metrics.totalPiutang)}
          </p>
          <p className="text-[11px] text-[#8C7718] mt-1 font-medium">
            {metrics.totalPiutang === 0 ? `✓ ${t('events.noArrears')}` : t('events.needsFollowUp')}
          </p>
        </div>

        {/* Card 4: Event Lunas */}
        <div className="p-5 rounded-3xl bg-white border border-[#DED9F4] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#B1A9DA]/15 group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7B739B]">
              {t('events.collectionRate')}
            </span>
            <span className="text-xl">✨</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#4A3E85]">
            {filteredEvents.length > 0
              ? Math.round((metrics.lunasCount / filteredEvents.length) * 100)
              : 0}
            %
          </p>
          <p className="text-[11px] text-[#7B739B] mt-1 font-medium">
            {metrics.lunasCount} / {filteredEvents.length} {t('events.paidCount')}
          </p>
        </div>
      </div>

      {/* Controls Bar: Periode, Status, PIC & Search */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#DED9F4] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-bold uppercase text-[#7B739B] mr-2">
              {t('events.period')}:
            </span>
            {[
              { label: t('events.allPeriods'), value: 'all' },
              { label: 'Agustus 2026', value: '2026-08' },
              { label: 'September 2026', value: '2026-09' },
              { label: 'Oktober 2026', value: '2026-10' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedMonth(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMonth === tab.value
                    ? 'bg-[#B1A9DA] text-white shadow-sm shadow-[#B1A9DA]/40'
                    : 'bg-[#F4F2FB] text-[#6D658E] hover:bg-[#EAE5F7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('events.search')}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF9F6] border border-[#DED9F4] text-xs sm:text-sm text-[#322A5E] placeholder-[#B5B0CC] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
            />
            <span className="absolute left-3 top-2.5 text-xs text-[#7B739B]">
              🔍
            </span>
          </div>
        </div>

        {/* Sub-Filters: Status & Sales PIC */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#F0EDF9] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#6D658E]">{t('events.status')}:</span>
            <FloralSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
              ariaLabel={t('events.status')}
              className="min-w-[150px]"
              options={[
                { value: 'all', label: t('events.allStatuses') },
                { value: 'Lunas', label: t('events.paid') },
                { value: 'DP', label: t('events.downPayment') },
                { value: 'Kurang', label: t('events.balanceDue') },
                { value: 'Batal', label: t('events.canceled') },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#6D658E]">{t('events.salesPic')}:</span>
            <FloralSelect
              value={selectedPic}
              onChange={setSelectedPic}
              ariaLabel={t('events.salesPic')}
              className="min-w-[150px]"
              options={[
                { value: 'all', label: t('events.allSales') },
                { value: 'Ce Loren', label: 'Ce Loren' },
                { value: 'Arsita', label: 'Arsita' },
              ]}
            />
          </div>

          <button
            onClick={() => {
              setSelectedMonth('all')
              setSelectedStatus('all')
              setSelectedPic('all')
              setSearchQuery('')
            }}
            className="ml-auto text-[#7B739B] hover:text-[#322A5E] underline text-xs"
          >
            {t('events.reset')}
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleCSVExport}
            disabled={exporting || filteredEvents.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#FFD166] bg-[#FFF9E6] hover:bg-[#FFEBD5] border border-[#FFD166]/30 transition-all duration-200 disabled:opacity-40 hover:scale-[1.02] active:scale-95 shadow-md shadow-[#FFD166]/20"
          >
            <span>📊</span>
            <span>{exporting ? t('events.exporting') : t('events.export')}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Events Table */}
      <div className="rounded-3xl bg-white border border-[#DED9F4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#7B739B]">
            <div className="w-10 h-10 border-4 border-[#B1A9DA] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">{t('events.loading')}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center text-[#7B739B] px-4">
            <div className="w-16 h-16 rounded-full bg-[#F4F2FB] border border-[#DED9F4] flex items-center justify-center mx-auto mb-4 text-3xl">
              🌸
            </div>
            <h3 className="font-serif text-lg font-bold text-[#322A5E] mb-1">
              {t('events.emptyTitle')}
            </h3>
            <p className="text-xs text-[#7B739B] max-w-sm mx-auto mb-5">
              {t('events.emptyDescription')}
            </p>
            <button
              onClick={() => {
                setEventToEdit(null)
                setIsModalOpen(true)
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] border border-[#FAE489] transition shadow-sm"
            >
              + {t('events.firstDeal')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#DED9F4] text-[#6D658E] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-3 text-center w-12">{t('events.number')}</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">{t('events.dealDate')}</th>
                  <th className="py-3.5 px-3">{t('events.client')}</th>
                  <th className="py-3.5 px-3">{t('events.decor')}</th>
                  <th className="py-3.5 px-3">{t('events.venue')}</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">{t('events.eventDate')}</th>
                  <th className="py-3.5 px-3 text-right">{t('events.total')}</th>
                  <th className="py-3.5 px-3 text-right">{t('events.transfer')}</th>
                  <th className="py-3.5 px-3 text-right">{t('events.remaining')}</th>
                  <th className="py-3.5 px-3 text-center">{t('events.status')}</th>
                  <th className="py-3.5 px-3">{t('events.salesPic')}</th>
                  <th className="py-3.5 px-3 text-center w-24">{t('events.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDF9]">
                {filteredEvents.map((evt, idx) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-[#FAF9F6] transition-colors"
                  >
                    <td className="py-3.5 px-3 text-center font-medium text-[#7B739B]">
                      {evt.event_number || idx + 1}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-[#6D658E]">
                      {evt.dealing_date}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-[#322A5E]">
                      {evt.client_name}
                      {evt.notes && (
                        <p className="text-[10px] text-[#7B739B] font-normal truncate max-w-[180px]">
                          {evt.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-[#564B95] font-medium">
                      {evt.decor_type}
                    </td>

                    <td className="py-3.5 px-3 text-[#6D658E]">
                      {evt.venue}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap font-medium text-[#322A5E]">
                      {evt.event_date}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-[#322A5E]">
                      {formatRupiah(evt.total_amount)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-semibold text-[#2F7B56]">
                      {formatRupiah(evt.transfer_amount)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold">
                      <span
                        className={
                          Number(evt.remaining_amount) > 0
                            ? 'text-[#A3432B]'
                            : 'text-[#7B739B]'
                        }
                      >
                        {formatRupiah(evt.remaining_amount || 0)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          evt.status
                        )}`}
                      >
                        {evt.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-[#564B95] font-medium">
                      {evt.sales_pic || '-'}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEventToEdit(evt)
                            setIsModalOpen(true)
                          }}
                          title={t('events.edit')}
                          className="w-7 h-7 rounded-lg bg-[#F4F2FB] hover:bg-[#EAE5F7] text-[#564B95] flex items-center justify-center transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteEvent(evt.id, evt.client_name)
                          }
                          title={t('events.delete')}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Grand Total Row */}
              <tfoot>
                <tr className="bg-[#FAF9F6] border-t-2 border-[#DED9F4] font-bold text-[#322A5E]">
                  <td colSpan={6} className="py-3.5 px-4 text-right uppercase text-[11px] text-[#7B739B]">
                    {t('events.grandTotal')} ({filteredEvents.length}):
                  </td>
                  <td className="py-3.5 px-3 text-right text-sm text-[#322A5E]">
                    {formatRupiah(metrics.totalOmset)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-sm text-[#2F7B56]">
                    {formatRupiah(metrics.totalTransfer)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-sm text-[#A3432B]">
                    {formatRupiah(metrics.totalPiutang)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      <EventModal
        key={eventToEdit?.id ?? (isModalOpen ? 'new-event' : 'closed')}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEventToEdit(null)
        }}
        onSuccess={() => {
          refreshEvents()
        }}
        eventToEdit={eventToEdit}
      />
    </div>
  )
}