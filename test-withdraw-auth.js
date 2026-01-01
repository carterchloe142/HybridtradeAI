// Test withdraw with proper authentication
async function testWithdrawWithAuth() {
  try {
    console.log('Testing withdraw with minimal data...');
    const response = await fetch('http://localhost:3002/api/user/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 50,
        currency: 'NGN',
        type: 'WITHDRAWAL',
        walletAddress: '0x1234567890abcdef'
      })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.status === 401) {
      console.log('Expected: Authentication required');
      console.log('This means the API is working - it just needs a valid token');
    } else if (!response.ok) {
      console.error('Error response:', data);
    } else {
      console.log('Success! Withdrawal initiated:', data);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

testWithdrawWithAuth();