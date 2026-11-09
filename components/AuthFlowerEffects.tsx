'use client'

import { useEffect, useState } from 'react'

type AuthScene = 'login' | 'signup' | 'verify'

const loginFlowers = [
  { src: '/flowers/poppy-field.jpg', alt: 'Hamparan bunga berwarna pastel' },
  { src: '/flowers/wedding-bouquet.jpg', alt: 'Rangkaian bunga lembut berwarna pastel' },
  { src: '/flowers/table-flowers.jpg', alt: 'Rangkaian bunga dengan palet warna hangat' },
  { src: '/flowers/lavender-verification.jpg', alt: 'Hamparan bunga lavender' },
]

const sceneFlowers: Record<Exclude<AuthScene, 'login'>, (typeof loginFlowers)[number]> = {
  signup: loginFlowers[0],
  verify: loginFlowers[3],
}

export function AuthFlowerBackdrop({ scene }: { scene: AuthScene }) {
  const [photo, setPhoto] = useState(scene === 'login' ? loginFlowers[0] : sceneFlowers[scene])

  useEffect(() => {
    if (scene !== 'login') return

    let lastPhoto = ''
    try {
      lastPhoto = window.sessionStorage.getItem('yabes-auth-flower') ?? ''
    } catch {
      // Storage may be unavailable in private browsing; random selection still works.
    }

    const choices = loginFlowers.filter((flower) => flower.src !== lastPhoto)
    const nextPhoto = choices[Math.floor(Math.random() * choices.length)]
    const frame = window.requestAnimationFrame(() => setPhoto(nextPhoto))

    try {
      window.sessionStorage.setItem('yabes-auth-flower', nextPhoto.src)
    } catch {
      // The selected background remains available for this page view.
    }

    return () => window.cancelAnimationFrame(frame)
  }, [scene])

  return (
    <>
      <div
        key={photo.src}
        role="img"
        aria-label={photo.alt}
        className={`auth-flower-photo auth-flower-photo--${scene}`}
        style={{ backgroundImage: `url("${photo.src}")` }}
      />
      <div className={`auth-flower-wash auth-flower-wash--${scene}`} />
      <div className={`auth-flower-glow auth-flower-glow--one auth-flower-glow--${scene}`} />
      <div className={`auth-flower-glow auth-flower-glow--two auth-flower-glow--${scene}`} />
      {scene === 'login' && (
        <div className="auth-flower-petals" aria-hidden="true">
          {Array.from({ length: 14 }, (_, index) => (
            <span key={index} className={`auth-sakura-petal auth-sakura-petal--${index + 1}`} />
          ))}
        </div>
      )}
    </>
  )
}

export function AuthInteractionEffects() {
  useEffect(() => {
    const scene = document.querySelector<HTMLElement>('[data-auth-interaction-root]')
    const overlay = document.createElement('div')
    overlay.className = 'auth-interaction-overlay'
    overlay.setAttribute('aria-hidden', 'true')
    document.body.append(overlay)

    const timers = new Set<number>()

    const addEffect = (event: Event, keyboard = false) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const control = target.closest<HTMLElement>(
        'input, textarea, select, button, a[href], [role="combobox"]'
      )
      if (!control || control.matches(':disabled') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const rect = control.getBoundingClientRect()
      const pointer = event instanceof PointerEvent
      const x = pointer && !keyboard ? event.clientX : rect.left + rect.width / 2
      const y = pointer && !keyboard ? event.clientY : rect.top + rect.height / 2
      const isButton = control.matches('button, a[href], [role="combobox"]')
      const effect = document.createElement('span')
      effect.className = `auth-interaction-burst ${
        isButton ? 'auth-interaction-burst--flower' : 'auth-interaction-burst--ripple'
      }`
      effect.style.left = `${x}px`
      effect.style.top = `${y}px`

      if (isButton) {
        const glow = document.createElement('span')
        glow.className = 'auth-interaction-glow'
        effect.append(glow)
        for (let index = 0; index < 7; index += 1) {
          const petal = document.createElement('span')
          petal.className = 'auth-interaction-petal'
          petal.style.setProperty('--petal-angle', `${index * (360 / 7)}deg`)
          effect.append(petal)
        }
      } else {
        for (let index = 0; index < 3; index += 1) {
          const ring = document.createElement('span')
          ring.className = 'auth-interaction-ripple'
          ring.style.setProperty('--ripple-delay', `${index * 100}ms`)
          effect.append(ring)
        }
      }

      overlay.append(effect)
      const timer = window.setTimeout(() => {
        effect.remove()
        timers.delete(timer)
      }, 1100)
      timers.add(timer)
    }

    const handlePointerDown = (event: PointerEvent) => addEffect(event)
    const handleClick = (event: MouseEvent) => {
      if (event.detail === 0) addEffect(event, true)
    }

    scene?.addEventListener('pointerdown', handlePointerDown)
    scene?.addEventListener('click', handleClick)

    return () => {
      scene?.removeEventListener('pointerdown', handlePointerDown)
      scene?.removeEventListener('click', handleClick)
      timers.forEach(window.clearTimeout)
      overlay.remove()
    }
  }, [])

  return null
}
