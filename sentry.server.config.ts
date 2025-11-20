import * as Sentry from '@sentry/nextjs'

declare global {
  // eslint-disable-next-line no-var
  var __sentry_server_inited__: boolean | undefined
}

if (!globalThis.__sentry_server_inited__) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || undefined,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.2),
    environment: process.env.NODE_ENV,
    enabled: Boolean(process.env.SENTRY_DSN),
  })
  globalThis.__sentry_server_inited__ = true
}
