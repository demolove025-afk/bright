const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.json());

// Simple payment endpoint
app.post('/api/save-payment', (req, res) => {
  console.log('Payment endpoint called with:', req.body);
  
  const paymentPath = path.join(__dirname, 'payment.json');
  let paymentData = {payments: [], totalPayments: 0, totalAmount: 0};
  
  if (fs.existsSync(paymentPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(paymentPath, 'utf8'));
      paymentData = existing;
    } catch (e) {}
  }
  
  const newPayment = {
    id: paymentData.payments.length + 1,
    ...req.body,
    timestamp: new Date().toISOString()
  };
  
  paymentData.payments.push(newPayment);
  paymentData.totalPayments = paymentData.payments.length;
  
  fs.writeFileSync(paymentPath, JSON.stringify(paymentData, null, 2));
  
  res.json({ success: true, payment: newPayment });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
