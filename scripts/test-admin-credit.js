
const fetch = require('node-fetch'); // Assuming node-fetch is available or using global fetch in Node 18+

async function testAdminCredit() {
  console.log('Testing /api/admin/credit-user security...');
  
  try {
    // 1. Test without token
    console.log('1. Testing without token...');
    const resNoToken = await fetch('http://localhost:3000/api/admin/credit-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '123', amount: 100 })
    });
    
    if (resNoToken.status === 401) {
      console.log('✅ Passed: Rejected with 401 (Missing token)');
    } else {
      const text = await resNoToken.text();
      console.log(`❌ Failed: Expected 401, got ${resNoToken.status}. Body: ${text}`);
    }

    // 2. Test with invalid token
    console.log('2. Testing with invalid token...');
    const resInvalid = await fetch('http://localhost:3000/api/admin/credit-user', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token_123'
      },
      body: JSON.stringify({ userId: '123', amount: 100 })
    });

    if (resInvalid.status === 401) {
      console.log('✅ Passed: Rejected with 401 (Invalid token)');
    } else {
      const text = await resInvalid.text();
      console.log(`❌ Failed: Expected 401, got ${resInvalid.status}. Body: ${text}`);
    }

  } catch (err) {
    console.error('Test failed with error:', err);
  }
}

testAdminCredit();
