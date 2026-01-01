
import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dns from 'dns'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Deployment Pre-flight Checks...')

// 1. Environment Variable Check
console.log('\n📦 Checking Environment Variables...')
const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL'
]

const missingVars: string[] = []
requiredVars.forEach(v => {
    if (!process.env[v]) missingVars.push(v)
})

if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Missing Environment Variables: ${missingVars.join(', ')}`)
    process.exit(1)
} else {
    console.log('\x1b[32m%s\x1b[0m', '✅ All required environment variables present.')
}

// 2. Supabase Connection Check
console.log('\n🔌 Checking Supabase Connection...')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabase() {
    try {
        // DNS Check first
        const domain = supabaseUrl.replace('https://', '').split('/')[0]
        await new Promise((resolve, reject) => {
            dns.lookup(domain, (err) => {
                if (err) reject(err)
                else resolve(true)
            })
        })
        console.log('\x1b[32m%s\x1b[0m', '✅ Supabase DNS resolved.')

        // Auth Admin Check
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
        if (authError) throw new Error(`Auth Admin Failed: ${authError.message}`)
        console.log('\x1b[32m%s\x1b[0m', '✅ Supabase Auth Admin connection successful.')

        // Table Check (User vs users)
        let publicUserTable = 'User'
        const { error: userError } = await supabase.from('User').select('count', { count: 'exact', head: true })
        if (userError) {
            console.log('⚠️  "User" table access failed, checking "users"...')
            const { error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true })
            if (usersError) throw new Error(`Neither "User" nor "users" table is accessible. Schema error.`)
            publicUserTable = 'users'
        }
        console.log('\x1b[32m%s\x1b[0m', `✅ Public User table found: "${publicUserTable}"`)

        // Wallet Check
        const { error: walletError } = await supabase.from('Wallet').select('count', { count: 'exact', head: true })
        if (walletError) throw new Error(`Wallet table check failed: ${walletError.message}`)
        console.log('\x1b[32m%s\x1b[0m', '✅ Wallet table accessible.')

        // SupportTicket Check
        let supportTable = 'SupportTicket'
        const { error: supportError } = await supabase.from('SupportTicket').select('count', { count: 'exact', head: true })
        if (supportError) {
             console.log('⚠️  "SupportTicket" table access failed, checking "support_tickets"...')
             const { error: stError } = await supabase.from('support_tickets').select('count', { count: 'exact', head: true })
             if (stError) throw new Error(`Neither "SupportTicket" nor "support_tickets" table is accessible. Run 'prisma/migrations/20240101_init_support_tickets.sql' to fix.`)
             supportTable = 'support_tickets'
        }
        console.log('\x1b[32m%s\x1b[0m', `✅ SupportTicket table found: "${supportTable}"`)

        // Reply Check
        let replyTable = 'Reply'
        const { error: replyError } = await supabase.from('Reply').select('count', { count: 'exact', head: true })
        if (replyError) {
             console.log('⚠️  "Reply" table access failed, checking "replies"...')
             const { error: rError } = await supabase.from('replies').select('count', { count: 'exact', head: true })
             if (rError) throw new Error(`Neither "Reply" nor "replies" table is accessible. Run 'prisma/migrations/20240101_init_support_tickets.sql' to fix.`)
             replyTable = 'replies'
        }
        console.log('\x1b[32m%s\x1b[0m', `✅ Reply table found: "${replyTable}"`)

        // Profit Engine Tables Check
        const { error: planError } = await supabase.from('Plan').select('count', { count: 'exact', head: true })
        if (planError) {
             console.log('⚠️  "Plan" table access failed, checking "plans"...')
             const { error: pError } = await supabase.from('plans').select('count', { count: 'exact', head: true })
             if (pError) throw new Error(`Neither "Plan" nor "plans" table is accessible. Profit Engine requires this table.`)
             console.log('\x1b[32m%s\x1b[0m', `✅ Plan table found: "plans"`)
        } else {
             console.log('\x1b[32m%s\x1b[0m', `✅ Plan table found: "Plan"`)
        }

        const { error: invError } = await supabase.from('Investment').select('count', { count: 'exact', head: true })
        if (invError) {
             console.log('⚠️  "Investment" table access failed, checking "investments"...')
             const { error: iError } = await supabase.from('investments').select('count', { count: 'exact', head: true })
             if (iError) throw new Error(`Neither "Investment" nor "investments" table is accessible. Profit Engine requires this table.`)
             console.log('\x1b[32m%s\x1b[0m', `✅ Investment table found: "investments"`)
        } else {
             console.log('\x1b[32m%s\x1b[0m', `✅ Investment table found: "Investment"`)
        }

        // Manual Credits Config
        const manualCredits = process.env.ENABLE_MANUAL_CREDITS === 'true'
        if (manualCredits) {
            console.log('\x1b[32m%s\x1b[0m', '✅ Manual Credits Enabled (ENABLE_MANUAL_CREDITS=true)')
        } else {
            console.log('\x1b[33m%s\x1b[0m', '⚠️  Manual Credits Disabled (ENABLE_MANUAL_CREDITS is not "true")')
        }

    } catch (e: any) {
        console.error('\x1b[31m%s\x1b[0m', `❌ Supabase Check Failed: ${e.message}`)
        process.exit(1)
    }
}

// 3. Domain Configuration Check
console.log('\n🌐 Checking Domain Configuration...')
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
if (siteUrl?.includes('localhost')) {
    console.log('\x1b[33m%s\x1b[0m', `⚠️  NEXT_PUBLIC_SITE_URL is set to localhost (${siteUrl}). Ensure this is updated for production.`)
} else {
    console.log('\x1b[32m%s\x1b[0m', `✅ NEXT_PUBLIC_SITE_URL is set to: ${siteUrl}`)
}

// Run checks
checkSupabase().then(() => {
    console.log('\n✨ \x1b[32mPre-flight check completed successfully! System is ready for deployment.\x1b[0m ✨')
    process.exit(0)
})
