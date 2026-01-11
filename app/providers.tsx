"use client";

import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/hooks/useI18n';
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ 
      fetcher: (url: string) => fetch(url).then((r) => r.json()), 
      errorRetryCount: 3, 
      errorRetryInterval: 3000, 
      shouldRetryOnError: true 
    }}>
      <ThemeProvider>
        <I18nProvider>{children}</I18nProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}

