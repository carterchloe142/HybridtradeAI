// Test API endpoints
async function testDepositAPI() {
  try {
    console.log('Testing deposit API...')
    
    // First, let's test without authentication to see the error
    const response1 = await fetch('http://localhost:3000/api/user/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 500,
        currency: 'NGN',
        provider: 'paystack',
        planId: 'starter',
        autoActivate: true
      })
    })
    
    console.log('Response status (no auth):', response1.status)
    const data1 = await response1.json()
    console.log('Response data (no auth):', data1)
    
    // Now test with a mock token to see if authentication works
    const response2 = await fetch('http://localhost:3000/api/user/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      },
      body: JSON.stringify({
        amount: 500,
        currency: 'NGN',
        provider: 'paystack',
        planId: 'starter',
        autoActivate: true
      })
    })
    
    console.log('Response status (fake auth):', response2.status)
    const data2 = await response2.json()
    console.log('Response data (fake auth):', data2)
    
  } catch (error) {
    console.error('Error testing deposit API:', error)
  }
}

async function testWithdrawAPI() {
  try {
    console.log('Testing withdraw API...')
    
    const response = await fetch('http://localhost:3000/api/user/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      },
      body: JSON.stringify({
        kind: 'withdraw',
        amount: 50,
        currency: 'USD'
      })
    })
    
    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', data)
    
  } catch (error) {
    console.error('Error testing withdraw API:', error)
  }
}

// Run tests
testDepositAPI().then(() => testWithdrawAPI())