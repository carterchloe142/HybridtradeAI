const GA_MEASUREMENT_ID = 'G-T2MHCT2WQP'

type GAEventParams = Record<string, any>

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

function getGtag() {
  if (typeof window === 'undefined') return null
  if (typeof window.gtag === 'function') return window.gtag
  if (!window.dataLayer) return null
  function gtagFn(...args: any[]) {
    window.dataLayer?.push(args)
  }
  window.gtag = gtagFn
  return gtagFn
}

export function trackEvent(name: string, params?: GAEventParams) {
  const gtag = getGtag()
  if (!gtag) return
  gtag('event', name, params || {})
}

export function trackSignup(method: string) {
  trackEvent('sign_up', { method, send_to: GA_MEASUREMENT_ID })
}

export function trackLogin(method: string) {
  trackEvent('login', { method, send_to: GA_MEASUREMENT_ID })
}

export function trackPlanSelected(planId: string, amount: number) {
  trackEvent('select_plan', { plan_id: planId, value: amount, currency: 'USD', send_to: GA_MEASUREMENT_ID })
}

