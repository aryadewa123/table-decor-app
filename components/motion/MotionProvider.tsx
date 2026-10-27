'use client'

import { MotionConfig } from 'motion/react'

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  // reducedMotion="user" disables transform/layout motion for users who prefer reduced motion
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
