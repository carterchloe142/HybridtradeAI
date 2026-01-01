// Check environment and test Paystack
console.log('Environment check:');
console.log('PAYSTACK_SECRET_KEY exists:', !!process.env.PAYSTACK_SECRET_KEY);
console.log('PAYSTACK_SECRET_KEY length:', process.env.PAYSTACK_SECRET_KEY?.length);

// Test with the actual key
const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

if (!paystackSecret) {
  console.error('❌ PAYSTACK_SECRET_KEY is missing!');
  console.log('Please check your .env.local file');
  process.exit(1);
}

console.log('Testing Paystack with key:', paystackSecret.substring(0, 10) + '...');

// Test Paystack API directly
fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${paystackSecret}`,
  },
  body: JSON.stringify({
    amount: 10000,
    email: 'test@example.com',
    currency: 'NGN'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Paystack response:', JSON.stringify(data, null, 2));
  
  if (data.status === true) {
    console.log('✅ Paystack API is working!');
    console.log('Authorization URL:', data.data.authorization_url);
  } else {
    console.log('❌ Paystack API error:', data.message);
  }
})
.catch(error => {
  console.error('Network error:', error.message);
});