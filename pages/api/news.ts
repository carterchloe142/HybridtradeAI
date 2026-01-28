import { NextApiRequest, NextApiResponse } from 'next'

type Category = 'all' | 'crypto' | 'tech' | 'stocks'
type NewsItem = {
  title: string
  link: string
  source: string
  category: Exclude<Category, 'all'>
  publishedAt?: string
  imageUrl?: string
}

const CACHE_TTL_MS = 5 * 60 * 1000

function localeToGoogleNewsParams(locale: string) {
  const raw = String(locale || 'en-US')
  const parts = raw.split('-')
  const lang = (parts[0] || 'en').toLowerCase()
  const region = (parts[1] || 'US').toUpperCase()

  if (lang === 'zh' && region === 'CN') return { hl: 'zh-CN', gl: 'CN', ceid: 'CN:zh-Hans' }
  if (lang === 'zh' && region === 'TW') return { hl: 'zh-TW', gl: 'TW', ceid: 'TW:zh-Hant' }
  if (lang === 'pt' && region === 'BR') return { hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419' }
  if (lang === 'en' && region === 'GB') return { hl: 'en-GB', gl: 'GB', ceid: 'GB:en' }

  return { hl: `${lang}-${region}`, gl: region, ceid: `${region}:${lang}` }
}

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function stripCdata(s: string) {
  return s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '')
}

function pickFirstMatch(block: string, patterns: RegExp[]) {
  for (const p of patterns) {
    const m = block.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}

function inferSourceFromUrl(url: string) {
  try {
    const host = new URL(url).hostname
    return host.replace(/^www\./, '')
  } catch {
    return 'News'
  }
}

function normalizeUrl(url: string) {
  const trimmed = (url || '').trim()
  if (!trimmed) return ''
  return decodeHtmlEntities(stripCdata(trimmed))
}

function parsePublishedAt(raw: string | null) {
  if (!raw) return undefined
  const d = new Date(decodeHtmlEntities(stripCdata(raw)).trim())
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

function parseRssOrAtom(xml: string, category: Exclude<Category, 'all'>, feedName: string): NewsItem[] {
  const items: NewsItem[] = []
  const rssItems = xml.match(/<item[\s\S]*?<\/item>/gi) || []
  const atomEntries = xml.match(/<entry[\s\S]*?<\/entry>/gi) || []
  const blocks = rssItems.length ? rssItems : atomEntries

  for (const block of blocks.slice(0, 25)) {
    const rawTitle = pickFirstMatch(block, [
      /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i,
      /<title[^>]*>([\s\S]*?)<\/title>/i,
    ])
    const rawLink = pickFirstMatch(block, [
      /<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i,
      /<link>([\s\S]*?)<\/link>/i,
      /<link[^>]*href="([^"]+)"[^>]*\/>/i,
      /<link[^>]*href="([^"]+)"[^>]*><\/link>/i,
    ])
    const rawPub = pickFirstMatch(block, [
      /<pubDate>([\s\S]*?)<\/pubDate>/i,
      /<published>([\s\S]*?)<\/published>/i,
      /<updated>([\s\S]*?)<\/updated>/i,
    ])
    const rawSource = pickFirstMatch(block, [
      /<source[^>]*>([\s\S]*?)<\/source>/i,
      /<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/i,
      /<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/i,
    ])
    
    const rawImage = pickFirstMatch(block, [
      /<media:content[^>]*url="([^"]+)"[^>]*>/i,
      /<media:thumbnail[^>]*url="([^"]+)"[^>]*>/i,
      /<enclosure[^>]*type="image\/[^"]*"[^>]*url="([^"]+)"[^>]*>/i,
      /<image>[\s\S]*?<url>([\s\S]*?)<\/url>[\s\S]*?<\/image>/i,
    ])

    const title = rawTitle ? decodeHtmlEntities(stripCdata(rawTitle).trim()) : ''
    const link = rawLink ? normalizeUrl(rawLink) : ''
    if (!title || !link) continue

    const source = rawSource ? decodeHtmlEntities(stripCdata(rawSource).trim()) : feedName || inferSourceFromUrl(link)
    const imageUrl = rawImage ? normalizeUrl(rawImage) : undefined

    items.push({
      title,
      link,
      source,
      category,
      publishedAt: parsePublishedAt(rawPub),
      imageUrl,
    })
  }

  return items
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': `HybridTradeAI/1.0`,
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
      signal: controller.signal,
      cache: 'no-store',
    })
    return res
  } finally {
    clearTimeout(id)
  }
}

declare global {
  var __newsCache: Map<string, { ts: number; items: NewsItem[] }> | undefined
}

function getCache() {
  if (!global.__newsCache) global.__newsCache = new Map()
  return global.__newsCache
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const category = String(req.query.category || 'all') as Category
  const cat: Category = (['all', 'crypto', 'tech', 'stocks'].includes(category) ? category : 'all') as Category
  const locale = String(req.query.locale || req.headers['accept-language'] || 'en-US').split(',')[0]
  const force = String(req.query.force || '').toLowerCase()
  const bypassCache = force === '1' || force === 'true' || force === 'yes'
  const cacheKey = `news:${cat}:${locale}`

  const cache = getCache()
  const cached = cache.get(cacheKey)
  if (!bypassCache && cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return res.status(200).json({ items: cached.items, cached: true })
  }

  const google = localeToGoogleNewsParams(locale)
  const isEnglish = String(google.ceid || '').endsWith(':en')

  const feeds: Record<Exclude<Category, 'all'>, Array<{ name: string; url: string }>> = {
    crypto: [
      { name: 'Google News', url: `https://news.google.com/rss/search?q=cryptocurrency&hl=${encodeURIComponent(google.hl)}&gl=${encodeURIComponent(google.gl)}&ceid=${encodeURIComponent(google.ceid)}` },
      ...(isEnglish ? [{ name: 'CoinDesk', url: 'https://feeds.feedburner.com/CoinDesk' }] : []),
    ],
    tech: [
      { name: 'Google News', url: `https://news.google.com/rss/search?q=technology&hl=${encodeURIComponent(google.hl)}&gl=${encodeURIComponent(google.gl)}&ceid=${encodeURIComponent(google.ceid)}` },
      ...(isEnglish ? [{ name: 'TechCrunch', url: 'https://techcrunch.com/feed/' }] : []),
    ],
    stocks: [
      { name: 'Google News', url: `https://news.google.com/rss/search?q=stock%20market&hl=${encodeURIComponent(google.hl)}&gl=${encodeURIComponent(google.gl)}&ceid=${encodeURIComponent(google.ceid)}` },
      ...(isEnglish ? [{ name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/' }] : []),
    ],
  }

  const categoriesToFetch: Exclude<Category, 'all'>[] = cat === 'all' ? ['crypto', 'tech', 'stocks'] : [cat]

  try {
    const allItems: NewsItem[] = []

    for (const c of categoriesToFetch) {
      for (const feed of feeds[c]) {
        try {
          const r = await fetchWithTimeout(feed.url, 7000)
          if (!r.ok) continue
          const xml = await r.text()
          const parsed = parseRssOrAtom(xml, c, feed.name)
          allItems.push(...parsed)
        } catch {
          // ignore feed failures; we aggregate what we can
        }
      }
    }

    const seen = new Set<string>()
    const deduped = allItems.filter((it) => {
      const key = `${it.link}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    deduped.sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return tb - ta
    })

    const limited = deduped.slice(0, 30)
    cache.set(cacheKey, { ts: Date.now(), items: limited })
    return res.status(200).json({ items: limited, cached: false })
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || 'Failed to fetch news') })
  }
}
