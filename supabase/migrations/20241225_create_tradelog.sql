-- Create TradeLog table
CREATE TABLE IF NOT EXISTS "TradeLog" (
  "id" TEXT NOT NULL,
  "streamId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "entryPrice" DECIMAL(24, 8) NOT NULL,
  "exitPrice" DECIMAL(24, 8),
  "profitPct" DECIMAL(10, 4),
  "status" TEXT NOT NULL,
  "simulatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TradeLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TradeLog_streamId_idx" ON "TradeLog"("streamId");
CREATE INDEX "TradeLog_simulatedAt_idx" ON "TradeLog"("simulatedAt");
