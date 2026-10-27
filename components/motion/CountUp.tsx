'use client'

import { useEffect, useState } from 'react'
import { animate } from 'motion/react'

interface CountUpProps {
  value: number
  format?: (value: number) => string
  duration?: number
}

export default function CountUp({
  value,
  format = (v) => Math.round(v).toLocaleString('id-ID'),
  duration = 1.2,
}: CountUpProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const controls = animate(0, value, {
      duration: reduceMotion ? 0 : duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest),
    })

    return () => controls.stop()
  }, [value, duration])

  return <>{format(display)}</>
}
