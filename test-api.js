const crypto = require('crypto');

// First, log in to get a token
async function testAPI() {
  try {
    // Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);
    
    if (!loginData.token) {
      console.error('No token received');
      return;
    }
    
    const token = loginData.token;
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Now test friends API
    const friendsRes = await fetch('http://localhost:5000/api/friends/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Friends API status:', friendsRes.status);
    console.log('Friends API headers:', Object.fromEntries(friendsRes.headers));
    
    const friendsData = await friendsRes.json();
    console.log('Friends data:', JSON.stringify(friendsData, null, 2).substring(0, 500));
    console.log('Total friends returned:', friendsData.length);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testAPI();
