import crypto from 'crypto';

export type PaymentRequest = {
  amount: number;
  currency: string; // 'USD', 'EUR'
  cryptoCurrency?: string; // 'BTC', 'ETH', 'USDT'
  orderId: string;
  email: string;
  userId: string;
  ipnCallbackUrl?: string;
};

export type PaymentResponse = {
  id: string;
  status: 'pending' | 'waiting' | 'confirmed';
  payUrl?: string; // Redirect URL (e.g. Coinbase hosted page)
  walletAddress?: string; // Direct crypto address (e.g. NowPayments)
  amountExpected?: number;
  currencyExpected?: string;
};

interface PaymentProvider {
  createPayment(req: PaymentRequest): Promise<PaymentResponse>;
}

function normalizeNowPaymentsCurrency(input: string) {
  const raw = String(input || '').trim().toLowerCase()
  if (!raw) return raw

  if (raw === 'usdt') return String(process.env.NOWPAYMENTS_USDT_NETWORK || 'usdttrc20').toLowerCase()
  if (raw === 'btc') return 'btc'
  if (raw === 'eth') return 'eth'
  return raw
}

// --- Mock Provider (Default) ---
class MockProvider implements PaymentProvider {
  async createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    console.log('[MockPayment] Creating payment:', req);
    
    // Deterministic mock address based on user+currency
    const mockHash = crypto.createHash('sha256').update(req.userId + req.cryptoCurrency).digest('hex').substring(0, 32);
    const prefix = req.cryptoCurrency?.toLowerCase() === 'btc' ? 'bc1q' : '0x';
    
    return {
      id: `mock_${Date.now()}`,
      status: 'waiting',
      walletAddress: `${prefix}${mockHash}`,
      amountExpected: req.amount, // Simplified 1:1 for mock
      currencyExpected: req.cryptoCurrency || 'USDT'
    };
  }
}

// --- NowPayments Provider ---
class NowPaymentsProvider implements PaymentProvider {
  private apiKey: string;
  private baseUrl = 'https://api.nowpayments.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    if (!req.cryptoCurrency) throw new Error('Crypto currency required for NowPayments');

    const payCurrency = normalizeNowPaymentsCurrency(req.cryptoCurrency)

    const ipnCallbackUrl = req.ipnCallbackUrl ? String(req.ipnCallbackUrl).trim() : ''

    const body = {
      price_amount: req.amount,
      price_currency: req.currency.toLowerCase(),
      pay_currency: payCurrency,
      ...(ipnCallbackUrl ? { ipn_callback_url: ipnCallbackUrl } : {}),
      order_id: req.orderId,
      order_description: `Deposit for User ${req.email}`
    };

    const res = await fetch(`${this.baseUrl}/payment`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('NowPayments Error:', err);
      try {
        const parsed = JSON.parse(err)
        throw new Error(String(parsed?.message || parsed?.error || 'Payment gateway error'))
      } catch {
        const short = String(err || '').slice(0, 300)
        throw new Error(short ? `NowPayments: ${short}` : 'Payment gateway error')
      }
    }

    const json = await res.json();

    return {
      id: String(json.payment_id),
      status: 'waiting',
      walletAddress: String(json.pay_address || ''),
      amountExpected: Number(json.pay_amount || 0),
      currencyExpected: String(json.pay_currency || '').toUpperCase()
    };
  }
  }

// --- Factory ---
export function getPaymentProvider(name: 'nowpayments' | 'coinbase' | 'mock' | 'simulation' = 'mock'): PaymentProvider {
  if (name === 'nowpayments' && process.env.NOWPAYMENTS_API_KEY) {
    return new NowPaymentsProvider(process.env.NOWPAYMENTS_API_KEY);
  }
  // Fallback to mock if keys missing
  return new MockProvider();
}
