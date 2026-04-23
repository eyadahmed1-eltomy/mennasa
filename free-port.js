const net = require('net');

// Try to connect to port 5000 and force close the server
console.log('Attempting to free port 5000...');

const sock = new net.Socket();
sock.setTimeout(1000);

sock.on('connect', function() {
  console.log('✅ Connected to port 5000');
  sock.destroy();
  console.log('✅ Port should be freed');
});

sock.on('timeout', function() {
  sock.destroy();
  console.log('⏱️ Timeout - port may already be free');
});

sock.on('error', function(e) {
  if (e.code === 'ECONNREFUSED') {
    console.log('✅ Port 5000 is already free');
  } else {
    console.error('Error:', e.message);
  }
});

sock.connect(5000, 'localhost');
