// Simple test to check if tracks API is working
const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5001,
  path: '/api/tracks',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\n✅ API Response:');
      console.log(JSON.stringify(parsed, null, 2));
      console.log(`\n📊 Total tracks: ${parsed.data?.length || 0}`);
    } catch (e) {
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ ERROR: ${e.message}`);
  process.exit(1);
});

req.end();
