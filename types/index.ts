export type Plan = {
  id: string;
  name: string;
  description: string;
  weeklyRoi: number; // percentage
  features: string[];
};

export type Balance = {
  currency: 'USD' | 'EUR' | 'NGN' | 'BTC' | 'ETH';
  amount: number;
};

export type ReferralInfo = {
  userId: string;
  referralCode: string;
  totalEarnings: number;
};
