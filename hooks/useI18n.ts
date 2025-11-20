import { useMemo, useState } from 'react';

type Dict = Record<string, Record<string, string>>;

const dictionary: Dict = {
  en: {
    headline: 'Invest Smarter with HybridTradeAI',
    subheadline: 'AI-powered hybrid trading, multi-currency investments, and weekly returns.',
    getStarted: 'Get Started',
    learnMore: 'Learn More'
  },
  es: {
    headline: 'Invierte de forma más inteligente con HybridTradeAI',
    subheadline: 'Trading híbrido con IA, inversiones multicurrency y retornos semanales.',
    getStarted: 'Comenzar',
    learnMore: 'Aprender más'
  },
  fr: {
    headline: 'Investissez plus intelligemment avec HybridTradeAI',
    subheadline: "Trading hybride IA, investissements multidevises et rendements hebdomadaires.",
    getStarted: 'Commencer',
    learnMore: 'En savoir plus'
  }
};

export function useI18n(defaultLang = 'en') {
  const [lang, setLang] = useState<'en' | 'es' | 'fr'>(defaultLang as any);
  const t = useMemo(() => dictionary[lang] ?? dictionary.en, [lang]);
  return { lang, setLang, t };
}
