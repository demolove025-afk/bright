const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({success: true, message: 'Server is running'});
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on http://0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});

// Keep process alive
setInterval(() => {
  //console.log('.');
}, 1000);
