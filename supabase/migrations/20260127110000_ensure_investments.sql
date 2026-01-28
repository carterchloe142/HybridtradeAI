-- Create InvestmentPlan table
CREATE TABLE IF NOT EXISTS public."InvestmentPlan" (
    id text NOT NULL DEFAULT gen_random_uuid()::text,
    name text NOT NULL,
    "minAmount" decimal(24,8) NOT NULL,
    "maxAmount" decimal(24,8) NOT NULL,
    duration integer NOT NULL,
    "returnPercentage" decimal(10,4) NOT NULL,
    "payoutFrequency" text NOT NULL DEFAULT 'WEEKLY',
    active boolean NOT NULL DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "InvestmentPlan_pkey" PRIMARY KEY (id)
);

ALTER TABLE public."InvestmentPlan" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can read plans" ON public."InvestmentPlan";
CREATE POLICY "Everyone can read plans" ON public."InvestmentPlan" FOR SELECT USING (true);

-- Create Investment table
CREATE TABLE IF NOT EXISTS public."Investment" (
    id text NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" text NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "planId" text NOT NULL REFERENCES public."InvestmentPlan"(id) ON DELETE RESTRICT,
    principal decimal(24,8) NOT NULL,
    "startDate" timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'PENDING', -- PENDING, ACTIVE, MATURED, CANCELLED
    "payoutFrequency" text NOT NULL DEFAULT 'WEEKLY',
    "nextPayoutAt" timestamptz,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    "maturedAt" timestamptz,
    "endDate" timestamptz, -- Added based on route usage
    CONSTRAINT "Investment_pkey" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "Investment_userId_idx" ON public."Investment"("userId");
CREATE INDEX IF NOT EXISTS "Investment_planId_idx" ON public."Investment"("planId");

ALTER TABLE public."Investment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own investments" ON public."Investment";
CREATE POLICY "Users can view own investments" ON public."Investment"
    FOR SELECT USING (auth.uid()::text = "userId");

-- Create ProfitLog table
CREATE TABLE IF NOT EXISTS public."ProfitLog" (
    id text NOT NULL DEFAULT gen_random_uuid()::text,
    "investmentId" text NOT NULL REFERENCES public."Investment"(id) ON DELETE CASCADE,
    amount decimal(24,8) NOT NULL,
    "weekEnding" timestamptz NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "ProfitLog_pkey" PRIMARY KEY (id),
    CONSTRAINT "ProfitLog_investmentId_weekEnding_key" UNIQUE ("investmentId", "weekEnding")
);

CREATE INDEX IF NOT EXISTS "ProfitLog_weekEnding_idx" ON public."ProfitLog"("weekEnding");
ALTER TABLE public."ProfitLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profit logs" ON public."ProfitLog";
CREATE POLICY "Users can view own profit logs" ON public."ProfitLog"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public."Investment" i
            WHERE i.id = "ProfitLog"."investmentId"
            AND i."userId" = auth.uid()::text
        )
    );
