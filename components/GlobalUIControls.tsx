'use client'

import { Fragment, useMemo, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDown, Globe, Moon, Sun, Clock, Monitor } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/hooks/useI18n'
import { supportedLocales } from '@/src/utils/locales'

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

export default function GlobalUIControls() {
  const { preference, theme, setMode, setManualTheme } = useTheme()
  const { lang, setLang, t } = useI18n()
  const [q, setQ] = useState('')

  const localeItems = useMemo(() => {
    const query = q.trim().toLowerCase()
    const list = supportedLocales
    if (!query) return list
    return list.filter((x) => x.label.toLowerCase().includes(query) || x.locale.toLowerCase().includes(query))
  }, [q])

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2">
      <Menu as="div" className="relative">
        <Menu.Button className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-xl px-4 py-2 text-xs text-foreground shadow-lg hover:bg-card transition-colors">
          <Globe size={16} className="text-primary" />
          <span className="font-mono">{lang}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </Menu.Button>
        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
          <Menu.Items className="absolute right-0 mb-2 bottom-full w-72 origin-bottom-right rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl focus:outline-none overflow-hidden">
            <div className="p-3 border-b border-border/60">
              <div className="text-xs font-semibold text-foreground">{t('language_label')}</div>
              <input value={q} onChange={(e) => setQ(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('search_language')} />
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {localeItems.map((x) => {
                const active = x.locale === lang
                return (
                  <Menu.Item key={x.locale}>
                    {({ active: hover }) => (
                      <button
                        type="button"
                        onClick={() => setLang(x.locale)}
                        className={classNames(
                          'w-full text-left rounded-xl px-3 py-2 text-xs transition-colors',
                          hover ? 'bg-muted/40' : 'bg-transparent',
                          active ? 'text-primary' : 'text-foreground',
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate">{x.label}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{x.locale}</span>
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                )
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <Menu as="div" className="relative">
        <Menu.Button className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-xl px-4 py-2 text-xs text-foreground shadow-lg hover:bg-card transition-colors">
          {theme === 'dark' ? <Moon size={16} className="text-foreground" /> : <Sun size={16} className="text-foreground" />}
          <span className="capitalize">{preference.mode}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </Menu.Button>
        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
          <Menu.Items className="absolute right-0 mb-2 bottom-full w-64 origin-bottom-right rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl focus:outline-none overflow-hidden">
            <div className="p-3 border-b border-border/60">
              <div className="text-xs font-semibold text-foreground">{t('theme_label')}</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Menu.Item>
                  {({ active }) => (
                    <button type="button" onClick={() => setMode('device')} className={classNames('rounded-xl border px-2 py-2 text-[11px] transition-colors', active ? 'bg-muted/40' : 'bg-transparent', preference.mode === 'device' ? 'border-primary text-primary' : 'border-border text-foreground')}>
                      <Monitor size={14} className="mx-auto" />
                      <div className="mt-1">{t('theme_mode_device')}</div>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button type="button" onClick={() => setMode('time')} className={classNames('rounded-xl border px-2 py-2 text-[11px] transition-colors', active ? 'bg-muted/40' : 'bg-transparent', preference.mode === 'time' ? 'border-primary text-primary' : 'border-border text-foreground')}>
                      <Clock size={14} className="mx-auto" />
                      <div className="mt-1">{t('theme_mode_time')}</div>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button type="button" onClick={() => setMode('manual')} className={classNames('rounded-xl border px-2 py-2 text-[11px] transition-colors', active ? 'bg-muted/40' : 'bg-transparent', preference.mode === 'manual' ? 'border-primary text-primary' : 'border-border text-foreground')}>
                      {theme === 'dark' ? <Moon size={14} className="mx-auto" /> : <Sun size={14} className="mx-auto" />}
                      <div className="mt-1">{t('theme_mode_manual')}</div>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </div>
            <div className="p-3">
              <div className="text-[11px] text-muted-foreground">{t('current')}: {theme}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Menu.Item>
                  {({ active }) => (
                    <button type="button" onClick={() => setManualTheme('light')} className={classNames('rounded-xl border px-3 py-2 text-xs transition-colors', active ? 'bg-muted/40' : 'bg-transparent', theme === 'light' && preference.mode === 'manual' ? 'border-primary text-primary' : 'border-border text-foreground')}>
                      {t('theme_light')}
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button type="button" onClick={() => setManualTheme('dark')} className={classNames('rounded-xl border px-3 py-2 text-xs transition-colors', active ? 'bg-muted/40' : 'bg-transparent', theme === 'dark' && preference.mode === 'manual' ? 'border-primary text-primary' : 'border-border text-foreground')}>
                      {t('theme_dark')}
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground">Manual choice applies immediately. Time mode switches automatically at night.</div>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
