"use client";

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

type Size = 'sm' | 'md';

const sizeMap: Record<Size, string> = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
};

export default function ThemeToggle({ size = 'md' }: { size?: Size }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-full border border-border bg-secondary text-foreground transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary ${sizeMap[size]}`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

