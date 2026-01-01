import { formatStr } from '../hooks/useI18n'

describe('formatStr', () => {
  it('replaces simple placeholders', () => {
    const s = 'Hello {name}, you have {count} messages'
    const out = formatStr(s, { name: 'Alice', count: 3 })
    expect(out).toBe('Hello Alice, you have 3 messages')
  })

  it('leaves unknown placeholders intact', () => {
    const s = 'Level {l} — status {status}'
    const out = formatStr(s, { l: 2 })
    expect(out).toBe('Level 2 — status {status}')
  })

  it('returns original string when no vars', () => {
    const s = 'No vars here'
    expect(formatStr(s)).toBe(s)
  })
})
