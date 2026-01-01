
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(url, key)

async function check() {
  console.log('Checking Investment columns via insert...')
  const id = 'test-' + Date.now()
  // Need a valid userId and planId if FKs exist
  // Let's try to fetch a user and plan first
  const { data: users } = await supabase.from('User').select('id').limit(1)
  const { data: plans } = await supabase.from('InvestmentPlan').select('id').limit(1)
  
  if (!users?.length || !plans?.length) {
      console.log('Cannot test insert: No users or plans found to satisfy FKs')
      return
  }
  
  const userId = users[0].id
  const planId = plans[0].id

  console.log('Testing "amount" column...')
   const { error: errAmount } = await supabase.from('Investment').insert({
       id: id + '-amount', userId, planId, amount: 100, status: 'PENDING',
       updatedAt: new Date().toISOString() // Try adding updatedAt here too just in case
   })
   
   if (errAmount) {
       console.log('Insert with "amount" failed:', errAmount.message)
   } else {
       console.log('SUCCESS: "amount" column exists!')
       await supabase.from('Investment').delete().eq('id', id + '-amount')
   }

   console.log('Testing "principal" + "startDate" + "updatedAt" column...')
   const { error: errPrincipal } = await supabase.from('Investment').insert({
       id: id + '-principal', userId, planId, principal: 100, status: 'PENDING',
       startDate: new Date().toISOString(),
       updatedAt: new Date().toISOString()
   })
   if (errPrincipal) {
       console.log('Insert with "principal"+"startDate"+"updatedAt" failed:', errPrincipal.message)
   } else {
       console.log('SUCCESS: "principal"+"startDate"+"updatedAt" worked!')
       await supabase.from('Investment').delete().eq('id', id + '-principal')
   }
}

check()
