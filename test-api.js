// Simple test script for deposit/withdraw APIs
async function testAPI() {
  const baseUrl = 'http://localhost:3000';
  
  // Test deposit endpoint
  console.log('Testing deposit endpoint...');
  try {
    const depositResponse = await fetch(`${baseUrl}/api/user/deposit`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'USD',
        provider: 'test',
        planId: 'starter'
      })
    });
    
    const depositData = await depositResponse.json();
    console.log('Deposit response:', depositResponse.status, depositData);
  } catch (error) {
    console.error('Deposit error:', error.message);
  }
  
  // Test withdraw endpoint
  console.log('\nTesting withdraw endpoint...');
  try {
    const withdrawResponse = await fetch(`${baseUrl}/api/user/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 50,
        currency: 'USD',
        type: 'WITHDRAWAL',
        walletAddress: 'test-address'
      })
    });
    
    const withdrawData = await withdrawResponse.json();
    console.log('Withdraw response:', withdrawResponse.status, withdrawData);
  } catch (error) {
    console.error('Withdraw error:', error.message);
  }
}

// Wait for server to be ready
setTimeout(testAPI, 3000);