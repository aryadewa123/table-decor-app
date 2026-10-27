import { init } from '@sentry/nextjs'

SENTRY_DSN = process.env.SENTRY_DSN
SENTRY_ORG = process.env.SENTRY_ORG
SENTRY_PROJECT = process.env.SENTRY_PROJECT

if (SENTRY_DSN) {
  init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
  })
}
