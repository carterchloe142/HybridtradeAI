# Notifications & Broadcasts

- Architecture: `GlobalNotification` → many `NotificationDelivery` rows per user, plus SSE publish for real-time.
- Worker: `src/workers/broadcastWorker.ts` batches `createMany` and publishes per-user channels.
- Admin UI: `/admin/notifications` (future) and programmatic creation via Prisma or API.

## Replay & Troubleshooting

- Re-run a broadcast by enqueuing a job with `globalNotificationId` and `RUN_WORKERS=true`.
- Inspect Redis logs: `job_logs:broadcast:<jobId>` contains structured JSON lines.
- If a job fails, Sentry captures exceptions when `SENTRY_DSN` is set.

## Retention

- `NotificationDelivery` retention deletes rows older than `DELIVERY_RETENTION_DAYS` (default 30).
- API: `POST /api/admin/retention?days=60` to override days for an ad-hoc cleanup.

## Env Vars

- `SENTRY_DSN` – enable error tracking and performance tracing.
- `SENTRY_TRACES_SAMPLE_RATE` – optional tracing sample rate.
- `DELIVERY_RETENTION_DAYS` – default days to retain deliveries.

