declare module 'next-pwa' {
  import type { NextConfig } from 'next'
  function withPWA(config: {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    runtimeCaching?: unknown[]
  }): (config: NextConfig) => NextConfig
  export default withPWA
}