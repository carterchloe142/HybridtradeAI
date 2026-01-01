// Test the actual deposit functionality through the web interface
async function testDepositUI() {
  try {
    console.log('Testing deposit functionality...');
    
    // Test a small deposit to see if Paystack initializes
    const response = await fetch('http://localhost:3001/api/user/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add a dummy auth header to trigger the authentication check
        'Authorization': 'Bearer dummy-token-for-testing'
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
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('Authentication required - this is expected');
      console.log('The API is working, just needs proper authentication');
    } else if (data.error === 'init_failed') {
      console.log('Paystack initialization failed');
      console.log('Error details:', data.details);
    } else if (response.ok) {
      console.log('Success! Paystack should work now');
      console.log('Authorization URL:', data.authorizationUrl);
    } else {
      console.log('Other error:', data);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

testDepositUI();