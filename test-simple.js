// Simple test to check API response
fetch('http://localhost:3000/api/user/deposit', {
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
.then(response => {
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  return response.json();
})
.then(data => {
  console.log('Response Data:', data);
})
.catch(error => {
  console.error('Error:', error);
});