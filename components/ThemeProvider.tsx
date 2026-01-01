"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'htai:theme';

function getInitialTheme(): Theme {
  // Always return 'dark' for SSR to match initial client render
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  // Default to dark theme
  return 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with 'dark' to match SSR, then hydrate from localStorage
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Hydrate theme from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(THEME_STORAGE_KEY) : null;
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
    } else {
      // Check system preference if no stored theme
      if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      }
    } catch {}
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
          setThemeState(event.matches ? 'dark' : 'light');
        }
      } catch {}
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [mounted]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next: Theme) => setThemeState(next),
      toggleTheme: () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

