'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

function getTodaySnapshot(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getServerSnapshot(): string {
  return ''
}

export function useToday(): string {
  return useSyncExternalStore(subscribe, getTodaySnapshot, getServerSnapshot)
}
