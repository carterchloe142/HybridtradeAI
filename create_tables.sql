-- Create Setting table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- Create Performance table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Performance" (
    "id" TEXT NOT NULL,
    "weekEnding" TIMESTAMP(3) NOT NULL,
    "streamRois" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- Create unique index on Performance.weekEnding
CREATE UNIQUE INDEX IF NOT EXISTS "Performance_weekEnding_key" ON "Performance"("weekEnding");

-- Create InvestmentPlan table if it doesn't exist
CREATE TABLE IF NOT EXISTS "InvestmentPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minAmount" DECIMAL(24, 8) NOT NULL,
    "maxAmount" DECIMAL(24, 8) NOT NULL,
    "duration" INTEGER NOT NULL,
    "returnPercentage" DECIMAL(10, 4) NOT NULL,
    "payoutFrequency" "PayoutFrequency" NOT NULL DEFAULT 'WEEKLY',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InvestmentPlan_pkey" PRIMARY KEY ("id")
);

-- Create Investment table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Investment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "principal" DECIMAL(24, 8) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'PENDING',
    "payoutFrequency" "PayoutFrequency" NOT NULL DEFAULT 'WEEKLY',
    "nextPayoutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maturedAt" TIMESTAMP(3),
    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys if possible (might fail if User table doesn't exist or is named differently)
-- ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Investment" ADD CONSTRAINT "Investment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InvestmentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
