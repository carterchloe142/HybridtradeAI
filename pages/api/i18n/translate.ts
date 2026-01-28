import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

type Body = { locale?: string; key?: string; text?: string }

function isLikelyEnglish(s: string) {
  return /^[\x00-\x7F\s\p{P}]+$/u.test(s)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not configured' })

  let body: Body = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as any)
  } catch {
    body = {}
  }

  const locale = String(body.locale || '').trim() || 'en-US'
  const text = String(body.text || '').trim()
  if (!text) return res.status(400).json({ error: 'Missing text' })
  if (text.length > 600) return res.status(400).json({ error: 'Text too long' })

  const base = locale.split('-')[0].toLowerCase()
  if (base === 'en') return res.status(200).json({ translation: text })

  const client = new OpenAI({ apiKey })

  try {
    const input = isLikelyEnglish(text) ? text : text
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You translate UI strings for a fintech app. Output ONLY the translated text. Preserve numbers, placeholders like {name} and {count}, and keep it concise.',
        },
        {
          role: 'user',
          content: `Target locale: ${locale}\nText: ${input}`,
        },
      ],
    })
    const translation = String(completion.choices?.[0]?.message?.content || '').trim()
    if (!translation) return res.status(200).json({ translation: text })
    return res.status(200).json({ translation })
  } catch (e: any) {
    return res.status(200).json({ translation: text, warning: String(e?.message || 'translate_failed') })
  }
}

