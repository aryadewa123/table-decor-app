import React from 'react'

export function HomeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function CalendarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

export function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function ChartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

export function BoxIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  )
}

export function PlusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function DocumentIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
      <path d="M533.5 9.7c-19.4-6.5-40.4-6.8-59.9-1.8-23.1 6.2-44.3 22.9-55.8 45.3-26.4 53.3-10.2 116.4 31.9 144.9-13.2 58.9-55.4 104.2-113.2 113.3-23.3 3.5-46.5-6.4-58.9-25.2-12.7-19.1-8.1-42.8 8.4-56.1 18.8-15.9 39.3-21.9 61.6-20.5 23.4 1.7 45.3 9.9 61.6 24.5 12.1 10.7 15.6 25.5 10.2 38.8-26.8 64.1-80.6 85.9-138.9 72.7-11.3-2.7-22.1-6.2-31.8-9.9-20.8-7.6-42.2-11.3-63.7-11.3-20.9 0-41.3 3.1-58.9 8.8-29.6 9.8-52.2 32.3-55.7 59.5-6.1 42.7 17.4 81.4 55.2 103.5-24.6 78.9-15.1 196.9 38.4 253.7 29.2 20.3 62.6 32.4 95.6 32.6 25.5 0.1 50.8-3.5 74.2-9.9 24.5-6.7 47.5-19.5 68.8-37.5 17.6-15.3 31.6-33.3 45.5-51.7 14.9-18.2 26.3-38.1 34.1-59.1 4.3-11.6 5.6-24 5.8-36.7 1.3-64.6-20.8-125.1-63.3-176.4-36.6-45.9-82.9-79.1-135.1-94.1z" fill="#4285F4" />
    </svg>
  )
}
