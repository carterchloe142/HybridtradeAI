
-- TopTraders Table
CREATE TABLE IF NOT EXISTS public."TopTraders" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    strategy TEXT NOT NULL,
    roi NUMERIC NOT NULL,
    risk TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Data for TopTraders
INSERT INTO public."TopTraders" (name, strategy, roi, risk)
SELECT 'Alex M.', 'Forex Scalping', 124, 'High'
WHERE NOT EXISTS (SELECT 1 FROM public."TopTraders" WHERE name = 'Alex M.');

INSERT INTO public."TopTraders" (name, strategy, roi, risk)
SELECT 'Sarah K.', 'Crypto Swing', 89, 'Medium'
WHERE NOT EXISTS (SELECT 1 FROM public."TopTraders" WHERE name = 'Sarah K.');

INSERT INTO public."TopTraders" (name, strategy, roi, risk)
SELECT 'Quantum Bot', 'HFT Arbitrage', 45, 'Low'
WHERE NOT EXISTS (SELECT 1 FROM public."TopTraders" WHERE name = 'Quantum Bot');

-- Enable RLS for TopTraders
ALTER TABLE public."TopTraders" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'TopTraders' AND policyname = 'Enable read access for all users') THEN 
        CREATE POLICY "Enable read access for all users" ON public."TopTraders" FOR SELECT USING (true); 
    END IF; 
END $$;


-- AiLogs Table
CREATE TABLE IF NOT EXISTS public."AiLogs" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL, -- Keeping as text to match current format "Oct 24", but normally should be date
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Data for AiLogs
INSERT INTO public."AiLogs" (date, action)
SELECT 'Oct 24', 'Reallocated 5% from Staking to Forex due to high volatility signals.'
WHERE NOT EXISTS (SELECT 1 FROM public."AiLogs" WHERE date = 'Oct 24');

INSERT INTO public."AiLogs" (date, action)
SELECT 'Oct 17', 'Increased stablecoin yield farming allocation by 3%.'
WHERE NOT EXISTS (SELECT 1 FROM public."AiLogs" WHERE date = 'Oct 17');

INSERT INTO public."AiLogs" (date, action)
SELECT 'Oct 10', 'Reduced Gold exposure after market peak.'
WHERE NOT EXISTS (SELECT 1 FROM public."AiLogs" WHERE date = 'Oct 10');

-- Enable RLS for AiLogs
ALTER TABLE public."AiLogs" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'AiLogs' AND policyname = 'Enable read access for all users') THEN 
        CREATE POLICY "Enable read access for all users" ON public."AiLogs" FOR SELECT USING (true); 
    END IF; 
END $$;
