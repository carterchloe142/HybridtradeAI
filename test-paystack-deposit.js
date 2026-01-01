// Test deposit with Paystack
async function testDeposit() {
  try {
    console.log('Testing deposit with Paystack...');
    
    // First, let's test the Paystack initialization directly
    const response = await fetch('http://localhost:3000/api/user/deposit', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'NGN',
        provider: 'paystack',
        planId: 'starter',
        autoActivate: true
      })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('Error response:', data);
    } else {
      console.log('Success! Authorization URL:', data.authorizationUrl);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

testDeposit();