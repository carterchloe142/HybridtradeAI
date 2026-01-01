
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import crypto from 'crypto'

// Load envs
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('URL:', url)
console.log('Key length:', serviceKey?.length)

if (!url || !serviceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(url, serviceKey)

async function run() {
    console.log('--- Fetching one transaction from "Transaction" table ---')
    // Note: Supabase/PostgREST might need exact casing in quotes if it was created that way.
    // But via JS client, we just pass the string.
    
    // Try "Transaction"
    const { data: rows, error: fetchErr } = await supabase.from('Transaction').select('*').limit(1)
    
    if (fetchErr) {
        console.error('Fetch "Transaction" Error:', fetchErr)
    } else {
        if (rows && rows.length > 0) {
            console.log('Row keys from "Transaction":', Object.keys(rows[0]))
        } else {
            console.log('No rows in "Transaction", but table exists.')
        }
    }

    console.log('\n--- Checking "Wallet" table ---')
    const { data: wallets, error: wErr } = await supabase.from('Wallet').select('*').limit(1)
    if (wErr) console.error('Fetch "Wallet" Error:', wErr)
    else if (wallets && wallets.length > 0) console.log('Row keys from "Wallet":', Object.keys(wallets[0]))

    // Check User table
    console.log('\nChecking User table...')
    const { data: users, error: userError } = await supabase
        .from('User')
        .select('*')
        .limit(1)
    
    if (userError) {
        console.error('User table error:', userError.message)
    } else {
        console.log('Found User table (PascalCase)')
        if (users && users.length > 0) console.log('User columns:', Object.keys(users[0]))
    }

    // Check Profile table
    console.log('\nChecking Profile table...')
    const { data: profilesLow, error: profileLowError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
    
    if (profileLowError) {
        console.error('profiles table error:', profileLowError.message)
    } else {
        console.log('Found profiles table (lowercase)')
        if (profilesLow && profilesLow.length > 0) console.log('profiles columns:', Object.keys(profilesLow[0]))
    }

    // Check Investment table
    console.log('\nChecking Investment table...')
    const { data: inv, error: invError } = await supabase
        .from('Investment')
        .select('*')
        .limit(1)
    
    if (invError) {
        console.error('Investment table error:', invError.message)
         // Try lowercase
        const { data: invLow, error: invLowError } = await supabase
            .from('investments')
            .select('*')
            .limit(1)
        if (invLowError) console.error('investments table error:', invLowError.message)
        else console.log('Found investments table (lowercase)')
    } else {
        console.log('Found Investment table (PascalCase)')
        if (inv && inv.length > 0) console.log('Investment columns:', Object.keys(inv[0]))
    }

    // Check ReserveBuffer table
    console.log('\nChecking ReserveBuffer table...')
    const { data: rb, error: rbError } = await supabase
        .from('ReserveBuffer')
        .select('*')
        .limit(1)
    
    if (rbError) {
        console.error('ReserveBuffer table error:', rbError.message)
         // Try lowercase
        const { data: rbLow, error: rbLowError } = await supabase
            .from('reserve_buffer')
            .select('*')
            .limit(1)
        if (rbLowError) console.error('reserve_buffer table error:', rbLowError.message)
        else console.log('Found reserve_buffer table (lowercase)')
    } else {
        console.log('Found ReserveBuffer table (PascalCase)')
        if (rb && rb.length > 0) console.log('ReserveBuffer columns:', Object.keys(rb[0]))
    }

    // Check Notification table
    console.log('\nChecking Notification table...')
    const { data: notif, error: notifError } = await supabase
        .from('Notification')
        .select('*')
        .limit(1)
    
    if (notifError) {
        console.error('Error checking Notification:', notifError.message)
    } else {
        console.log('Success: Found', notif.length, 'rows in Notification')
        if (notif.length > 0) {
            console.log('Sample row keys:', Object.keys(notif[0]).join(', '))
        }
    }

    // Check Performance table columns by attempting insert (transactional/rollback if possible, or just delete after)
    console.log('\nTesting Performance table insertion...')
    const testId = crypto.randomUUID()
    const testPayload = { 
        id: testId,
        weekEnding: new Date().toISOString(),
         streamRois: { "test": 1.5 }, // Valid payload
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
     }
     
     // First try just the known columns from Prisma schema to confirm basic access
    const { error: insertError1 } = await supabase
        .from('Performance')
        .insert(testPayload)
    
    if (insertError1) {
        console.error('Insert Performance failed:', insertError1.message)
    } else {
        console.log('Insert Performance SUCCESS')
        // Cleanup
        await supabase.from('Performance').delete().eq('id', testId)
    }

    // Check Notification table insertion
     console.log('\nTesting Notification table insertion...')
     const notifId = crypto.randomUUID()
     const notifPayload = {
         id: notifId,
         // userId: '...', 
         // Try PascalCase Type?
         // type: 'test_debug', 
         Type: 'test_debug',
         title: 'Debug',
         message: 'Debug message',
         read: false,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString() // Add updatedAt just in case
     }
 
     const { error: notifInsError } = await supabase.from('Notification').insert(notifPayload)
     if (notifInsError) {
         console.error('Insert Notification failed:', notifInsError.message)
         
         // Try lowercase 'type' again but maybe with updatedAt?
         console.log('Retrying with lowercase type and updatedAt...')
         const { error: retryErr } = await supabase.from('Notification').insert({
             ...notifPayload,
             Type: undefined,
             type: 'test_debug'
         })
         if (retryErr) console.error('Retry failed:', retryErr.message)
         else {
             console.log('Retry SUCCESS (lowercase type + updatedAt)')
             await supabase.from('Notification').delete().eq('id', notifId)
         }
     } else {
         console.log('Insert Notification SUCCESS (with PascalCase Type)')
    await supabase.from('Notification').delete().eq('id', notifId)
}

// Check Transaction metadata column
console.log('\nTesting Transaction metadata column...')
const txId = crypto.randomUUID()
const txPayload = {
    id: txId,
    userId: 'test_user', // This might fail foreign key constraint if user doesn't exist.
    // So we need a valid user id.
    // We can try to fetch one user first.
    type: 'DEPOSIT',
    amount: 10,
    status: 'PENDING',
    metadata: { test: 123 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
}

// We need a valid user ID.
const { data: existingUsers } = await supabase.from('User').select('id').limit(1)
let targetUserId = existingUsers && existingUsers.length > 0 ? existingUsers[0].id : crypto.randomUUID()

console.log(`Using userId: ${targetUserId}`)
txPayload.userId = targetUserId

const { error: txError } = await supabase.from('Transaction').insert(txPayload)

if (txError) {
    console.error('Insert Transaction failed:', txError.message)
    if (txError.message.includes('foreign key constraint') || txError.message.includes('violates foreign key')) {
        console.log('Failure is due to FK, which means metadata column likely exists!')
    }
} else {
    console.log('Insert Transaction SUCCESS (metadata column exists)')
    await supabase.from('Transaction').delete().eq('id', txId)
}

// Inspect columns for a table by fetching an empty result but looking at the error or data structure if possible.
    // Better: insert a dummy row with known invalid column to see error?
    // Or: We can use the 'rpc' if available, or just guess.
    // Actually, in the previous run, we saw 'profiles columns: [...]'. How was that done?
    // Ah, it was:
    /*
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('*').limit(1)
    if (profiles && profiles.length > 0) {
        console.log('profiles columns:', Object.keys(profiles[0]))
    }
    */
    // If table is empty, we can't get columns this way.
    // But we can try to Insert and parse the error "Could not find the '...' column".

    async function checkColumns(tableName: string) {
        console.log(`\n--- Checking columns for ${tableName} ---`)
        // Try to select *
        const { data, error } = await supabase.from(tableName).select('*').limit(1)
        if (error) {
            console.log(`Error selecting from ${tableName}:`, error.message)
        } else if (data && data.length > 0) {
            console.log(`${tableName} columns (from row):`, Object.keys(data[0]))
        } else {
            console.log(`${tableName} is empty. Can't list columns via SELECT.`)
            // Try to insert a dummy object with many potential columns to see which ones are rejected?
            // No, Supabase/PostgREST usually fails if ANY column is invalid in the payload.
            // But we want to know if 'metadata' exists in Transaction.
            // We already know it failed.
        }
    }

    await checkColumns('Transaction')
    await checkColumns('WalletTransaction')
    await checkColumns('Notification')
     await checkColumns('Performance')

     // Check Transaction columns by inserting CLEAN one (no metadata)
     console.log('\nChecking Transaction columns (clean)...')
     const cleanTxId2 = crypto.randomUUID()
     const cleanPayload2 = {
         id: cleanTxId2,
         userId: targetUserId,
         type: 'DEPOSIT',
         amount: 10,
         status: 'PENDING',
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
     }
     const { data: cleanTx2, error: cleanErr2 } = await supabase.from('Transaction').insert(cleanPayload2).select().single()
     if (cleanErr2) {
         console.log('Clean insert Transaction failed:', cleanErr2.message)
     } else {
         console.log('Clean insert Transaction SUCCESS. Columns:', Object.keys(cleanTx2))
         await supabase.from('Transaction').delete().eq('id', cleanTxId2)
     }

     // Check WalletTransaction columns by inserting CLEAN one
     console.log('\nChecking WalletTransaction columns (clean)...')
     const wtId5 = crypto.randomUUID()
     const wtPayload5 = {
         id: wtId5,
         walletId: 'dummy', 
         amount: 10,
         type: 'DEPOSIT',
         createdAt: new Date().toISOString()
     }
     const { data: wtClean, error: wtCleanErr } = await supabase.from('WalletTransaction').insert(wtPayload5).select().single()
     if (wtCleanErr) {
         console.log('Clean insert WalletTransaction failed:', wtCleanErr.message)
     } else {
         console.log('Clean insert WalletTransaction SUCCESS. Columns:', Object.keys(wtClean))
         await supabase.from('WalletTransaction').delete().eq('id', wtId5)
     }
 }

run()
