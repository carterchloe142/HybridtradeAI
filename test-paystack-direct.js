// Direct Paystack API test to see what's happening
async function testPaystackDirectly() {
  console.log('Testing Paystack API directly...');
  
  // Test the Paystack API directly with our key
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  console.log('Paystack key configured:', !!paystackSecret);
  
  if (!paystackSecret) {
    console.error('PAYSTACK_SECRET_KEY is not configured!');
    return;
  }
  
  try {
    console.log('Calling Paystack API directly...');
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paystackSecret}`,
      },
      body: JSON.stringify({
        amount: 10000, // 100 NGN in kobo
        email: 'test@example.com',
        currency: 'NGN',
        metadata: { test: true }
      })
    });
    
    console.log('Paystack response status:', response.status);
    
    const data = await response.json();
    console.log('Paystack response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Paystack API error:', data);
      if (data.message) {
        console.error('Error message:', data.message);
      }
      if (data.status === false) {
        console.error('Paystack status false - reason:', data.message);
      }
    } else {
      console.log('Paystack API working correctly!');
      console.log('Authorization URL:', data.data.authorization_url);
      console.log('Reference:', data.data.reference);
    }
    
  } catch (error) {
    console.error('Network error calling Paystack:', error.message);
  }
}

testPaystackDirectly();