'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    _smartsupp?: { key?: string } & Record<string, unknown>
    smartsupp?: any
  }
}

export default function SmartsuppWidget() {
  const key = process.env.NEXT_PUBLIC_SMARTSUPP_KEY

  useEffect(() => {
    if (!key) return
    if (typeof window === 'undefined') return

    const existingKey = window._smartsupp?.key
    if (existingKey === key) return

    window._smartsupp = window._smartsupp || {}
    window._smartsupp.key = key

    const alreadyLoaded = Array.from(document.getElementsByTagName('script')).some((s) => {
      const src = s.getAttribute('src') || ''
      return src.includes('smartsuppchat.com/loader.js')
    })
    if (alreadyLoaded) return

    const firstScript = document.getElementsByTagName('script')[0]
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.charset = 'utf-8'
    script.async = true
    script.src = 'https://www.smartsuppchat.com/loader.js?'
    if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript)
    else document.head.appendChild(script)
  }, [key])

  return null
}

