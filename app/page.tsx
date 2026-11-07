'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import TopHeader from '@/components/TopHeader'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/lib/auth-context'
import { translate } from '@/lib/i18n'
import { useToday } from '@/lib/use-today'
import { supabase } from '@/lib/supabase'
import type { EventRecord } from '@/lib/types'

export default function Home() {
  const { user } = useAuth()
  const language = user?.language ?? 'id'
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key)
  const today = useToday()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [showAllTimeRevenue, setShowAllTimeRevenue] = useState(false)

  useEffect(() => {
    let active = true

    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (!active) return

      if (error) {
        console.error('Unable to load dashboard events:', error)
        setLoadError(error.message)
      } else {
        setEvents(data ?? [])
        setLoadError(null)
      }

      setLoading(false)
    }

    fetchEvents()
    return () => {
      active = false
    }
  }, [reloadKey])

  const dashboard = useMemo(() => {
    const activeEvents = events.filter((event) => event.status !== 'Batal')
    const upcomingEvents = activeEvents.filter((event) => event.event_date >= today)
    const todayEvents = upcomingEvents.filter((event) => event.event_date === today)
    const totalRevenue = activeEvents.reduce(
      (sum, event) => sum + (Number(event.total_amount) || 0),
      0
    )
    const monthKey = today.slice(0, 7)
    const monthlyRevenue = activeEvents.reduce(
      (sum, event) =>
        monthKey && event.dealing_date?.startsWith(monthKey)
          ? sum + (Number(event.total_amount) || 0)
          : sum,
      0
    )
    const outstanding = activeEvents.reduce(
      (sum, event) => sum + Math.max(0, Number(event.remaining_amount) || 0),
      0
    )

    return {
      activeCount: activeEvents.length,
      upcomingCount: upcomingEvents.length,
      todayEvents,
      upcomingEvents: upcomingEvents.slice(0, 4),
      totalRevenue,
      monthlyRevenue,
      outstanding,
    }
  }, [events, today])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(language === 'en' ? 'en-US' : 'id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value)

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`))

  const formatToday = () =>
    today
      ? new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(`${today}T00:00:00`))
      : ''

  const statusLabel = (status: EventRecord['status']) => {
    if (status === 'Lunas') return t('events.paid')
    if (status === 'DP') return t('events.downPayment')
    if (status === 'Kurang') return t('events.balanceDue')
    return t('events.canceled')
  }

  return (
    <div className="min-h-dvh bg-transparent">
      <TopHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-32 sm:px-6 sm:py-9 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3D345F] via-[#51457F] to-[#766792] px-5 py-7 text-white shadow-[0_24px_60px_-32px_rgba(54,44,96,0.65)] sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full bg-[#F5DDAA]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 right-1/4 -z-10 h-72 w-72 rounded-full bg-[#D9C8F1]/15 blur-3xl" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium capitalize tracking-wide text-[#F4DDAF]">
                {formatToday()}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                {t('dashboard.greeting')}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                {t('dashboard.welcome')}
              </p>
            </div>
            <Link
              href="/recap"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/15 px-5 text-sm font-semibold text-white shadow-lg shadow-[#271F42]/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25"
            >
              <PlusIcon />
              {t('dashboard.newDeal')}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-5 text-xs text-white/75">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E8D19D] shadow-[0_0_12px_rgba(232,209,157,0.9)]" />
              {dashboard.todayEvents.length} {t('dashboard.todayCount')}
            </span>
            <Link href="/events" className="font-medium text-white transition hover:text-[#F4DDAF]">
              {t('dashboard.viewCalendar')}
              <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
        </section>

        <section aria-label={t('dashboard.overview')} className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          <FlipRevenueCard
            className="col-span-2 sm:col-span-1"
            monthlyLabel={t('dashboard.monthlyRevenue')}
            monthlyValue={loading ? '—' : formatCurrency(dashboard.monthlyRevenue)}
            monthlyNote={t('dashboard.monthlyRevenueNote')}
            totalLabel={t('dashboard.totalRevenue')}
            totalValue={loading ? '—' : formatCurrency(dashboard.totalRevenue)}
            totalNote={t('dashboard.totalRevenueNote')}
            showTotal={showAllTimeRevenue}
            onFlip={() => setShowAllTimeRevenue((showTotal) => !showTotal)}
          />
          <MetricCard
            label={t('dashboard.totalEvents')}
            value={loading ? '—' : dashboard.activeCount.toLocaleString(language === 'en' ? 'en-US' : 'id-ID')}
            note={t('dashboard.totalEventsNote')}
            icon={<CalendarIcon />}
            accent="violet"
          />
          <MetricCard
            label={t('dashboard.outstanding')}
            value={loading ? '—' : formatCurrency(dashboard.outstanding)}
            note={t('dashboard.outstandingNote')}
            icon={<ReceiptIcon />}
            accent="rose"
          />
        </section>

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B829A]">
                {t('dashboard.scheduleEyebrow')}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#322A5E] sm:text-[28px]">
                {t('dashboard.upcomingTitle')}
              </h2>
            </div>
            <Link
              href="/events"
              className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-[#5B4E8D] transition hover:bg-[#F0EDF9] hover:text-[#322A5E]"
            >
              {t('dashboard.allEvents')}
              <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>

          {loadError ? (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
              <p className="font-semibold">{t('dashboard.loadError')}</p>
              <p className="mt-1 break-words text-xs">{loadError}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setReloadKey((key) => key + 1)
                }}
                className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-800 shadow-sm transition hover:bg-rose-100"
              >
                {t('dashboard.tryAgain')}
              </button>
            </div>
          ) : loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl border border-[#E8E3DB] bg-white/70" />
              ))}
            </div>
          ) : dashboard.upcomingEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D8D1E4] bg-white/65 px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EDF9] text-[#5B4E8D]">
                <CalendarIcon />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-[#322A5E]">
                {t('dashboard.emptyTitle')}
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#777386]">
                {t('dashboard.emptyDescription')}
              </p>
              <Link
                href="/recap"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#4A3E78] px-4 text-sm font-semibold text-white transition hover:bg-[#372D60]"
              >
                {t('dashboard.newDeal')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {dashboard.upcomingEvents.map((event) => {
                const isToday = event.event_date === today
                return (
                  <article
                    key={event.id}
                    className="group rounded-2xl border border-[#E8E3DB] bg-white/90 p-4 shadow-[0_8px_24px_-20px_rgba(54,44,96,0.5)] transition duration-200 hover:-translate-y-0.5 hover:border-[#CFC5E2] hover:shadow-[0_18px_34px_-24px_rgba(54,44,96,0.4)] sm:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex w-[58px] shrink-0 flex-col items-center rounded-xl px-2 py-2.5 ${isToday ? 'bg-[#51457F] text-white' : 'bg-[#F4F1F8] text-[#51457F]'}`}>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-75">
                          {new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
                            month: 'short',
                          }).format(new Date(`${event.event_date}T00:00:00`))}
                        </span>
                        <span className="mt-0.5 font-serif text-2xl font-semibold leading-none">
                          {new Date(`${event.event_date}T00:00:00`).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold text-[#322A5E]">
                            {event.client_name}
                          </h3>
                          {isToday && (
                            <span className="rounded-full bg-[#F8EBCB] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#80652E]">
                              {t('dashboard.today')}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-[#777386]">
                          {event.decor_type} <span className="px-1 text-[#B9B2C4]">·</span> {event.venue || t('dashboard.venuePending')}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[#716B7E]">
                            {formatDate(event.event_date)}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${event.status === 'Lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#F4F1F8] text-[#5B4E8D]'}`}>
                            {statusLabel(event.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
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

function MetricCard({
  label,
  value,
  note,
  icon,
  accent,
  className = '',
}: {
  label: string
  value: string
  note: string
  icon: ReactNode
  accent: 'violet' | 'gold' | 'rose'
  className?: string
}) {
  const accents = {
    violet: 'bg-[#F0EDF9] text-[#5B4E8D]',
    gold: 'bg-[#FBF4E2] text-[#92733A]',
    rose: 'bg-[#F9EBEA] text-[#A35D57]',
  }

  return (
    <article className={`rounded-2xl border border-[#E8E3DB] bg-white/90 p-4 shadow-[0_8px_24px_-20px_rgba(54,44,96,0.45)] sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#777386]">{label}</p>
          <p className="mt-2 truncate text-xl font-semibold tracking-tight text-[#322A5E] sm:mt-3 sm:text-[28px]">
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${accents[accent]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-2 border-t border-[#F0EDF0] pt-2 text-[10px] leading-4 text-[#898493] sm:mt-3 sm:pt-3 sm:text-[11px] sm:leading-5">
        {note}
      </p>
    </article>
  )
}

function FlipRevenueCard({
  className = '',
  monthlyLabel,
  monthlyValue,
  monthlyNote,
  totalLabel,
  totalValue,
  totalNote,
  showTotal,
  onFlip,
}: {
  className?: string
  monthlyLabel: string
  monthlyValue: string
  monthlyNote: string
  totalLabel: string
  totalValue: string
  totalNote: string
  showTotal: boolean
  onFlip: () => void
}) {
  const faces = [
    { label: monthlyLabel, value: monthlyValue, note: monthlyNote },
    { label: totalLabel, value: totalValue, note: totalNote },
  ]

  return (
    <article className={`dashboard-metric-flip ${className}`}>
      <button
        type="button"
        aria-pressed={showTotal}
        aria-label={`${showTotal ? totalLabel : monthlyLabel}. ${showTotal ? totalNote : monthlyNote}.`}
        onClick={onFlip}
        className={`dashboard-metric-flip__inner${showTotal ? ' is-flipped' : ''}`}
      >
        {faces.map((face, index) => (
          <span
            key={face.label}
            aria-hidden={index !== Number(showTotal)}
            className={`dashboard-metric-flip__face${index === 1 ? ' dashboard-metric-flip__face--back' : ''}`}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-[#777386]">{face.label}</span>
                <span className="mt-2 block truncate text-xl font-semibold tracking-tight text-[#322A5E] sm:mt-3 sm:text-[28px]">
                  {face.value}
                </span>
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBF4E2] text-[#92733A] sm:h-11 sm:w-11">
                <RevenueIcon />
              </span>
            </span>
            <span className="mt-2 flex items-center justify-between gap-2 border-t border-[#F0EDF0] pt-2 text-[10px] leading-4 text-[#898493] sm:mt-3 sm:pt-3 sm:text-[11px] sm:leading-5">
              <span>{face.note}</span>
              <span className="shrink-0 rounded-full bg-[#FBF4E2] px-2 py-1 text-[9px] font-semibold text-[#80652E]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M20 7v5h-5M4 17v-5h5" />
                  <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
                </svg>
              </span>
            </span>
          </span>
        ))}
      </button>
    </article>
  )
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  )
}

function RevenueIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 2v20M17 6.5c-.7-1-2.2-1.5-4.5-1.5-2.5 0-4.5 1.2-4.5 3s1.6 2.7 4.5 3.2 4.5 1.4 4.5 3.3-1.8 3.5-5 3.5c-2.3 0-4.1-.7-5-2" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M5 3h14v18l-3.5-2-3.5 2-3.5-2L5 21z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  )
}
