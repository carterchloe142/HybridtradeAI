# Ops Runbook

## Cron & Scheduling

- Profit distribution: trigger `POST /api/admin/distribute-profits` (dry-run first) per weekly cadence.
- Broadcast worker: start with `RUN_WORKERS=true node dist/workers/broadcastWorker.js` or equivalent process manager.
- Retention: schedule `POST /api/admin/retention` daily with `days=<N>` or rely on default env.

## Replay Procedures

- Broadcast replay: re-enqueue a job with the same `globalNotificationId`. Deliveries use `skipDuplicates` to avoid double inserts.
- Profit replay: use dry-run to validate, then run live; duplicate prevention via unique `ProfitLog` (investmentId, weekEnding).

## Troubleshooting

- Check structured logs (JSON) in stdout. Events prefixed by `profit_distribution.*`, `profit_engine.*`, `broadcast.*`, `retention.*`.
- Sentry: verify `SENTRY_DSN` set; inspect errors and performance traces.
- DB: ensure Prisma client connectivity and indexes present per `prisma/schema.prisma`.

## On-Call Notes

- Keep `DELIVERY_RETENTION_DAYS` reasonable to avoid unbounded table growth.
- Use `dryRun` for profit jobs to sanity-check AUM and computed totals before crediting.

