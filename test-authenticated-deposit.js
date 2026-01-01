// Test with proper Supabase authentication
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wdlcttgfwoejqynlylpv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbGN0dGdmd29lanF5bmx5bHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODE0MzAsImV4cCI6MjA3ODQ1NzQzMH0.UZaY0iYoVRS5MioS5Clg6y_CVNdgzm-3OdB_cwWuB8E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthenticatedDeposit() {
  try {
    console.log('Testing deposit with authentication...');
    
    // Try to get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', sessionData);
    
    if (sessionError) {
      console.log('Session error:', sessionError);
    }
    
    // If no session, try to sign in with a test account
    if (!sessionData.session) {
      console.log('No active session, attempting test sign in...');
      // Note: This would require a valid test user account
      console.log('Please ensure you are logged in to the application first');
      return;
    }
    
    const token = sessionData.session.access_token;
    console.log('Using token:', token.substring(0, 20) + '...');
    
    // Test deposit with proper authentication
    const response = await fetch('http://localhost:3000/api/user/deposit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    
    if (!response.ok) {
      console.error('Deposit failed:', data);
      if (data.error === 'init_failed') {
        console.log('Paystack initialization failed - details:', data.details);
      }
    } else {
      console.log('Deposit successful!');
      console.log('Authorization URL:', data.authorizationUrl);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

testAuthenticatedDeposit();