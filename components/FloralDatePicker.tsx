'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { AppLanguage } from '@/lib/i18n'

interface FloralDatePickerProps {
  id: string
  value: string
  onChange: (value: string) => void
  language: AppLanguage
  labelledBy: string
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function toDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getLocalDateValue(date: Date): string {
  return toDateValue(date)
}

export default function FloralDatePicker({
  id,
  value,
  onChange,
  language,
  labelledBy,
}: FloralDatePickerProps) {
  const today = new Date()
  const selectedDate = parseLocalDate(value)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = selectedDate ?? today
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const calendarId = useId()
  const locale = language === 'en' ? 'en-US' : 'id-ID'
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    .format(visibleMonth)
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(2024, 0, 1 + index)
      return formatter.format(day)
    })
  }, [locale])
  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const startOffset = (firstOfMonth.getDay() + 6) % 7
    const firstDay = new Date(
      firstOfMonth.getFullYear(),
      firstOfMonth.getMonth(),
      1 - startOffset
    )
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + index)
      return {
        date,
        value: toDateValue(date),
        inCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
      }
    })
  }, [visibleMonth])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)

  const moveMonth = (offset: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1))
  }

  const chooseDate = (date: Date) => {
    onChange(toDateValue(date))
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="floral-date-picker">
      <button
        id={id}
        type="button"
        aria-labelledby={labelledBy}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={calendarId}
        onClick={() => {
          const date = parseLocalDate(value) ?? new Date()
          setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
          setIsOpen((open) => !open)
        }}
        className={`floral-date-picker__trigger${isOpen ? ' is-open' : ''}`}
      >
        <span className="floral-date-picker__value">
          {selectedDate ? formatDate(selectedDate) : language === 'en' ? 'Choose a date' : 'Pilih tanggal'}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-[#746394]"
        >
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M16 3v4M8 3v4M3 10h18" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      </button>

      {isOpen && (
        <div id={calendarId} role="dialog" aria-label={monthLabel} className="floral-date-picker__calendar">
          <div className="floral-date-picker__header">
            <button
              type="button"
              aria-label={language === 'en' ? 'Previous month' : 'Bulan sebelumnya'}
              onClick={() => moveMonth(-1)}
              className="floral-date-picker__month-button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="floral-date-picker__month">{monthLabel}</span>
            <button
              type="button"
              aria-label={language === 'en' ? 'Next month' : 'Bulan berikutnya'}
              onClick={() => moveMonth(1)}
              className="floral-date-picker__month-button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
          <div role="grid" aria-label={monthLabel} className="floral-date-picker__grid">
            {weekdayLabels.map((weekday, index) => (
              <span key={`${weekday}-${index}`} role="columnheader" className="floral-date-picker__weekday">
                {weekday}
              </span>
            ))}
            {calendarDays.map(({ date, value: dayValue, inCurrentMonth }) => {
              const isSelected = dayValue === value
              const isToday = dayValue === toDateValue(today)
              return (
                <button
                  key={dayValue}
                  type="button"
                  role="gridcell"
                  aria-label={formatDate(date)}
                  aria-selected={isSelected}
                  onClick={() => chooseDate(date)}
                  className={`floral-date-picker__day${inCurrentMonth ? '' : ' is-outside'}${
                    isSelected ? ' is-selected' : ''
                  }${isToday ? ' is-today' : ''}`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          <div className="floral-date-picker__footer">
            <span>{language === 'en' ? 'Selected date' : 'Tanggal terpilih'}</span>
            <button type="button" onClick={() => chooseDate(today)}>
              {language === 'en' ? 'Today' : 'Hari ini'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
