import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { category } = req.query;

  // Mock news items
  const allNews = [
    {
      title: 'Bitcoin breaks new resistance levels as institutional interest grows',
      link: '#',
      source: 'CryptoDaily',
      category: 'crypto'
    },
    {
      title: 'AI-driven trading strategies outperform traditional funds in Q3',
      link: '#',
      source: 'FinTech Weekly',
      category: 'tech'
    },
    {
      title: 'Global markets react to new economic policies',
      link: '#',
      source: 'MarketWatch',
      category: 'stocks'
    },
    {
      title: 'Ethereum 2.0 upgrades promise lower gas fees',
      link: '#',
      source: 'EthNews',
      category: 'crypto'
    },
    {
      title: 'Tech giants invest heavily in quantum computing for finance',
      link: '#',
      source: 'TechCrunch',
      category: 'tech'
    }
  ];

  let items = allNews;
  if (category && category !== 'all') {
    items = allNews.filter(item => item.category === category);
  }

  res.status(200).json({
    items: items
  });
}
