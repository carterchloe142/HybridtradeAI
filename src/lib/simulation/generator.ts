
import { supabaseServer } from '@/src/lib/supabaseServer';

const ASSETS = {
  FOREX: [
    { symbol: 'EUR/USD', base: 1.08, vol: 0.005 },
    { symbol: 'USD/JPY', base: 150.0, vol: 0.8 },
    { symbol: 'GBP/USD', base: 1.26, vol: 0.006 },
    { symbol: 'AUD/USD', base: 0.65, vol: 0.004 },
  ],
  CRYPTO: [
    { symbol: 'BTC/USD', base: 65000, vol: 1500 },
    { symbol: 'ETH/USD', base: 3500, vol: 100 },
    { symbol: 'SOL/USD', base: 145, vol: 5 },
    { symbol: 'XRP/USD', base: 0.60, vol: 0.02 },
  ],
  STOCKS: [
    { symbol: 'NVDA', base: 880, vol: 15 },
    { symbol: 'TSLA', base: 175, vol: 5 },
    { symbol: 'AAPL', base: 170, vol: 2 },
    { symbol: 'MSFT', base: 420, vol: 4 },
  ]
};

const STRATEGIES = [
  'Trend Following',
  'Mean Reversion',
  'Breakout',
  'News Event',
  'Arbitrage',
  'AI Sentiment Analysis'
];

const REASONS = {
  'Trend Following': ['Moving Average Crossover', 'MACD Bullish Divergence', 'Strong Upward Momentum'],
  'Mean Reversion': ['RSI Oversold', 'Bollinger Band Bounce', 'Overextended Price Action'],
  'Breakout': ['Resistance Level Breach', 'Volume Spike', 'Triangle Pattern Breakout'],
  'News Event': ['Positive Earnings Surprise', 'Fed Rate Decision', 'Geopolitical De-escalation'],
  'Arbitrage': ['Exchange Price Discrepancy', 'Cross-Border Spread', 'Latency Advantage'],
  'AI Sentiment Analysis': ['Social Media Sentiment Spike', 'News Sentiment Positive', 'Institutional Flow Detected']
};

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateSmartTrades(count: number = 5) {
  const trades = [];

  for (let i = 0; i < count; i++) {
    // 1. Pick Category (weighted)
    const rand = Math.random();
    let category: 'FOREX' | 'CRYPTO' | 'STOCKS' = 'CRYPTO';
    if (rand < 0.3) category = 'FOREX';
    else if (rand < 0.5) category = 'STOCKS';

    // 2. Pick Asset
    const asset = getRandomItem(ASSETS[category]);
    
    // 3. Determine Price with Volatility
    const priceVariation = randomRange(-asset.vol, asset.vol);
    const entryPrice = asset.base + priceVariation;

    // 4. Pick Strategy & Reason
    const strategy = getRandomItem(STRATEGIES);
    const reason = getRandomItem(REASONS[strategy as keyof typeof REASONS]);

    // 5. Determine Outcome (Win/Loss)
    // AI bots usually have higher win rate in simulation ;)
    const isWin = Math.random() > 0.3; // 70% win rate
    const profitPct = isWin ? randomRange(0.5, 3.5) : randomRange(-1.5, -0.1);
    
    const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
    
    let exitPrice = 0;
    if (type === 'BUY') {
      exitPrice = entryPrice * (1 + profitPct / 100);
    } else {
      exitPrice = entryPrice * (1 - profitPct / 100);
    }

    trades.push({
      streamId: 'hybrid_ai_v2',
      symbol: asset.symbol,
      type,
      entryPrice: Number(entryPrice.toFixed(4)),
      exitPrice: Number(exitPrice.toFixed(4)),
      profitPct: Number(profitPct.toFixed(2)),
      strategy,
      reason,
      simulatedAt: new Date().toISOString()
    });
  }

  return trades;
}

export async function saveTradesToDB(trades: any[]) {
    if (!supabaseServer) throw new Error('Supabase not configured');

    // PascalCase Table
    const { error: err1 } = await supabaseServer.from('TradeLog').insert(trades);
    
    if (err1) {
        // Fallback to snake_case
        if (err1.message.includes('relation') || err1.code === '42P01' || err1.message.includes('column')) {
             const mapped = trades.map(t => ({
                 stream_id: t.streamId,
                 symbol: t.symbol,
                 type: t.type,
                 entry_price: t.entryPrice,
                 exit_price: t.exitPrice,
                 profit_pct: t.profitPct,
                 strategy: t.strategy,
                 reason: t.reason,
                 simulated_at: t.simulatedAt
             }));
             const { error: err2 } = await supabaseServer.from('trade_logs').insert(mapped);
             if (err2) throw err2;
        } else {
            throw err1;
        }
    }
}
