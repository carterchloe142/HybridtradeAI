// Test if server is running
async function testServer() {
  try {
    console.log('Testing server on localhost:3000...');
    
    const response = await fetch('http://localhost:3000');
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    if (response.status === 404) {
      console.log('Server is running but returning 404 - checking routes...');
    } else if (response.status === 200) {
      console.log('Server is running successfully!');
    } else {
      console.log('Server returned status:', response.status);
    }
    
    // Test specific routes
    const routes = ['/deposit', '/api/user/deposit', '/login', '/'];
    
    for (const route of routes) {
      try {
        const routeResponse = await fetch(`http://localhost:3000${route}`);
        console.log(`${route}: ${routeResponse.status}`);
      } catch (error) {
        console.log(`${route}: Failed - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Server not running or connection failed:', error.message);
    console.log('Please start the server with: npm run dev');
  }
}

testServer();