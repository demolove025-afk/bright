const http = require('http');

const data = JSON.stringify({
  id: 'PAY-test-001',
  userId: 'user-123',
  userName: 'Test User',
  email: 'test@example.com',
  department: 'computer-science',
  amount: 500,
  paymentStatus: 'completed',
  paymentMethod: 'credit-card'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/save-payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', err => console.error('Error:', err.message));
req.write(data);
req.end();
