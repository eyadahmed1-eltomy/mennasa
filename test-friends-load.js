// Test if friends.js can be loaded
try {
  const friendsRoute = require('./backend/src/routes/friends');
  console.log('✅ friends.js loaded successfully');
  console.log('   Type:', typeof friendsRoute);
  console.log('   Keys:', Object.keys(friendsRoute));
  
  // Try to find the /all route
  if (friendsRoute.stack) {
    console.log('   Routes found:');
    friendsRoute.stack.forEach((layer, i) => {
      if (layer.route) {
        console.log(`     ${i}: ${layer.route.path || 'unknown'}`);
      }
    });
  }
} catch (e) {
  console.error('❌ Failed to load friends.js:', e.message);
  console.error('Stack:', e.stack);
}
