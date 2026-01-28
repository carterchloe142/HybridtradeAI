export type LocaleInfo = { locale: string; label: string; dir: 'ltr' | 'rtl' }

export const supportedLocales: LocaleInfo[] = [
  { locale: 'en-US', label: 'English (US)', dir: 'ltr' },
  { locale: 'en-GB', label: 'English (UK)', dir: 'ltr' },
  { locale: 'en-NG', label: 'English (Nigeria)', dir: 'ltr' },
  { locale: 'en-ZA', label: 'English (South Africa)', dir: 'ltr' },
  { locale: 'es-ES', label: 'Español (España)', dir: 'ltr' },
  { locale: 'es-MX', label: 'Español (México)', dir: 'ltr' },
  { locale: 'fr-FR', label: 'Français (France)', dir: 'ltr' },
  { locale: 'fr-CA', label: 'Français (Canada)', dir: 'ltr' },
  { locale: 'de-DE', label: 'Deutsch (Deutschland)', dir: 'ltr' },
  { locale: 'it-IT', label: 'Italiano (Italia)', dir: 'ltr' },
  { locale: 'pt-BR', label: 'Português (Brasil)', dir: 'ltr' },
  { locale: 'pt-PT', label: 'Português (Portugal)', dir: 'ltr' },
  { locale: 'nl-NL', label: 'Nederlands (Nederland)', dir: 'ltr' },
  { locale: 'sv-SE', label: 'Svenska (Sverige)', dir: 'ltr' },
  { locale: 'no-NO', label: 'Norsk (Norge)', dir: 'ltr' },
  { locale: 'da-DK', label: 'Dansk (Danmark)', dir: 'ltr' },
  { locale: 'fi-FI', label: 'Suomi (Suomi)', dir: 'ltr' },
  { locale: 'pl-PL', label: 'Polski (Polska)', dir: 'ltr' },
  { locale: 'cs-CZ', label: 'Čeština (Česko)', dir: 'ltr' },
  { locale: 'sk-SK', label: 'Slovenčina (Slovensko)', dir: 'ltr' },
  { locale: 'hu-HU', label: 'Magyar (Magyarország)', dir: 'ltr' },
  { locale: 'ro-RO', label: 'Română (România)', dir: 'ltr' },
  { locale: 'bg-BG', label: 'Български (България)', dir: 'ltr' },
  { locale: 'el-GR', label: 'Ελληνικά (Ελλάδα)', dir: 'ltr' },
  { locale: 'tr-TR', label: 'Türkçe (Türkiye)', dir: 'ltr' },
  { locale: 'ru-RU', label: 'Русский (Россия)', dir: 'ltr' },
  { locale: 'uk-UA', label: 'Українська (Україна)', dir: 'ltr' },
  { locale: 'he-IL', label: 'עברית (ישראל)', dir: 'rtl' },
  { locale: 'ar-SA', label: 'العربية (السعودية)', dir: 'rtl' },
  { locale: 'fa-IR', label: 'فارسی (ایران)', dir: 'rtl' },
  { locale: 'ur-PK', label: 'اردو (پاکستان)', dir: 'rtl' },
  { locale: 'hi-IN', label: 'हिन्दी (भारत)', dir: 'ltr' },
  { locale: 'bn-BD', label: 'বাংলা (বাংলাদেশ)', dir: 'ltr' },
  { locale: 'ta-IN', label: 'தமிழ் (இந்தியா)', dir: 'ltr' },
  { locale: 'te-IN', label: 'తెలుగు (భారతదేశం)', dir: 'ltr' },
  { locale: 'ml-IN', label: 'മലയാളം (ഇന്ത്യ)', dir: 'ltr' },
  { locale: 'id-ID', label: 'Bahasa Indonesia (Indonesia)', dir: 'ltr' },
  { locale: 'ms-MY', label: 'Bahasa Melayu (Malaysia)', dir: 'ltr' },
  { locale: 'th-TH', label: 'ไทย (ประเทศไทย)', dir: 'ltr' },
  { locale: 'vi-VN', label: 'Tiếng Việt (Việt Nam)', dir: 'ltr' },
  { locale: 'fil-PH', label: 'Filipino (Pilipinas)', dir: 'ltr' },
  { locale: 'sw-KE', label: 'Kiswahili (Kenya)', dir: 'ltr' },
  { locale: 'am-ET', label: 'አማርኛ (ኢትዮጵያ)', dir: 'ltr' },
  { locale: 'af-ZA', label: 'Afrikaans (Suid-Afrika)', dir: 'ltr' },
  { locale: 'zu-ZA', label: 'isiZulu (South Africa)', dir: 'ltr' },
  { locale: 'zh-CN', label: '中文（简体）', dir: 'ltr' },
  { locale: 'zh-TW', label: '中文（繁體）', dir: 'ltr' },
  { locale: 'ja-JP', label: '日本語（日本）', dir: 'ltr' },
  { locale: 'ko-KR', label: '한국어（대한민국）', dir: 'ltr' },
]

export function normalizeLocale(input: string) {
  const v = String(input || '').trim()
  if (!v) return 'en-US'
  const hit = supportedLocales.find((x) => x.locale.toLowerCase() === v.toLowerCase())
  if (hit) return hit.locale
  const base = v.split('-')[0]
  const baseHit = supportedLocales.find((x) => x.locale.split('-')[0].toLowerCase() === base.toLowerCase())
  return baseHit ? baseHit.locale : 'en-US'
}

export function localeDir(locale: string): 'ltr' | 'rtl' {
  const hit = supportedLocales.find((x) => x.locale.toLowerCase() === String(locale || '').toLowerCase())
  if (hit) return hit.dir
  const base = String(locale || '').split('-')[0].toLowerCase()
  if (base === 'ar' || base === 'he' || base === 'fa' || base === 'ur') return 'rtl'
  return 'ltr'
}

