export interface MarketTicker {
  symbol: string;
  category: 'crypto' | 'stocks' | 'forex' | 'commodities' | 'fixed_income';
  price: number;
  change24h: number;
  volatility: number; // Annualized standard deviation (0.0 to 1.0)
  lastUpdated: Date;
}

export interface RevenueStream {
  id: string; // e.g., 'trading', 'staking_yield'
  name: string;
  correlatedTickers: string[]; // Symbols this stream depends on
  baseYield: number; // Base APY (decimal, e.g., 0.05 for 5%)
  volatilityMultiplier: number; // How much market volatility affects this stream
}

export interface SimulationResult {
  timestamp: string;
  scenarios: {
    bull: ScenarioOutcome;
    bear: ScenarioOutcome;
    neutral: ScenarioOutcome;
    realtime: ScenarioOutcome;
  };
  marketData: MarketTicker[];
}

export interface ScenarioOutcome {
  projectedRoi: number; // Percentage
  riskScore: number; // 0-100
  revenueBreakdown: Record<string, number>; // Stream ID -> Contribution amount
}
