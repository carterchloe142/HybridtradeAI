'use client'

import { useMemo, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/hooks/useI18n'
import { supportedLocales } from '@/src/utils/locales'

function tzDefault() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export default function SettingsPage() {
  const { preference, setMode, setManualTheme, setSchedule, theme } = useTheme()
  const { lang, setLang, t } = useI18n()

  const [start, setStart] = useState(preference.schedule?.startLocalTime || '19:00')
  const [end, setEnd] = useState(preference.schedule?.endLocalTime || '07:00')
  const [timeZone, setTimeZone] = useState(preference.schedule?.timeZone || tzDefault())

  const locales = useMemo(() => supportedLocales, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container-xl px-4 py-8">
        <h1 className="text-2xl font-bold">{t('settings_title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('settings_subtitle')}</p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6">
            <h2 className="text-sm font-semibold">{t('theme_label')}</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={() => setMode('device')} className={`rounded-xl border px-4 py-3 text-xs ${preference.mode === 'device' ? 'border-primary text-primary' : 'border-border text-foreground hover:bg-muted/20'}`}>
                {t('theme_mode_device')}
              </button>
              <button onClick={() => setMode('time')} className={`rounded-xl border px-4 py-3 text-xs ${preference.mode === 'time' ? 'border-primary text-primary' : 'border-border text-foreground hover:bg-muted/20'}`}>
                {t('theme_mode_time')}
              </button>
              <button onClick={() => setMode('manual')} className={`rounded-xl border px-4 py-3 text-xs ${preference.mode === 'manual' ? 'border-primary text-primary' : 'border-border text-foreground hover:bg-muted/20'}`}>
                {t('theme_mode_manual')}
              </button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">{t('current')}: {theme}</div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setManualTheme('light')} className={`rounded-xl border px-4 py-3 text-xs ${preference.mode === 'manual' && theme === 'light' ? 'border-primary text-primary' : 'border-border text-foreground hover:bg-muted/20'}`}>
                {t('theme_light')}
              </button>
              <button onClick={() => setManualTheme('dark')} className={`rounded-xl border px-4 py-3 text-xs ${preference.mode === 'manual' && theme === 'dark' ? 'border-primary text-primary' : 'border-border text-foreground hover:bg-muted/20'}`}>
                {t('theme_dark')}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-border/40 bg-muted/10 p-4">
              <div className="text-xs font-semibold">{t('time_schedule')}</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-[11px] text-muted-foreground">{t('start')}</div>
                  <input value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs" placeholder="19:00" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">{t('end')}</div>
                  <input value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs" placeholder="07:00" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">{t('time_zone')}</div>
                  <input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs" placeholder="UTC" />
                </div>
              </div>
              <button
                onClick={() => setSchedule({ startLocalTime: start, endLocalTime: end, timeZone })}
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                {t('save')}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6">
            <h2 className="text-sm font-semibold">{t('language_label')}</h2>
            <p className="mt-2 text-xs text-muted-foreground">{t('select_language_hint')}</p>
            <div className="mt-4">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs">
                {locales.map((l) => (
                  <option key={l.locale} value={l.locale}>{l.label} ({l.locale})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
