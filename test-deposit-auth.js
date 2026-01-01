// Test deposit with proper authentication
async function testDepositWithAuth() {
  try {
    console.log('Getting authentication token...');
    
    // First, let's try to get a real token by simulating a login
    // For now, let's test with the actual API to see the Paystack error
    
    console.log('Testing deposit with minimal data...');
    const response = await fetch('http://localhost:3002/api/user/deposit', {
      method: 'POST',
      headers: {
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
    
    if (response.status === 401) {
      console.log('Expected: Authentication required');
      console.log('This means the API is working - it just needs a valid token');
    } else if (!response.ok) {
      console.error('Error response:', data);
      if (data.error === 'init_failed') {
        console.log('Paystack initialization failed - this is the error we need to fix');
      }
    } else {
      console.log('Success! Authorization URL:', data.authorizationUrl);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

testDepositWithAuth();