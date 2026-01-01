// Test with correct port and detailed logging
async function testPaystackDetailed() {
  try {
    console.log('Testing Paystack with detailed logging...');
    console.log('Server running on port 3001');
    
    // Test without authentication first to see the detailed error
    const response = await fetch('http://localhost:3001/api/user/deposit', {
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
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('Expected: Authentication required');
    } else if (!response.ok) {
      console.error('API Error:', data);
      if (data.error === 'init_failed') {
        console.log('Paystack initialization failed');
        console.log('Full error details:', data.details);
        
        // Check if it's a Paystack API error
        if (data.details) {
          console.log('Paystack error message:', data.details.message);
          console.log('Paystack error status:', data.details.status);
        }
      }
    } else {
      console.log('Success! Paystack initialization worked');
      console.log('Authorization URL:', data.authorizationUrl);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

testPaystackDetailed();