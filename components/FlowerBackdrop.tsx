'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const pageThemes: Record<string, string> = {
  '/': 'home',
  '/events': 'events',
  '/follow-up': 'follow-up',
  '/sales': 'sales',
  '/analytics': 'analytics',
  '/recap': 'recap',
  '/inventory': 'inventory',
  '/settings': 'settings',
}

const pagePhotos: Record<string, string> = {
  '/': '/flowers/poppy-field.jpg',
  '/events': '/flowers/table-flowers.jpg',
  '/follow-up': '/flowers/wedding-bouquet.jpg',
  '/sales': '/flowers/poppy-field.jpg',
  '/analytics': '/flowers/wedding-bouquet.jpg',
  '/recap': '/flowers/table-flowers.jpg',
  '/inventory': '/flowers/poppy-field.jpg',
  '/settings': '/flowers/wedding-bouquet.jpg',
}

function getTheme(pathname: string) {
  if (pathname.startsWith('/login') || pathname === '/verify-token' || pathname.startsWith('/auth/')) {
    return 'hidden'
  }

  const route = Object.keys(pageThemes).find(
    (key) => key !== '/' && (pathname === key || pathname.startsWith(`${key}/`)),
  )

  return pageThemes[route ?? '/']
}

export default function FlowerBackdrop() {
  const pathname = usePathname()
  const theme = getTheme(pathname)
  const route = Object.keys(pagePhotos).find(
    (key) => key !== '/' && (pathname === key || pathname.startsWith(`${key}/`)),
  ) ?? '/'
  const photo = pagePhotos[route]
  const currentPhoto = useRef(photo)
  const [previousPhoto, setPreviousPhoto] = useState<string | null>(null)
  const petals = Array.from({ length: 14 }, (_, index) => index + 1)

  useEffect(() => {
    if (currentPhoto.current === photo) return

    const previous = currentPhoto.current
    currentPhoto.current = photo
    setPreviousPhoto(previous)
    const timeout = window.setTimeout(() => setPreviousPhoto(null), 1600)

    return () => window.clearTimeout(timeout)
  }, [photo])

  return (
    <div className="flower-backdrop" data-theme={theme} aria-hidden="true">
      {previousPhoto && (
        <div
          className="flower-backdrop__photo flower-backdrop__photo--leaving"
          style={{ backgroundImage: `url("${previousPhoto}")` }}
        />
      )}
      <div
        className={`flower-backdrop__photo${previousPhoto ? ' flower-backdrop__photo--entering' : ''}`}
        style={{ backgroundImage: `url("${photo}")` }}
      />
      <div className="flower-backdrop__color-field">
        <div className="flower-backdrop__glow flower-backdrop__glow--one" />
        <div className="flower-backdrop__glow flower-backdrop__glow--two" />
        <div className="flower-backdrop__glow flower-backdrop__glow--three" />
      </div>
      <div className="flower-backdrop__petals">
        {petals.map((petal) => (
          <span
            key={petal}
            className={`flower-particle flower-particle--${petal}`}
          />
        ))}
      </div>
    </div>
  )
}
