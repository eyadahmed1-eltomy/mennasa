const { query } = require('./backend/src/db');

async function check() {
  try {
    console.log('=== Database Check ===\n');
    
    // Check users count
    const userCount = await query('SELECT COUNT(*) as cnt FROM users');
    console.log('Total users:', userCount[0]?.cnt || 0);
    
    // Get emails without selecting all columns
    const emails = await query('SELECT email FROM users');
    console.log('\nUser emails:');
    emails.forEach((u, i) => console.log(`  ${i+1}. ${u.email}`));
    
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
  process.exit(0);
}

check();
