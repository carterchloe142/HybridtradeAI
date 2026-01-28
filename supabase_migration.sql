CREATE TABLE IF NOT EXISTS public."Allocation" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algo_pct NUMERIC NOT NULL,
    copy_pct NUMERIC NOT NULL,
    staking_pct NUMERIC NOT NULL,
    ads_pct NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public."Allocation" (algo_pct, copy_pct, staking_pct, ads_pct)
SELECT 50, 25, 20, 5
WHERE NOT EXISTS (SELECT 1 FROM public."Allocation");

ALTER TABLE public."Allocation" ENABLE ROW LEVEL SECURITY;

DO push 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Allocation' AND policyname = 'Enable read access for all users') THEN 
        CREATE POLICY "Enable read access for all users" ON public."Allocation" FOR SELECT USING (true); 
    END IF; 
END push;
