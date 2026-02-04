// payment.js - lightweight payment page behavior
(function(){
  function $(sel){return document.querySelector(sel)}
  function $all(sel){return Array.from(document.querySelectorAll(sel))}

  // Load registration data from localStorage
  const saved = JSON.parse(localStorage.getItem('bucodel_complete_user') || 'null') || 
                window.registrationData || 
                JSON.parse(localStorage.getItem('bucodel_user') || 'null');

  let trackName = 'Unknown';
  let trackCode = '';
  let duration = '1-year';
  let basePrice = 0;  // yearly price
  let amount = 0;     // total price (base × years)
  let selectedMethod = null;
  let allTracks = [];

  // Extract track info from saved data
  if (saved) {
    trackCode = saved.trackId || saved.track || saved.department || '';
    trackName = saved.trackName || '';
    // Ensure userData is initialized with track for student dashboard
    const userData = Object.assign({}, saved, {
      track: trackCode,
      userID: saved.id || saved.userID,
      name: saved.name || saved.fullName
    });
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  // Fetch tracks and pricing data
  async function loadTracksData() {
    try {
      const response = await fetch('track&duration.json');
      if (!response.ok) throw new Error('Failed to load tracks');
      const data = await response.json();
      allTracks = data.tracks || [];
      console.log('✓ Tracks loaded:', allTracks.length);
      return allTracks;
    } catch(e) {
      console.warn('⚠️ Could not load track&duration.json:', e.message);
      return [];
    }
  }

  // Find track and calculate amount based on duration
  async function ensureAmount() {
    if (!allTracks.length) {
      await loadTracksData();
    }

    // Find the matching track
    let foundTrack = null;
    if (trackCode) {
      foundTrack = allTracks.find(t => t.code === trackCode || t.code.toLowerCase() === (trackCode || '').toLowerCase());
    }
    if (!foundTrack && trackName) {
      foundTrack = allTracks.find(t => t.name.toLowerCase().includes(trackName.toLowerCase()) || t.name === trackName);
    }
    if (!foundTrack && saved) {
      const searchTerm = (trackCode || trackName || '').toLowerCase();
      foundTrack = allTracks.find(t => 
        t.code.toLowerCase() === searchTerm || 
        t.name.toLowerCase().includes(searchTerm) ||
        t.name.toLowerCase() === searchTerm
      );
    }

    if (foundTrack) {
      trackName = foundTrack.name;
      const prices = foundTrack.prices || {};
      basePrice = prices['1-year'] || 0;
      console.log('✓ Track found:', trackName, 'Base price (1-year):', basePrice);
    } else {
      basePrice = 0;
      console.warn('⚠️ Track not found:', { trackCode, trackName });
    }

    const yearMatch = (duration || '1-year').match(/(\d+)/);
    const years = yearMatch ? parseInt(yearMatch[1]) : 1;
    amount = basePrice * years;

    console.log('📊 Payment calculated:', { trackName, basePrice, duration, years, totalAmount: amount });
    return amount;
  }

  function renderAmount() {
    $('#track-name').textContent = 'Track: ' + (trackName || 'Unknown');
    $('#price-1year').textContent = '$' + (basePrice || 0).toLocaleString();
    
    const yearMatch = (duration || '1-year').match(/(\d+)/);
    const years = yearMatch ? parseInt(yearMatch[1]) : 1;
    const displayAmount = basePrice * years;
    
    $('#amount').textContent = '$' + (displayAmount || 0).toLocaleString();
  }

  function setActiveDuration(d) {
    $all('.duration-card').forEach(c=>c.classList.toggle('active', c.dataset.duration===d));
    duration = d;
    console.log('📅 Duration changed to:', d);
    renderAmount();
  }

  // Show payment method form based on selection
  function showPaymentForm(method) {
    // Hide all forms
    $all('.payment-details').forEach(form => form.classList.remove('active'));
    
    // Show selected form
    const formMap = {
      'credit-card': '#card-form',
      'bank-transfer': '#bank-form',
      'paypal': '#paypal-form',
      'gift-card': '#giftcard-form'
    };
    
    if (formMap[method]) {
      $(formMap[method])?.classList.add('active');
      console.log('📋 Showing form for:', method);
    }
  }

  // Show a waiting overlay after submission
  function showWaitingOverlay(txnId, amount) {
    // Remove existing overlay if any
    const existing = $('#waiting-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'waiting-overlay';
    overlay.innerHTML = `
      <div class="waiting-box">
        <h3>Thanks for registering!</h3>
        <p>Your payment is received and is pending approval.</p>
        <p><strong>Transaction:</strong> ${txnId}</p>
        <p><strong>Amount:</strong> $${(amount||0).toLocaleString()}</p>
        <p>Please wait while we verify your payment. You'll be redirected to your dashboard when approved.</p>
      </div>`;
    document.body.appendChild(overlay);
  }

  // Poll server to check approval status for the user
  function startApprovalPolling(userId) {
    let intervalId = null;
    const check = async () => {
      try {
        const res = await fetch('/api/user-approval/' + encodeURIComponent(userId));
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.isApproved) {
          // Approved: remove overlay and redirect
          const ov = $('#waiting-overlay');
          if (ov) ov.remove();
          alert('🎉 Payment approved — redirecting to your dashboard');
          window.location.href = 'student.html';
          clearInterval(intervalId);
        }
      } catch (e) {
        console.warn('Approval check failed:', e.message);
      }
    };

    // Immediately check once, then poll every 8 seconds
    check();
    intervalId = setInterval(check, 8000);
  }

  // Validate payment form data
  function validatePaymentForm(method) {
    const validators = {
      'credit-card': () => {
        const name = $('#card-name')?.value?.trim();
        const number = $('#card-number')?.value?.trim();
        const expiry = $('#card-expiry')?.value?.trim();
        const cvc = $('#card-cvc')?.value?.trim();
        
        if (!name || !number || !expiry || !cvc) {
          alert('Please fill in all card details');
          return false;
        }
        if (number.length < 13) {
          alert('Invalid card number');
          return false;
        }
        return true;
      },
      'bank-transfer': () => {
        const bank = $('#select-bank')?.value?.trim();
        const account = $('#bank-account')?.value?.trim();
        const pin = $('#bank-pin')?.value?.trim();
        
        if (!bank || !account || !pin) {
          alert('Please fill in all bank details');
          return false;
        }
        if (account.length < 10) {
          alert('Invalid account number');
          return false;
        }
        return true;
      },
      'paypal': () => {
        const email = $('#paypal-email')?.value?.trim();
        if (!email || !email.includes('@')) {
          alert('Please enter a valid PayPal email');
          return false;
        }
        return true;
      },
      'gift-card': () => {
        const number = $('#giftcard-number')?.value?.trim();
        if (!number) {
          alert('Please enter gift card number');
          return false;
        }
        return true;
      }
    };
    
    const validator = validators[method];
    return validator ? validator() : true;
  }

  async function init() {
    await loadTracksData();
    await ensureAmount();
    renderAmount();

    // Duration card click handlers
    $all('.duration-card').forEach(card=>{
      card.addEventListener('click', ()=>{
        setActiveDuration(card.dataset.duration);
      });
    });

    // Payment method selection handlers
    $all('.method-card').forEach(card => {
      card.addEventListener('click', () => {
        // Remove selected class from all cards
        $all('.method-card').forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Store selected method
        selectedMethod = card.dataset.method;
        
        // Show corresponding form
        showPaymentForm(selectedMethod);
        
        // Update note
        $('#payment-note').textContent = 'Enter your ' + card.textContent.trim().split('\n')[0] + ' details below';
        
        console.log('💳 Payment method selected:', selectedMethod);
      });
    });

    // Pay now button - Submit as pending and wait for admin approval
    $('#pay-now').addEventListener('click', async ()=>{
      if (!selectedMethod) {
        alert('Please select a payment method');
        return;
      }

      // Validate form data
      if (!validatePaymentForm(selectedMethod)) {
        return;
      }

      // Show processing message
      const payButton = $('#pay-now');
      payButton.disabled = true;
      payButton.textContent = '⏳ Processing...';

      try {
        const user = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
        const userId = user?.id || (saved && (saved.id || saved.userId)) || 'guest';

        // Calculate final amount
        const yearMatch = (duration || '1-year').match(/(\d+)/);
        const years = yearMatch ? parseInt(yearMatch[1]) : 1;
        const finalAmount = basePrice * years;

        // Prepare payment record marked as pending
        const paymentRecord = {
          id: 'PAY-' + Date.now(),
          userId: userId,
          userEmail: user?.email || saved?.email || '',
          userName: user?.fullName || saved?.fullName || saved?.name || '',
          trackName: trackName,
          trackCode: trackCode,
          duration: duration,
          amount: finalAmount,
          method: selectedMethod,
          status: 'pending',
          transactionId: 'TXN' + Date.now(),
          timestamp: new Date().toISOString()
        };

        // Add method-specific details
        if (selectedMethod === 'credit-card') {
          paymentRecord.cardLast4 = $('#card-number')?.value?.slice(-4);
          paymentRecord.cardName = $('#card-name')?.value;
        } else if (selectedMethod === 'bank-transfer') {
          paymentRecord.bank = $('#select-bank')?.value;
          paymentRecord.accountLast4 = $('#bank-account')?.value?.slice(-4);
        } else if (selectedMethod === 'paypal') {
          paymentRecord.paypalEmail = $('#paypal-email')?.value;
        } else if (selectedMethod === 'gift-card') {
          paymentRecord.giftcardLast4 = $('#giftcard-number')?.value?.slice(-4);
        }

        console.log('📤 Submitting payment (pending):', paymentRecord);

        // Submit to server as pending (server should respect status)
        try {
          const response = await fetch('/api/save-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentRecord)
          });

          if (!response.ok) throw new Error('Server error saving payment');

          // Update local user status to pending, preserve track and all existing data
          const storedUser = JSON.parse(localStorage.getItem('bucodel_user') || 'null') || {};
          storedUser.payment_status = 'pending';
          storedUser.id = storedUser.id || userId;
          storedUser.track = storedUser.track || trackCode || '';
          localStorage.setItem('bucodel_user', JSON.stringify(storedUser));
          localStorage.setItem('userData', JSON.stringify(storedUser));

          // Show waiting/thank-you overlay and start polling for approval
          showWaitingOverlay(paymentRecord.transactionId, finalAmount);
          startApprovalPolling(userId);
        } catch (err) {
          console.warn('⚠️ Server save failed, saving locally:', err.message);

          // Save locally as fallback
          const fallback = { payment: paymentRecord };
          localStorage.setItem('bucodel_payment_fallback', JSON.stringify(fallback));

          const storedUser = JSON.parse(localStorage.getItem('bucodel_user') || 'null') || {};
          storedUser.payment_status = 'pending';
          storedUser.id = storedUser.id || userId;
          storedUser.track = storedUser.track || trackCode || '';
          localStorage.setItem('bucodel_user', JSON.stringify(storedUser));
          localStorage.setItem('userData', JSON.stringify(storedUser));

          showWaitingOverlay(paymentRecord.transactionId, finalAmount);
          startApprovalPolling(userId);
        }
      } catch (e) {
        console.error('❌ Payment error:', e.message);
        alert('Error processing payment: ' + e.message);
        const payButton = $('#pay-now');
        payButton.disabled = false;
        payButton.textContent = 'Authorize & Process Payment';
      }
    });

    // Initialize with 1-year duration
    setActiveDuration(duration || '1-year');

    // If user previously submitted a payment and it's still pending, re-show overlay and resume polling
    try {
      const storedUser = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
      if (storedUser && storedUser.payment_status === 'pending') {
        // Try to recover transaction id and amount from fallback storage if available
        const fallbackRaw = localStorage.getItem('bucodel_payment_fallback');
        let txn = null;
        let amt = null;
        if (fallbackRaw) {
          try {
            const fb = JSON.parse(fallbackRaw);
            if (fb && fb.payment) {
              txn = fb.payment.transactionId || fb.payment.transaction_id || fb.payment.transaction || fb.payment.id || null;
              amt = fb.payment.amount || null;
            }
          } catch (e) {}
        }

        // If no txn from fallback, leave transaction id blank but still show overlay
        showWaitingOverlay(txn || 'Pending', amt || amount || 0);

        // Resume polling for approval
        const userId = storedUser.id || storedUser.userId || storedUser.email || null;
        if (userId) {
          startApprovalPolling(userId);
        }
      }
    } catch (e) {
      console.warn('Could not recover pending payment state:', e.message);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
