import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'

  // Mock data simulating market insights and news
  const items = [
    {
      id: '1',
      title: locale === 'zh' ? '比特币突破65000美元大关' : 'Bitcoin Breaks $65,000 Barrier',
      summary: 'Market rallies as institutional adoption increases.',
      sourceType: 'news',
      sourceName: 'CryptoNews',
      sourceUrl: '#',
      publishedAt: new Date().toISOString(),
      dedupeKey: '1'
    },
    {
      id: '2',
      title: locale === 'zh' ? '美联储暗示暂停加息' : 'Fed Hints at Rate Hike Pause',
      summary: 'Economic indicators suggest cooling inflation.',
      sourceType: 'market',
      sourceName: 'MarketWatch',
      sourceUrl: '#',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      dedupeKey: '2'
    },
    {
      id: '3',
      title: locale === 'zh' ? '以太坊升级即将到来' : 'Ethereum Upgrade Incoming',
      summary: 'Network efficiency expected to improve by 20%.',
      sourceType: 'news',
      sourceName: 'CoinDesk',
      sourceUrl: '#',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      dedupeKey: '3'
    },
    {
      id: '4',
      title: locale === 'zh' ? 'Solana网络活跃度创历史新高' : 'Solana Network Activity Hits All-Time High',
      summary: 'DeFi applications driving massive transaction volume.',
      sourceType: 'market',
      sourceName: 'SolanaDaily',
      sourceUrl: '#',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      dedupeKey: '4'
    },
     {
      id: '5',
      title: locale === 'zh' ? '新的监管框架发布' : 'New Regulatory Framework Released',
      summary: 'Global regulators agree on crypto standards.',
      sourceType: 'news',
      sourceName: 'Reuters',
      sourceUrl: '#',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      dedupeKey: '5'
    }
  ]

  return NextResponse.json({
    items,
    serverTime: new Date().toISOString()
  })
}
