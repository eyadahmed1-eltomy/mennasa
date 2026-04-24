// Test script to verify friends API directly
async function testFriendsAPI() {
  console.log('=== Testing Friends API ===\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthRes = await fetch('http://localhost:5000/api/health');
    console.log('✅ Backend is running:', healthRes.status);
  } catch (e) {
    console.error('❌ Backend not responding:', e.message);
    return;
  }
  
  // Test 2: Try to login first
  console.log('\n2️⃣ Testing login to get token...');
  let token = null;
  try {
    const loginRes = await fetch('https://vel0ra.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user1@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    
    if (loginData.token) {
      token = loginData.token;
      console.log('✅ Login successful, got token:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Login failed:', loginData);
      
      // Try another user
      console.log('   Trying another email...');
      const loginRes2 = await fetch('https://vel0ra.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'john@example.com', password: 'password123' })
      });
      const loginData2 = await loginRes2.json();
      if (loginData2.token) {
        token = loginData2.token;
        console.log('✅ Login successful with john@example.com');
      }
    }
  } catch (e) {
    console.error('❌ Login error:', e.message);
  }
  
  if (!token) {
    console.log('\n⚠️ Could not get token, skipping friends API test');
    return;
  }
  
  // Test 3: Friends API
  console.log('\n3️⃣ Testing /api/friends/all...');
  try {
    const friendsRes = await fetch('https://vel0ra.vercel.app/api/friends/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📊 Response status:', friendsRes.status);
    
    if (friendsRes.ok) {
      const data = await friendsRes.json();
      console.log('✅ Success! Got', data.length, 'users');
      if (data.length > 0) {
        console.log('   Sample user:', data[0]);
      }
    } else {
      const errorText = await friendsRes.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (e) {
    console.error('❌ Friends API error:', e.message);
  }
}

// Run the test
testFriendsAPI();
