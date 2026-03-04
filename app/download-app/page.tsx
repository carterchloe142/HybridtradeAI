"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react'

export default function DownloadAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [apkUrl, setApkUrl] = useState<string | null>(null)
  const [apkAvailable, setApkAvailable] = useState<boolean | null>(null)
  const [apkSize, setApkSize] = useState<string | null>(null)
  const [apkCheckedAt, setApkCheckedAt] = useState<string | null>(null)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  useEffect(() => {
    const envUrl = process?.env?.NEXT_PUBLIC_ANDROID_APK_URL
    const fallbackUrl = '/app-release.apk'
    const url = envUrl && String(envUrl).trim() ? String(envUrl).trim() : fallbackUrl
    setApkUrl(url)
    try {
      const isExternal = /^https?:\/\//i.test(url)
      if (isExternal) {
        setApkAvailable(true)
        setApkSize(null)
        setApkCheckedAt(new Date().toLocaleString())
      } else {
        fetch(url, { method: 'HEAD' })
          .then((res) => {
            setApkAvailable(res.ok)
            const len = res.headers.get('Content-Length') || res.headers.get('content-length')
            if (len) {
              const n = Number(len)
              if (!isNaN(n) && n > 0) {
                const kb = n / 1024
                const mb = kb / 1024
                setApkSize(mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(0)} KB`)
              } else {
                setApkSize(`${len} bytes`)
              }
            }
            setApkCheckedAt(new Date().toLocaleString())
          })
          .catch(() => setApkAvailable(false))
      }
    } catch {
      setApkAvailable(false)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
        // Fallback or instructions if prompt not available (e.g. on iOS or already installed)
        alert("To install on iOS: Tap 'Share' -> 'Add to Home Screen'.\nTo install on Android: Tap 'Menu' -> 'Install App'.")
        return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
            <Smartphone size={40} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Download App
        </h1>
        <p className="text-muted-foreground mb-8">
          Get the full HybridTradeAI experience on your mobile device. Fast, secure, and always with you.
        </p>

        {isInstalled ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3 text-green-400 mb-6">
                <CheckCircle size={24} />
                <span className="font-medium">App is already installed</span>
            </div>
        ) : (
            <div className="space-y-4">
                <button 
                    onClick={handleInstallClick}
                    className="w-full py-4 px-6 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group"
                >
                    <Download size={20} className="group-hover:translate-y-1 transition-transform" />
                    Install App
                </button>
                
                {/* Android Download */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Android</h3>
                  {apkUrl && apkAvailable ? (
                    <a 
                      href={apkUrl} 
                      download
                      className="w-full py-4 px-6 bg-[#3DDC84]/10 border border-[#3DDC84]/20 text-[#3DDC84] font-medium rounded-xl hover:bg-[#3DDC84]/20 transition-all flex items-center justify-center gap-3"
                    >
                      <Smartphone size={20} />
                      Download APK
                    </a>
                  ) : (
                    <div className="space-y-2">
                      <button 
                        disabled
                        className="w-full py-4 px-6 bg-[#3DDC84]/5 border border-[#3DDC84]/10 text-[#3DDC84]/60 font-medium rounded-xl cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        <AlertTriangle size={20} />
                        APK not available
                      </button>
                      <p className="text-xs text-muted-foreground">
                        Upload app-release.apk to the public folder or set NEXT_PUBLIC_ANDROID_APK_URL to a hosted APK link.
                      </p>
                    </div>
                  )}
                  {(apkAvailable && apkCheckedAt) && (
                    <p className="text-xs text-muted-foreground">
                      {apkSize ? `Size: ${apkSize}` : 'Size: unknown'} • Checked: {apkCheckedAt}
                    </p>
                  )}
                </div>

                {/* iOS Download */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">iOS</h3>
                  <a 
                      href="#"
                      className="w-full py-4 px-6 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                      onClick={(e) => {
                        e.preventDefault()
                        alert("iOS App Store link coming soon! For now, please use the web version (PWA) by tapping 'Share' -> 'Add to Home Screen'.")
                      }}
                  >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.5 1.3 0 2.52.88 3.31.88.78 0 2.26-1.09 3.81-.92 1.54.09 2.7.63 3.43 1.69-3.11 1.87-2.6 6.49.53 7.82-.54 1.13-1.25 2.27-2.19 3.14zM13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.32.74-3.07 1.62-.68.79-1.26 1.95-1.11 3.07 1.17.09 2.37-.75 3.11-1.58z"/>
                      </svg>
                      Download on App Store
                  </a>
                </div>
            </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 text-left space-y-3">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-primary" />
                <p>Native-like performance with 60fps animations</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-primary" />
                <p>Real-time push notifications for trades</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-primary" />
                <p>Biometric security support</p>
            </div>
        </div>

      </motion.div>
    </div>
  )
}
