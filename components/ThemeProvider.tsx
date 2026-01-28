"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeMode = 'device' | 'time' | 'manual';

type ThemeSchedule = {
  startLocalTime: string;
  endLocalTime: string;
  timeZone: string;
};

type ThemePreference = {
  mode: ThemeMode;
  manualTheme?: Theme;
  schedule?: ThemeSchedule;
};

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  setMode: (mode: ThemeMode) => void;
  setManualTheme: (theme: Theme) => void;
  setSchedule: (schedule: ThemeSchedule) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'htai:theme:pref';

function defaultTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function parseTimeToMinutes(s: string) {
  const m = String(s || '').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function minutesInTimeZone(now: Date, timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(now);
    const hh = Number(parts.find((p) => p.type === 'hour')?.value || '0');
    const mm = Number(parts.find((p) => p.type === 'minute')?.value || '0');
    return hh * 60 + mm;
  } catch {
    return now.getHours() * 60 + now.getMinutes();
  }
}

function resolveThemeFromSchedule(now: Date, schedule: ThemeSchedule): Theme {
  const start = parseTimeToMinutes(schedule.startLocalTime);
  const end = parseTimeToMinutes(schedule.endLocalTime);
  if (start == null || end == null) return 'dark';
  const cur = minutesInTimeZone(now, schedule.timeZone);

  if (start === end) return 'dark';
  if (start < end) {
    return cur >= start && cur < end ? 'dark' : 'light';
  }
  return cur >= start || cur < end ? 'dark' : 'light';
}

function readStoredPreference(): ThemePreference | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const json = JSON.parse(raw);
    const mode = json?.mode;
    if (mode !== 'device' && mode !== 'time' && mode !== 'manual') return null;
    const manualTheme = json?.manualTheme === 'light' || json?.manualTheme === 'dark' ? json.manualTheme : undefined;
    const schedule = json?.schedule;
    const scheduleOk = schedule && typeof schedule.startLocalTime === 'string' && typeof schedule.endLocalTime === 'string' && typeof schedule.timeZone === 'string';
    return {
      mode,
      manualTheme,
      schedule: scheduleOk ? schedule : undefined,
    };
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.setAttribute('data-theme', theme);
}

function resolveTheme(pref: ThemePreference, prefersDark: boolean, now: Date): Theme {
  if (pref.mode === 'manual') return pref.manualTheme || 'dark';
  if (pref.mode === 'device') return prefersDark ? 'dark' : 'light';
  const sched = pref.schedule || { startLocalTime: '19:00', endLocalTime: '07:00', timeZone: defaultTimeZone() };
  return resolveThemeFromSchedule(now, sched);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [prefersDark, setPrefersDark] = useState(true);

  const [preference, setPreference] = useState<ThemePreference>({
    mode: 'device',
    schedule: { startLocalTime: '19:00', endLocalTime: '07:00', timeZone: defaultTimeZone() },
  });

  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setMounted(true);
    const stored = readStoredPreference();
    if (stored) setPreference((p) => ({ ...p, ...stored }));
    try {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      setPrefersDark(media.matches);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const next = resolveTheme(preference, prefersDark, new Date());
    setTheme(next);
  }, [mounted, preference, prefersDark]);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
  }, [mounted, theme]);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
    } catch {}
  }, [mounted, preference]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => setPrefersDark(Boolean(event.matches));
    try {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    } catch {
      return;
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (preference.mode !== 'time') return;
    const id = window.setInterval(() => {
      setTheme(resolveTheme(preference, prefersDark, new Date()));
    }, 30_000);
    return () => window.clearInterval(id);
  }, [mounted, preference, prefersDark]);

  const value = useMemo(
    () => ({
      theme,
      preference,
      setMode: (mode: ThemeMode) =>
        setPreference((p) => ({
          ...p,
          mode,
          manualTheme: mode === 'manual' ? p.manualTheme || theme : p.manualTheme,
          schedule:
            mode === 'time'
              ? p.schedule || { startLocalTime: '19:00', endLocalTime: '07:00', timeZone: defaultTimeZone() }
              : p.schedule,
        })),
      setManualTheme: (next: Theme) => setPreference((p) => ({ ...p, mode: 'manual', manualTheme: next })),
      setSchedule: (schedule: ThemeSchedule) => setPreference((p) => ({ ...p, mode: 'time', schedule })),
      toggleTheme: () => {
        setPreference((p) => {
          const current = resolveTheme(p, prefersDark, new Date());
          const next: Theme = current === 'dark' ? 'light' : 'dark';
          return { ...p, mode: 'manual', manualTheme: next };
        });
      },
    }),
    [theme, preference, prefersDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

