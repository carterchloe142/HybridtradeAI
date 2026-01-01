// Detailed Paystack initialization test
async function testPaystackInit() {
  try {
    console.log('Testing Paystack initialization with detailed logging...');
    
    // Test the deposit API endpoint directly
    const response = await fetch('http://localhost:3000/api/user/deposit', {
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
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Full response data:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('Authentication required - this is expected without valid token');
    } else if (!response.ok) {
      console.error('API Error:', data);
      if (data.error === 'init_failed') {
        console.log('Paystack initialization failed');
        console.log('Error details:', data.details);
      }
    } else {
      console.log('Success! Paystack initialization worked');
      console.log('Authorization URL:', data.authorizationUrl);
      console.log('Reference:', data.reference);
    }
    
  } catch (error) {
    console.error('Network or parsing error:', error);
  }
}

// Also test if Paystack keys are properly configured
function checkPaystackConfig() {
  console.log('\nChecking Paystack configuration...');
  console.log('PAYSTACK_SECRET_KEY exists:', !!process.env.PAYSTACK_SECRET_KEY);
  console.log('PAYSTACK_PUBLIC_KEY exists:', !!process.env.PAYSTACK_PUBLIC_KEY);
  console.log('PAYSTACK_WEBHOOK_SECRET exists:', !!process.env.PAYSTACK_WEBHOOK_SECRET);
}

checkPaystackConfig();
testPaystackInit();