// Test the API endpoints with proper error handling
async function testAPIs() {
  try {
    console.log('Testing deposit API without auth...');
    const depositResponse = await fetch('http://localhost:3000/api/user/deposit', {
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
    });
    
    console.log('Deposit Response Status:', depositResponse.status);
    console.log('Deposit Response Headers:', Object.fromEntries(depositResponse.headers.entries()));
    
    if (depositResponse.ok) {
      const data = await depositResponse.json();
      console.log('Deposit Response Data:', data);
    } else {
      const errorText = await depositResponse.text();
      console.log('Deposit Error Response:', errorText);
    }
    
    console.log('\n---\n');
    
    console.log('Testing withdraw API without auth...');
    const withdrawResponse = await fetch('http://localhost:3000/api/user/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind: 'withdraw',
        amount: 50,
        currency: 'USD'
      })
    });
    
    console.log('Withdraw Response Status:', withdrawResponse.status);
    console.log('Withdraw Response Headers:', Object.fromEntries(withdrawResponse.headers.entries()));
    
    if (withdrawResponse.ok) {
      const data = await withdrawResponse.json();
      console.log('Withdraw Response Data:', data);
    } else {
      const errorText = await withdrawResponse.text();
      console.log('Withdraw Error Response:', errorText);
    }
    
  } catch (error) {
    console.error('Network or other error:', error);
  }
}

testAPIs();