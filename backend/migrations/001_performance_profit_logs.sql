-- Performance streams and profit logs schema
-- Create performance table to store weekly stream ROI inputs
CREATE TABLE IF NOT EXISTS performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_ending date NOT NULL UNIQUE,
  stream_rois jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create profit_logs to track weekly credits per investment
CREATE TABLE IF NOT EXISTS profit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  investment_id uuid NOT NULL,
  week_ending date NOT NULL,
  weighted_pct numeric NOT NULL,
  gross_profit numeric NOT NULL,
  fee numeric NOT NULL,
  net_profit numeric NOT NULL,
  stream_rois jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate credits for the same investment-week
CREATE UNIQUE INDEX IF NOT EXISTS profit_logs_unique_investment_week ON profit_logs (investment_id, week_ending);

