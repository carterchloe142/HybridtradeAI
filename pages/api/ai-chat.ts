import type { NextApiRequest, NextApiResponse } from 'next';

const responses = {
  company: 'HybridTradeAI blends AI signals, HFT strategies, and diversified revenue like ads to deliver weekly returns.',
  plans: 'We offer Starter (10%), Pro (12%), Elite (14%) weekly ROI targets with varying access to streams.',
  tips: 'Diversify across plans, maintain cash reserves, and consider DCA for volatile assets.'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt } = req.body || {};
  const p = String(prompt || '').toLowerCase();
  let message = 'Hello! Ask me about the company, plans, or investing tips.';
  if (p.includes('company')) message = responses.company;
  else if (p.includes('plan')) message = responses.plans;
  else if (p.includes('tip')) message = responses.tips;
  return res.status(200).json({ ok: true, message });
}
