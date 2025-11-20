## Key Findings
- `useUserNotifications` handles SSE, leader election via `BroadcastChannel`, initial list fetch, and optimistic `markRead` (src/hooks/useUserNotifications.ts:14–109).
- `useUnreadCount()` instantiates `useUserNotifications()` again, which can trigger a second leader election and duplicate SSE attempts in the same component (app/components/NotificationBell.tsx:8–10; src/hooks/useUserNotifications.ts:111–114).
- `connected` never flips to false on SSE errors; reconnection/backoff is not implemented (`es.onerror` is empty).

## Goals
- Avoid duplicate hook instances in UI; derive unread count from a single source.
- Add resilient SSE reconnection with exponential backoff and proper `connected` state.
- Keep optimistic `markRead` and last-event replay intact.
- Provide minimal, focused changes with tests.

## Changes
### Hooks
- Modify `useUserNotifications` to:
  - Track and update `connected=false` on `error`, and schedule reconnect with exponential backoff (jitter), reusing `lastEventId` from `localStorage`.
  - Handle leader loss: if leader tab closes, non-leaders can re-elect; add a periodic "ping" or onerror-triggered re-election.
- Replace `useUnreadCount()` with a lightweight selector that does NOT instantiate another SSE:
  - Option A (minimal): Remove `useUnreadCount`; consumers call `useUserNotifications()` once and read `unreadCount` from its return.
  - Option B (context): Add `NotificationsProvider` + `useNotifications()` and `useUnreadCount()` that read from the same context instance; ensures singleton stream per app tree.
  - Choose Option A for speed and low impact.

### UI
- Update `NotificationBell` to call `useUserNotifications()` once and derive both `connected` and `unreadCount` from that single call (app/components/NotificationBell.tsx:8–10 → single hook).

### Tests
- Add Jest tests:
  - Reconnection/backoff: simulate `EventSource` error → verify `connected` toggles and reconnect attempts with backoff schedule.
  - Optimistic `markRead` rollback: mock `fetch` failure → ensure items revert to previous state.
  - Duplicate instance prevention: render `NotificationBell` and assert only one `EventSource` created.

## Non-Goals
- No server/API changes; reuse existing `/api/user/notifications` and `/stream` endpoints.
- No admin-side refactor in this pass.

## File Edits
- `src/hooks/useUserNotifications.ts`
  - Add backoff reconnection on `es.onerror`; toggle `connected` accordingly.
  - Export only `useUserNotifications`; deprecate `useUnreadCount`.
- `app/components/NotificationBell.tsx`
  - Use single `useUserNotifications()` instance; remove `useUnreadCount()` import.
- `tests/notifications.hook.spec.ts`
  - New test file with the cases above.

## Rollout
- Implement minimal code changes first (Option A), run tests, verify locally.
- If future components need unread-only access, consider introducing a Provider (Option B) later.