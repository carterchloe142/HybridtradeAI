import { NextRequest } from 'next/server'
import { supabaseServer } from '@lib/supabaseServer'

export async function GET(req: NextRequest) {
  const schemaChecks = {
    Investment: ['principal', 'startDate', 'amount', 'roiMinPct', 'returnPercentage', 'status', 'userId'],
    investments: ['principal', 'start_date', 'amount', 'roi_min_pct', 'return_percentage', 'status', 'user_id'],
    Transaction: ['reference', 'metadata', 'note', 'details', 'currency', 'provider', 'type', 'amount', 'userId', 'investmentId'],
    transactions: ['reference', 'metadata', 'note', 'details', 'currency', 'provider', 'type', 'amount', 'user_id', 'investment_id'],
    WalletTransaction: ['reference', 'note', 'metadata', 'walletId', 'amount', 'type'],
    wallet_transactions: ['reference', 'note', 'metadata', 'wallet_id', 'amount', 'type'],
    InvestmentPlan: ['returnPercentage', 'roi_min_pct', 'duration', 'min_duration_days', 'name', 'active'],
    investment_plans: ['return_percentage', 'roi_min_pct', 'duration', 'min_duration_days', 'name', 'active'],
    User: ['kycStatus', 'kyc_status', 'kycDocument', 'kyc_document', 'email', 'id'],
    users: ['kyc_status', 'kyc_document', 'email', 'id'],
    Profile: ['userId', 'kycStatus', 'kycLevel'],
    profiles: ['user_id', 'kyc_status', 'kyc_level'],
    Wallet: ['userId', 'user_id', 'balance', 'currency'],
    wallets: ['user_id', 'balance', 'currency'],
    Setting: ['key', 'value'],
    settings: ['key', 'value'],
    Performance: ['weekEnding', 'streamRois'],
    performance: ['week_ending', 'stream_rois'],
    ProfitLog: ['investmentId', 'amount', 'weekEnding'],
    profit_logs: ['investment_id', 'amount', 'week_ending'],
    Notification: ['userId', 'type', 'title', 'message', 'read'],
    notifications: ['user_id', 'type', 'title', 'message', 'read'],
    NotificationDelivery: ['notificationId', 'userId', 'channel', 'status'],
    notification_deliveries: ['notification_id', 'user_id', 'channel', 'status'],
    AdminAction: ['userId', 'action', 'status', 'approvedBy'],
    admin_actions: ['user_id', 'action', 'status', 'approved_by'],
    PorAudit: ['adminId', 'publishedAt', 'coveragePct'],
    por_audit: ['admin_id', 'published_at', 'coverage_pct']
  }

  const results: Record<string, any> = {}

  try {
      for (const [table, columns] of Object.entries(schemaChecks)) {
        results[table] = {
            exists: false,
            columns: {} as Record<string, boolean>,
            errors: [] as string[]
        }
        
        // 1. Check if table exists and get a row
        const { data: rows, error: tableError } = await supabaseServer.from(table).select('*').limit(1)
        
        if (tableError) {
            results[table].error = tableError.message
            continue
        }

        results[table].exists = true

        // 2. If we have data, we can see what columns exist directly
        if (rows && rows.length > 0) {
            const row = rows[0]
            results[table].hasRows = true
            const actualColumns = Object.keys(row)
            
            for (const col of columns) {
                results[table].columns[col] = actualColumns.includes(col)
            }
        } else {
            // 3. If table is empty, we must try to select each column individually to see if it errors
            results[table].hasRows = false
            for (const col of columns) {
                const { error: colError } = await supabaseServer.from(table).select(col).limit(1)
                // If error is "Could not find the 'xxx' column", then it doesn't exist
                if (colError && (colError.message.includes('Could not find') || colError.message.includes('does not exist'))) {
                    results[table].columns[col] = false
                } else if (colError) {
                    // Other error (e.g. permissions), assume risky but record error
                    results[table].columns[col] = 'unknown'
                    results[table].errors.push(`${col}: ${colError.message}`)
                } else {
                    results[table].columns[col] = true
                }
            }
        }
      }

      return new Response(JSON.stringify(results, null, 2), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' } 
      })
  } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
