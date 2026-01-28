# Market‑Referenced Simulation (Educational Prototype)

This repository contains an educational, **market‑referenced simulation** for demonstrating how financial dashboards can display portfolio profit/loss using **real market data as a reference** and a **fully disclosed formula**.

This is **not** an investment product. It is an educational prototype designed to highlight cybersecurity and integrity risks in financial systems.

## Disclaimers

- All portfolio P&L presented as **simulated** is not real trading performance and is not a promise of returns.
- Real market data is used only as a **reference input**.
- Do not use this prototype to make real financial decisions.

## Data Sources

- Market reference endpoint: `GET /api/market/reference`
  - Primary source: CoinGecko market chart data.
  - Fallback: static values if the source is unavailable.

## Simulation Model (Transparent Formula)

### Step 1: Market Reference

The system fetches a 7‑day percentage change for a small set of public reference assets (e.g., BTC and ETH).

### Step 2: Convert Market Move → Stream ROIs

The system converts market change into a set of “stream ROIs” (e.g., `trading`, `staking`, `copy`, `ai`, `ads`, `tasks`) using a documented transformation with clamping bounds.

Endpoint:
- `POST /api/cron/update-performance?key=CRON_SECRET`

Output persisted in Supabase table:
- `performance.stream_rois` (JSON)

### Step 3: Plan Allocation → Weighted ROI

Each plan has allocation weights (percentages) across streams.

Weighted weekly ROI (%):

`weighted_weekly_roi_pct = Σ (allocation_pct(stream) / 100) * stream_roi_pct(stream)`

### Step 4: Daily Marks (Lifecycle)

For each active investment, a daily “mark” is generated:

- `daily_roi_pct = weighted_weekly_roi_pct / 7`
- `gross_daily_pnl_usd = principal_usd * daily_roi_pct / 100`
- `net_daily_pnl_usd = gross_daily_pnl_usd * (1 - SERVICE_FEE_PCT/100)`
- `equity_usd = previous_equity_usd + net_daily_pnl_usd`

Endpoint:
- `POST /api/cron/run-simulation?key=CRON_SECRET`

Output persisted in Supabase table:
- `investment_marks` with:
  - `mark_date`, `pnl_usd`, `equity_usd`
  - `reference` JSON including market source, asOf, stream rois, fee, and formula version

### Step 5: Dashboard Presentation

User dashboard fetches:
- `GET /api/user/investments/pnl`

This returns:
- Market reference metadata (`reference.source`, `reference.asOf`)
- Per‑investment cycle state (days elapsed/total)
- Simulated cumulative P&L and a limited history series

## Security Lessons (What This Prototype Teaches)

### 1) Integrity of “Financial Truth”

Even with real market data, a dashboard can still be misleading if:
- the transformation logic is hidden,
- the formula can be altered silently,
- the data source is swapped.

Mitigation demonstrated:
- Store `reference` and `formula_version` for every mark so results can be audited.

### 2) Supply‑Chain & Dependency Risks

Market data providers may:
- rate limit or change formats,
- return partial or delayed data.

Mitigation demonstrated:
- explicit fallback behavior and “source” labeling.

### 3) Authentication and Authorization

Cron endpoints are protected by `CRON_SECRET`.

Risk:
- leaking the secret allows attackers to generate fraudulent marks.

Mitigation:
- keep secrets out of client code/logs,
- rotate secrets,
- add IP allowlisting and replay protection for production.

### 4) Database Access Control

Simulation marks use RLS policies:
- users can read only their own marks,
- admins can read all.

Risk:
- missing RLS allows cross‑user access.

### 5) Auditability and Tamper Evidence

Risk:
- attackers can modify marks after creation.

Mitigation (recommended for extended learning):
- add append‑only constraints,
- store cryptographic hashes per day/user,
- write an audit log for changes.

## Operational Notes

- Env vars:
  - `CRON_SECRET`: required to call cron endpoints.
  - `SERVICE_FEE_PCT`: simulation fee applied to net P&L.

- Suggested schedule:
  - `update-performance`: daily (or hourly)
  - `run-simulation`: daily (or hourly)

