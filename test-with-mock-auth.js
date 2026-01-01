// Test with mock authentication token
async function testWithMockAuth() {
  try {
    console.log('Testing deposit with mock authentication token...');
    
    // Create a mock Bearer token (this won't work but will show us the next error)
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    const response = await fetch('http://localhost:3002/api/user/deposit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockToken}`,
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
      console.log('Token validation failed - this is expected with a mock token');
    } else if (response.status === 403) {
      console.log('Forbidden - user lacks proper permissions');
    } else if (!response.ok) {
      console.error('Other error:', data);
      if (data.error === 'init_failed') {
        console.log('Paystack initialization failed - this would be the next step to fix');
      }
    } else {
      console.log('Success! This would mean everything is working:', data);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

testWithMockAuth();