
-- TradeLog Table
CREATE TABLE IF NOT EXISTS public."TradeLog" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "streamId" TEXT NOT NULL,
    symbol TEXT NOT NULL,
    type TEXT CHECK (type IN ('BUY', 'SELL')) NOT NULL,
    "entryPrice" NUMERIC NOT NULL,
    "exitPrice" NUMERIC,
    "profitPct" NUMERIC,
    status TEXT NOT NULL DEFAULT 'CLOSED',
    "simulatedAt" TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure id has default if table exists
ALTER TABLE public."TradeLog" ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add status column if it doesn't exist (since previous error complained about it being null, implying it might be required or I missed it)
-- Actually the error `null value in column "status" of relation "TradeLog"` means the table HAS a status column that is NOT NULL, but my insert didn't provide it.
-- This suggests the table might have been created differently before or I need to add it to my CREATE TABLE and INSERTs.
-- I will add it to the CREATE TABLE above and the INSERTs below.

-- Initial Data for TradeLog
INSERT INTO public."TradeLog" ("streamId", symbol, type, "entryPrice", "exitPrice", "profitPct", status, "simulatedAt")
SELECT 'stream-1', 'BTC', 'BUY', 65000.00, 67500.00, 3.85, 'CLOSED', NOW() - INTERVAL '5 minutes'
WHERE NOT EXISTS (SELECT 1 FROM public."TradeLog" WHERE "streamId" = 'stream-1');

INSERT INTO public."TradeLog" ("streamId", symbol, type, "entryPrice", "exitPrice", "profitPct", status, "simulatedAt")
SELECT 'stream-2', 'ETH', 'SELL', 3200.00, 3100.00, 3.12, 'CLOSED', NOW() - INTERVAL '12 minutes'
WHERE NOT EXISTS (SELECT 1 FROM public."TradeLog" WHERE "streamId" = 'stream-2');

INSERT INTO public."TradeLog" ("streamId", symbol, type, "entryPrice", "exitPrice", "profitPct", status, "simulatedAt")
SELECT 'stream-3', 'SOL', 'BUY', 145.50, 152.00, 4.47, 'CLOSED', NOW() - INTERVAL '30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM public."TradeLog" WHERE "streamId" = 'stream-3');

INSERT INTO public."TradeLog" ("streamId", symbol, type, "entryPrice", "exitPrice", "profitPct", status, "simulatedAt")
SELECT 'stream-4', 'EUR', 'SELL', 1.0850, 1.0820, 0.28, 'CLOSED', NOW() - INTERVAL '45 minutes'
WHERE NOT EXISTS (SELECT 1 FROM public."TradeLog" WHERE "streamId" = 'stream-4');

INSERT INTO public."TradeLog" ("streamId", symbol, type, "entryPrice", "exitPrice", "profitPct", status, "simulatedAt")
SELECT 'stream-5', 'GBP', 'BUY', 1.2600, 1.2640, 0.32, 'CLOSED', NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM public."TradeLog" WHERE "streamId" = 'stream-5');

-- Enable RLS for TradeLog
ALTER TABLE public."TradeLog" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'TradeLog' AND policyname = 'Enable read access for all users') THEN 
        CREATE POLICY "Enable read access for all users" ON public."TradeLog" FOR SELECT USING (true); 
    END IF; 
END $$;
