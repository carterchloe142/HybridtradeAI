-- Create Enums if not exist
DO $$ BEGIN
    CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'PROFIT', 'FEE', 'TRANSFER', 'ADMIN_CREDIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Transaction table
CREATE TABLE IF NOT EXISTS public."Transaction" (
    id text NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" text NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "investmentId" text REFERENCES public."Investment"(id) ON DELETE SET NULL,
    type "TransactionType" NOT NULL,
    amount decimal(24,8) NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    provider text NOT NULL DEFAULT 'system',
    status "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    reference text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "Transaction_pkey" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON public."Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_investmentId_idx" ON public."Transaction"("investmentId");

ALTER TABLE public."Transaction" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public."Transaction";
CREATE POLICY "Users can view own transactions" ON public."Transaction"
    FOR SELECT USING (auth.uid()::text = "userId");

-- Wallet table
CREATE TABLE IF NOT EXISTS public."Wallet" (
    id text NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" text NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    currency text NOT NULL,
    balance decimal(24,8) NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "Wallet_pkey" PRIMARY KEY (id),
    CONSTRAINT "Wallet_userId_currency_key" UNIQUE ("userId", currency)
);

ALTER TABLE public."Wallet" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallets" ON public."Wallet";
CREATE POLICY "Users can view own wallets" ON public."Wallet"
    FOR SELECT USING (auth.uid()::text = "userId");

-- Notification table
CREATE TABLE IF NOT EXISTS public."Notification" (
    id text NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" text REFERENCES public."User"(id) ON DELETE SET NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    read boolean NOT NULL DEFAULT false,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "Notification_pkey" PRIMARY KEY (id)
);

ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public."Notification";
CREATE POLICY "Users can view own notifications" ON public."Notification"
    FOR SELECT USING (auth.uid()::text = "userId");
