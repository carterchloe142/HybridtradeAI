
'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function TrustPilotWidget() {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // If window.Trustpilot is available, load the widget
    if (mounted && typeof window !== 'undefined' && (window as any).Trustpilot && ref.current) {
      (window as any).Trustpilot.loadFromElement(ref.current, true)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div 
      ref={ref}
      className="trustpilot-widget" 
      data-locale="en-US" 
      data-template-id="56278e9abfbbba0bdcd568bc" 
      data-businessunit-id="69a6ea0242d8a24e56af170a" 
      data-style-height="52px" 
      data-style-width="100%" 
      data-token="002eaae0-bd73-49d0-bae7-cfb611812b42"
    >
      <a href="https://www.trustpilot.com/review/hybridtradeai.com" target="_blank" rel="noopener noreferrer">Trustpilot</a>
    </div>
  )
}
