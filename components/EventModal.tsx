'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { EventRecord, PaymentStatus } from '@/lib/types'
import { AnimatePresence, motion } from 'motion/react'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  eventToEdit?: EventRecord | null
}

const COMMON_SALES_PICS = ['Ce Loren', 'Arsita', 'Lainnya']
const COMMON_DECOR_TYPES = [
  'Table Decor',
  'Table Decor + Backdrop',
  'Sweet 17th Table Decor',
  'Engagement Table Decor',
  'Birthday & Gathering',
  'Bridal Shower Decor',
  'Custom Theme Decor',
]

export default function EventModal({
  isOpen,
  onClose,
  onSuccess,
  eventToEdit,
}: EventModalProps) {
  const isEdit = Boolean(eventToEdit)

  const [dealingDate, setDealingDate] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [clientName, setClientName] = useState('')
  const [decorType, setDecorType] = useState('Table Decor')
  const [customDecorType, setCustomDecorType] = useState('')
  const [venue, setVenue] = useState('')
  const [totalAmount, setTotalAmount] = useState<number | ''>('')
  const [transferAmount, setTransferAmount] = useState<number | ''>('')
  const [status, setStatus] = useState<PaymentStatus>('DP')
  const [salesPic, setSalesPic] = useState('Ce Loren')
  const [customPic, setCustomPic] = useState('')
  const [chargeOvertime, setChargeOvertime] = useState<number | ''>(0)
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (eventToEdit) {
      setDealingDate(eventToEdit.dealing_date || '')
      setEventDate(eventToEdit.event_date || '')
      setClientName(eventToEdit.client_name || '')
      if (COMMON_DECOR_TYPES.includes(eventToEdit.decor_type)) {
        setDecorType(eventToEdit.decor_type)
        setCustomDecorType('')
      } else {
        setDecorType('Custom')
        setCustomDecorType(eventToEdit.decor_type)
      }
      setVenue(eventToEdit.venue || '')
      setTotalAmount(eventToEdit.total_amount ?? 0)
      setTransferAmount(eventToEdit.transfer_amount ?? 0)
      setStatus(eventToEdit.status || 'DP')
      if (COMMON_SALES_PICS.includes(eventToEdit.sales_pic || '')) {
        setSalesPic(eventToEdit.sales_pic || 'Ce Loren')
        setCustomPic('')
      } else {
        setSalesPic('Lainnya')
        setCustomPic(eventToEdit.sales_pic || '')
      }
      setChargeOvertime(eventToEdit.charge_overtime ?? 0)
      setNotes(eventToEdit.notes || '')
    } else {
      const today = new Date().toISOString().split('T')[0]
      setDealingDate(today)
      setEventDate(today)
      setClientName('')
      setDecorType('Table Decor')
      setCustomDecorType('')
      setVenue('')
      setTotalAmount('')
      setTransferAmount('')
      setStatus('DP')
      setSalesPic('Ce Loren')
      setCustomPic('')
      setChargeOvertime(0)
      setNotes('')
    }
    setError(null)
  }, [eventToEdit, isOpen])

  const numTotal = Number(totalAmount) || 0
  const numTransfer = Number(transferAmount) || 0
  const remaining = Math.max(0, numTotal - numTransfer)

  const handleTransferChange = (val: number | '') => {
    setTransferAmount(val)
    const numericVal = Number(val) || 0
    if (numTotal > 0 && numericVal >= numTotal) {
      setStatus('Lunas')
    } else if (numericVal > 0 && numericVal < numTotal) {
      setStatus('Kurang')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim() || !venue.trim() || totalAmount === '') {
      setError('Mohon lengkapi Nama Klien, Venue, dan Total Tagihan.')
      return
    }

    setSubmitting(true)
    setError(null)

    const finalDecorType =
      decorType === 'Custom' ? customDecorType.trim() || 'Custom' : decorType
    const finalPic =
      salesPic === 'Lainnya' ? customPic.trim() || null : salesPic

    const payload = {
      dealing_date: dealingDate,
      event_date: eventDate,
      client_name: clientName.trim(),
      decor_type: finalDecorType,
      venue: venue.trim(),
      total_amount: Number(totalAmount),
      transfer_amount: Number(transferAmount) || 0,
      status: status,
      sales_pic: finalPic,
      charge_overtime: Number(chargeOvertime) || 0,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    }

    try {
      if (isEdit && eventToEdit) {
        const { error: updateError } = await supabase
          .from('events')
          .update(payload)
          .eq('id', eventToEdit.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert([payload])

        if (insertError) throw insertError
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
      setError(`Gagal menyimpan: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
    {isOpen && (
    <motion.div
      key="event-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#322A5E]/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-3xl shadow-2xl border border-[#DED9F4] overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="p-6 bg-gradient-to-r from-[#F0EDF9] via-[#FAF9F6] to-[#FFFDF0] border-b border-[#DED9F4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B1A9DA]/25 border border-[#B1A9DA]/40 flex items-center justify-center text-xl">
              🌸
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#322A5E]">
                {isEdit ? 'Perbarui Rekap Deal Event' : 'Catat Rekap Deal Baru'}
              </h2>
              <p className="text-xs text-[#7B739B]">
                Pastikan data omset &amp; pembayaran tersimpan presisi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#7B739B] hover:text-[#322A5E] border border-[#DED9F4] flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }}
              transition={{ duration: 0.45 }}
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
            >
              <span>⚠️</span>
              <span className="flex-1">{error}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                Tanggal Dealing (Deal Date) *
              </label>
              <input
                type="date"
                value={dealingDate}
                onChange={(e) => setDealingDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                Tanggal Event Pelaksanaan *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                Nama Klien *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Contoh: Jessica & Michael, Ajeng, dll."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] placeholder-[#B5B0CC] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                Sales / PIC
              </label>
              <div className="flex gap-2">
                <select
                  value={salesPic}
                  onChange={(e) => setSalesPic(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                >
                  {COMMON_SALES_PICS.map((pic) => (
                    <option key={pic} value={pic}>
                      {pic}
                    </option>
                  ))}
                </select>
                {salesPic === 'Lainnya' && (
                  <input
                    type="text"
                    value={customPic}
                    onChange={(e) => setCustomPic(e.target.value)}
                    placeholder="Nama PIC..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                Tipe Dekorasi
              </label>
              <select
                value={decorType}
                onChange={(e) => setDecorType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              >
                {COMMON_DECOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option value="Custom">-- Tulis Custom --</option>
              </select>
              {decorType === 'Custom' && (
                <input
                  type="text"
                  value={customDecorType}
                  onChange={(e) => setCustomDecorType(e.target.value)}
                  placeholder="Spesifikasi jenis dekor..."
                  className="mt-2 w-full px-3.5 py-2 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                Venue / Lokasi Acara *
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Contoh: Palimanan, Hotel Majapahit, Rumah Klien"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] placeholder-[#B5B0CC] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F3FB] to-[#FFFDF2] border border-[#DED9F4] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#564B95]">
                💰 Finansial &amp; Rekap Pembayaran
              </span>
              <span className="text-xs text-[#7B739B]">Validasi Nilai Numerik</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#6D658E] mb-1">
                  Total Tagihan (Rp) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={totalAmount}
                  onChange={(e) =>
                    setTotalAmount(e.target.value ? Number(e.target.value) : '')
                  }
                  placeholder="0"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DED9F4] text-sm font-semibold text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6D658E] mb-1">
                  Sudah Ditransfer / DP (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={transferAmount}
                  onChange={(e) =>
                    handleTransferChange(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DED9F4] text-sm font-semibold text-[#2F7B56] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6D658E] mb-1">
                  Sisa Piutang (Kurang)
                </label>
                <div className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border border-[#FAE489] text-sm font-bold text-[#A3432B] flex items-center justify-between">
                  <span>Rp {remaining.toLocaleString('id-ID')}</span>
                  {remaining === 0 && numTotal > 0 && (
                    <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                      LUNAS
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#DED9F4]/60">
              <span className="text-xs font-medium text-[#6D658E]">
                Status Pembayaran:
              </span>
              {(['DP', 'Lunas', 'Kurang', 'Batal'] as PaymentStatus[]).map((s) => (
                <motion.button
                  type="button"
                  key={s}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    status === s
                      ? s === 'Lunas'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/40'
                        : s === 'DP'
                        ? 'bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-400/40'
                        : s === 'Kurang'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-400/40'
                        : 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-400/40'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                Charge Overtime (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={chargeOvertime}
                onChange={(e) =>
                  setChargeOvertime(
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                Catatan Khusus / Request Klien
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tema Rustic Lavender, meja bulat 10 pax, lighting warm"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] placeholder-[#B5B0CC] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#DED9F4] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#6D658E] hover:bg-[#F0EDF9] border border-[#DED9F4] transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] active:scale-95 transition-all shadow-md shadow-[#FFEDA8]/40 border border-[#FAE489] disabled:opacity-50"
            >
              {submitting ? (
                <span>Menyimpan...</span>
              ) : (
                <span>{isEdit ? 'Simpan Perubahan' : '✓ Simpan Rekap Event'}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  )
}