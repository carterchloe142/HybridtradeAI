// Wait a moment and test the server
setTimeout(async () => {
  try {
    console.log('Testing server on port 3003...');
    
    const response = await fetch('http://localhost:3003');
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    if (response.status === 404) {
      console.log('Server is running but returning 404');
      console.log('This might be normal if there\'s no root route');
    } else if (response.status === 200) {
      console.log('Server is running successfully!');
    } else {
      console.log('Server returned status:', response.status);
    }
    
    // Test the deposit page specifically
    console.log('\nTesting deposit page...');
    const depositResponse = await fetch('http://localhost:3003/deposit');
    console.log('Deposit page status:', depositResponse.status);
    
    if (depositResponse.status === 200) {
      console.log('✅ Deposit page is working!');
    } else {
      console.log('❌ Deposit page returned:', depositResponse.status);
    }
    
  } catch (error) {
    console.error('Server connection failed:', error.message);
    console.log('Server might not be ready yet or running on a different port');
  }
}, 3000); // Wait 3 seconds for server to start