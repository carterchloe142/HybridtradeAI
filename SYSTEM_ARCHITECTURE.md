# System Architecture: Admin-User Connectivity

This document maps how Admin actions (Backend/Dashboard) directly impact User features (Frontend/API) through shared database states.

## 1. User Management & Security (KYC)
**Connection:** Admin approval unlocks User features.
*   **Admin Function:** `POST /api/admin/kyc/review`
    *   **Action:** Admin clicks "Approve" on a KYC request.
    *   **Effect:** Updates `User.kycStatus` to `'APPROVED'` and syncs to `profiles.kyc_status`.
*   **User Function:** `GET /api/user/kyc/status` & Middleware
    *   **Impact:** User's `kycStatus` changes from `PENDING` to `VERIFIED`.
    *   **Result:** The "Deposit" and "Withdraw" pages (protected by `checkKycStatus`) become accessible. The "Verify Now" badge on the Dashboard turns into "Verified Account".

## 2. Financial System (Wallets & Credits)
**Connection:** Admin credits/debits directly modify the User's central Ledger.
*   **Admin Function:** `POST /api/admin/credit-user` (Manual Credit)
    *   **Action:** Admin adds funds (e.g., $1000) to a user.
    *   **Effect:** Finds the user's `Wallet` (or creates one) and **increments** the balance. Logs a `Transaction` with type `CREDIT`.
*   **User Function:** `GET /app/dashboard` (Wallet Fetch)
    *   **Impact:** The Dashboard "Total Balance" immediately reflects the new amount.
    *   **Result:** The User can now use these funds to purchase Investment Plans.

## 3. Investment Engine (Profit Distribution)
**Connection:** Admin "Run Cycle" drives User portfolio growth.
*   **Admin Function:** `POST /api/admin/distribute-profits` (Weekly Stream)
    *   **Action:** Admin triggers the profit engine (e.g., 1.2% ROI).
    *   **Effect:** Calculates ROI for every active `Investment`. Creates `ProfitLog` entries.
*   **User Function:** `GET /api/user/investments/summary`
    *   **Impact:**
        *   **Payout Mode:** User's Wallet balance increases (Profit added).
        *   **Compound Mode:** User's Active Investment Principal increases.
    *   **Result:** The User's "Total Earnings" and "Recent Activity" feed update to show the "Profit Payout".

## 4. Withdrawal Processing
**Connection:** Admin review finalizes User fund removal.
*   **User Function:** `POST /api/user/withdraw` (Request)
    *   **Action:** User requests withdrawal. Funds are **deducted immediately** from Wallet to prevent double-spend. `Transaction` created with status `PENDING`.
*   **Admin Function:** `PATCH /api/admin/transactions` (Approve/Reject)
    *   **Scenario A (Approve):** Updates Transaction status to `COMPLETED`. Funds leave the system (externally).
    *   **Scenario B (Reject):** Updates status to `CANCELLED` and **refunds** the amount back to the User's `Wallet`.

## 5. Customer Support
**Connection:** Admin console acts as the backend for User chat.
*   **User Function:** `POST /api/user/support` (Create Ticket)
    *   **Action:** Creates a `SupportTicket` in the database.
*   **Admin Function:** `POST /api/admin/support` (Reply)
    *   **Action:** Admin sends a response.
    *   **Effect:** Inserts a `Reply` record linked to the ticket.
    *   **Result:** User sees the admin's message appear in their Support history view.

## 6. Notifications
**Connection:** Admin broadcasts reach users via polling/streams.
*   **Admin Function:** `POST /api/admin/notifications` (Broadcast)
    *   **Action:** Admin sends a system-wide alert.
    *   **Effect:** Creates a `GlobalNotification` record.
*   **User Function:** `useUserNotifications` Hook
    *   **Impact:** The hook polls for new `GlobalNotification` records that haven't been delivered to this user yet.
    *   **Result:** A bell icon badge appears, and the message is listed in the Notification Center.

## Database Schema Compatibility
*   **Critical Note:** The system uses a "Dual-Write/Read" strategy (PascalCase `User` vs snake_case `users`) to ensure that regardless of whether the Admin uses the legacy or modern dashboard, the data remains consistent for the User.
