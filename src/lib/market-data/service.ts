import { MarketTicker } from '@/src/lib/market-data/types';

// Mock data for fallback or simulation
const MOCK_TICKERS: MarketTicker[] = [
  { symbol: 'BTC', category: 'crypto', price: 65000, change24h: 2.5, volatility: 0.60, lastUpdated: new Date() },
  { symbol: 'ETH', category: 'crypto', price: 3500, change24h: 1.8, volatility: 0.70, lastUpdated: new Date() },
  { symbol: 'SPX', category: 'stocks', price: 5200, change24h: 0.5, volatility: 0.15, lastUpdated: new Date() },
  { symbol: 'NDX', category: 'stocks', price: 18000, change24h: 0.8, volatility: 0.20, lastUpdated: new Date() },
  { symbol: 'US10Y', category: 'fixed_income', price: 4.2, change24h: 0.0, volatility: 0.05, lastUpdated: new Date() },
];

export class MarketDataService {
  private useRealData: boolean;

  constructor(useRealData: boolean = true) {
    this.useRealData = useRealData;
  }

  /**
   * Fetches current market data. 
   * Tries to hit CoinGecko for crypto; uses mock for others.
   */
  async getMarketData(): Promise<MarketTicker[]> {
    if (!this.useRealData) return this.getMockData();

    try {
      const cryptoData = await this.fetchCryptoData();
      // Merge with mock stock/bond data since we don't have a free stock API handy
      const stockData = MOCK_TICKERS.filter(t => t.category !== 'crypto');
      return [...cryptoData, ...stockData];
    } catch (error) {
      console.warn('Failed to fetch live data, falling back to mock', error);
      return this.getMockData();
    }
  }

  private async fetchCryptoData(): Promise<MarketTicker[]> {
    // CoinGecko API (No key required for simple endpoints)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
    );
    
    if (!response.ok) throw new Error('CoinGecko API error');
    
    const data = await response.json();
    
    return [
      {
        symbol: 'BTC',
        category: 'crypto',
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change,
        volatility: 0.60, // Hardcoded for now, normally calculated from history
        lastUpdated: new Date()
      },
      {
        symbol: 'ETH',
        category: 'crypto',
        price: data.ethereum.usd,
        change24h: data.ethereum.usd_24h_change,
        volatility: 0.70,
        lastUpdated: new Date()
      }
    ];
  }

  private getMockData(): MarketTicker[] {
    // Add some random noise to mock data to simulate "live" updates
    return MOCK_TICKERS.map(t => ({
      ...t,
      price: t.price * (1 + (Math.random() * 0.02 - 0.01)),
      change24h: t.change24h + (Math.random() * 0.5 - 0.25),
      lastUpdated: new Date()
    }));
  }
}
