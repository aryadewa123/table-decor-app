'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EventRecord, PaymentStatus } from '@/lib/types'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'

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
  const { user } = useAuth()
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(user?.language ?? 'id', key)

  const today = new Date().toISOString().split('T')[0]
  const [dealingDate, setDealingDate] = useState(eventToEdit?.dealing_date || today)
  const [eventDate, setEventDate] = useState(eventToEdit?.event_date || today)
  const [clientName, setClientName] = useState(eventToEdit?.client_name || '')
  const [decorType, setDecorType] = useState(
    eventToEdit && !COMMON_DECOR_TYPES.includes(eventToEdit.decor_type)
      ? 'Custom'
      : eventToEdit?.decor_type || 'Table Decor'
  )
  const [customDecorType, setCustomDecorType] = useState(
    eventToEdit && !COMMON_DECOR_TYPES.includes(eventToEdit.decor_type)
      ? eventToEdit.decor_type
      : ''
  )
  const [venue, setVenue] = useState(eventToEdit?.venue || '')
  const [totalAmount, setTotalAmount] = useState<number | ''>(
    eventToEdit?.total_amount ?? ''
  )
  const [transferAmount, setTransferAmount] = useState<number | ''>(
    eventToEdit?.transfer_amount ?? ''
  )
  const [status, setStatus] = useState<PaymentStatus>(eventToEdit?.status || 'DP')
  const [salesPic, setSalesPic] = useState(
    eventToEdit && !COMMON_SALES_PICS.includes(eventToEdit.sales_pic || '')
      ? 'Lainnya'
      : eventToEdit?.sales_pic || 'Ce Loren'
  )
  const [customPic, setCustomPic] = useState(
    eventToEdit && !COMMON_SALES_PICS.includes(eventToEdit.sales_pic || '')
      ? eventToEdit.sales_pic || ''
      : ''
  )
  const [chargeOvertime, setChargeOvertime] = useState<number | ''>(
    eventToEdit?.charge_overtime ?? 0
  )
  const [notes, setNotes] = useState(eventToEdit?.notes || '')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError(t('eventModal.fillRequired'))
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
                {isEdit ? t('eventModal.editTitle') : t('eventModal.newTitle')}
              </h2>
              <p className="text-xs text-[#7B739B]">
                {t('eventModal.subtitle')}
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
                {t('eventModal.dealDate')}
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
                {t('eventModal.eventDate')}
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
                {t('eventModal.client')}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Jessica & Michael, Ajeng"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] placeholder-[#B5B0CC] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                {t('eventModal.sales')}
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
                    placeholder={user?.language === 'en' ? 'Representative name' : 'Nama PIC...'}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                {t('eventModal.decor')}
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
                <option value="Custom">{t('eventModal.custom')}</option>
              </select>
              {decorType === 'Custom' && (
                <input
                  type="text"
                  value={customDecorType}
                  onChange={(e) => setCustomDecorType(e.target.value)}
                  placeholder={user?.language === 'en' ? 'Describe the decor type...' : 'Spesifikasi jenis dekor...'}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#564B95] mb-1.5 uppercase tracking-wider">
                {t('eventModal.venue')}
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Palimanan, Hotel Majapahit, client home"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DED9F4] text-sm text-[#322A5E] placeholder-[#B5B0CC] focus:outline-none focus:ring-2 focus:ring-[#B1A9DA]"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F3FB] to-[#FFFDF2] border border-[#DED9F4] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#564B95]">
                💰 {t('eventModal.financial')}
              </span>
              <span className="text-xs text-[#7B739B]">{t('eventModal.numeric')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#6D658E] mb-1">
                  {t('eventModal.total')}
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
                  {t('eventModal.transfer')}
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
                  {t('eventModal.remaining')}
                </label>
                <div className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border border-[#FAE489] text-sm font-bold text-[#A3432B] flex items-center justify-between">
                  <span>Rp {remaining.toLocaleString('id-ID')}</span>
                  {remaining === 0 && numTotal > 0 && (
                    <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                      {t('eventModal.paid')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#DED9F4]/60">
              <span className="text-xs font-medium text-[#6D658E]">
                {t('eventModal.paymentStatus')}:
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
                {t('eventModal.overtime')}
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
                {t('eventModal.notes')}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Rustic lavender theme, round table for 10, warm lighting"
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
              {t('eventModal.cancel')}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#322A5E] bg-[#FFEDA8] hover:bg-[#FFE892] active:scale-95 transition-all shadow-md shadow-[#FFEDA8]/40 border border-[#FAE489] disabled:opacity-50"
            >
              {submitting ? (
                <span>{t('eventModal.saving')}</span>
              ) : (
                <span>{isEdit ? t('eventModal.saveChanges') : t('eventModal.saveNew')}</span>
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