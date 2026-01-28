import { localeDir, normalizeLocale } from '../src/utils/locales'

describe('locales', () => {
  test('normalizeLocale falls back to en-US', () => {
    expect(normalizeLocale('')).toBe('en-US')
    expect(normalizeLocale('xx-YY')).toBe('en-US')
  })

  test('normalizeLocale matches base language when region differs', () => {
    expect(normalizeLocale('en-AU')).toBe('en-US')
    expect(normalizeLocale('es-AR')).toBe('es-ES')
  })

  test('localeDir returns rtl for rtl languages', () => {
    expect(localeDir('ar-SA')).toBe('rtl')
    expect(localeDir('he-IL')).toBe('rtl')
    expect(localeDir('en-US')).toBe('ltr')
  })
})

