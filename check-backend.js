const http = require('http');

// Try to connect to port 5000
http.get('http://localhost:5000/api/health', (res) => {
  console.log('Backend on 5000 is responding:', res.statusCode);
  
  // Try to access friends endpoint
  http.get('http://localhost:5000/api/friends/all', (res) => {
    console.log('Friends endpoint status:', res.statusCode);
    if (res.statusCode === 404) {
      console.log('\n⚠️ Friends route not loaded. Backend needs restart.');
      console.log('To fix: Manually close node.exe in Task Manager for PID 3228');
      console.log('Then run: cd backend && npm start');
    } else {
      console.log('✅ Friends route is loaded!');
    }
  }).on('error', (e) => {
    console.error('Friends endpoint error:', e.message);
  });
}).on('error', (e) => {
  console.error('Could not reach backend:', e.message);
});
