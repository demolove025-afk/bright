// ==================== TRACK PRICING ====================
// Define pricing for each tech track
const trackPricing = {
	'UI/UX Design': 500,
	'Web Development': 550,
	'Mobile Development': 600,
	'Fullstack Development': 700,
	'Data Science': 750,
	'Cybersecurity': 800,
	'Cloud Computing': 650,
	'Artificial Intelligence': 900,
	'Animation': 550,
	'Digital Marketing': 400,
	// Setup page values
	'ui-ux': 500,
	'web-dev': 550,
	'mobile-dev': 600,
	'fullstack': 700,
	'data-science': 750,
	'cybersecurity': 800,
	'cloud': 650,
	'ai': 900,
	'animation': 550,
	'marketing': 400
};

// ==================== PERSISTENT PAGE STATE SYSTEM ====================
// Save and restore page data for unfinished registrations
const PageStateManager = {
	STORAGE_KEY: 'bucodel_page_state',
	
	// Save the current page state
	saveState: function() {
		try {
			const state = {
				timestamp: new Date().toISOString(),
				currentStep: this.getCurrentStep(),
				formData: this.collectFormData(),
				selectedTrack: this.getSelectedTrack(),
				selectedDuration: this.getSelectedDuration(),
				selectedPaymentMethod: this.getSelectedPaymentMethod(),
				registrationData: window.registrationData || {}
			};
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
			console.log('💾 Page state saved:', state);
		} catch (e) {
			console.warn('⚠️ Failed to save page state:', e.message);
		}
	},
	
	// Restore the page state
	restoreState: function() {
		try {
			const stateStr = localStorage.getItem(this.STORAGE_KEY);
			if (!stateStr) return null;
			
			const state = JSON.parse(stateStr);
			console.log('📂 Page state restored:', state);
			return state;
		} catch (e) {
			console.warn('⚠️ Failed to restore page state:', e.message);
			return null;
		}
	},
	
	// Get current setup step
	getCurrentStep: function() {
		const setupSection = document.getElementById('setup-section');
		if (!setupSection || setupSection.style.display === 'none') return null;
		
		const visibleSteps = document.querySelectorAll('[data-setup-step]:not(.hidden)');
		if (visibleSteps.length > 0) {
			return visibleSteps[0].getAttribute('data-setup-step');
		}
		return null;
	},
	
	// Collect all form data
	collectFormData: function() {
		const data = {};
		const inputs = document.querySelectorAll('input:not([type="password"]):not([type="hidden"]), select, textarea');
		inputs.forEach(input => {
			if (input.id) {
				if (input.type === 'checkbox' || input.type === 'radio') {
					data[input.id] = input.checked;
				} else {
					data[input.id] = input.value;
				}
			}
		});
		return data;
	},
	
	// Restore form data
	restoreFormData: function(formData) {
		if (!formData) return;
		
		Object.keys(formData).forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				if (element.type === 'checkbox' || element.type === 'radio') {
					element.checked = formData[id];
				} else {
					element.value = formData[id];
				}
			}
		});
		console.log('✓ Form data restored');
	},
	
	// Get selected track
	getSelectedTrack: function() {
		const trackSelect = document.getElementById('register-track');
		if (trackSelect) {
			return trackSelect.value;
		}
		return null;
	},
	
	// Get selected duration
	getSelectedDuration: function() {
		const durationBtn = document.querySelector('.duration-btn.active');
		if (durationBtn) {
			return durationBtn.dataset.duration;
		}
		return null;
	},
	
	// Get selected payment method
	getSelectedPaymentMethod: function() {
		const methodRadio = document.querySelector('input[name="payment-method"]:checked');
		if (methodRadio) {
			return methodRadio.value;
		}
		return null;
	},
	
	// Restore selected track
	restoreTrack: function(trackCode) {
		const trackSelect = document.getElementById('register-track');
		if (trackSelect && trackCode) {
			trackSelect.value = trackCode;
			trackSelect.dispatchEvent(new Event('change'));
			console.log('✓ Track restored:', trackCode);
		}
	},
	
	// Restore selected duration
	restoreDuration: function(duration) {
		if (duration) {
			const buttons = document.querySelectorAll('.duration-btn');
			buttons.forEach(btn => {
				if (btn.dataset.duration === duration) {
					btn.click();
				}
			});
			console.log('✓ Duration restored:', duration);
		}
	},
	
	// Restore selected payment method
	restorePaymentMethod: function(method) {
		if (method) {
			const radio = document.querySelector(`input[name="payment-method"][value="${method}"]`);
			if (radio) {
				radio.click();
				console.log('✓ Payment method restored:', method);
			}
		}
	},
	
	// Clear saved state (call after successful completion)
	clearState: function() {
		localStorage.removeItem(this.STORAGE_KEY);
		console.log('🗑️ Page state cleared');
	},
	
	// Initialize auto-save on input changes
	initAutoSave: function() {
		// Save on any input change
		document.addEventListener('change', () => this.saveState());
		document.addEventListener('input', () => this.saveState());
		
		// Save every 10 seconds as backup
		setInterval(() => this.saveState(), 10000);
		
		console.log('✓ Auto-save initialized');
	}
};

// ==================== COURSE AND ACTIVITY DATA ====================
// Define all courses with their details
const courseDatabase = {
	'CS101': { 
		name: 'Introduction to Programming', 
		dept: 'computer-science', 
		level: '100',
		description: 'Learn the fundamentals of programming'
	},
	'CS102': { 
		name: 'Data Structures', 
		dept: 'computer-science', 
		level: '100',
		description: 'Master essential data structures and algorithms'
	},
	'CS201': { 
		name: 'Database Management', 
		dept: 'computer-science', 
		level: '200',
		description: 'SQL, database design, and management'
	},
	'CS202': { 
		name: 'Web Development', 
		dept: 'computer-science', 
		level: '200',
		description: 'HTML, CSS, JavaScript, and modern frameworks'
	},
	'CS301': { 
		name: 'Software Engineering', 
		dept: 'computer-science', 
		level: '300',
		description: 'Software development methodologies and practices'
	},
	'CS302': { 
		name: 'Mobile Development', 
		dept: 'computer-science', 
		level: '300',
		description: 'iOS and Android application development'
	},
	'CS401': { 
		name: 'Advanced Algorithms', 
		dept: 'computer-science', 
		level: '400',
		description: 'Advanced algorithmic problem solving'
	},
	'ENG101': { 
		name: 'Engineering Mathematics', 
		dept: 'engineering', 
		level: '100',
		description: 'Calculus and linear algebra for engineers'
	},
	'ENG102': { 
		name: 'Physics I', 
		dept: 'engineering', 
		level: '100',
		description: 'Mechanics and wave motion'
	},
	'ENG201': { 
		name: 'Circuit Analysis', 
		dept: 'engineering', 
		level: '200',
		description: 'Electrical circuits and analysis'
	},
	'ENG202': { 
		name: 'Mechanics', 
		dept: 'engineering', 
		level: '200',
		description: 'Dynamics and statics'
	},
	'BUS101': { 
		name: 'Business Basics', 
		dept: 'business', 
		level: '100',
		description: 'Introduction to business fundamentals'
	},
	'BUS102': { 
		name: 'Economics 101', 
		dept: 'business', 
		level: '100',
		description: 'Principles of microeconomics'
	},
	'BUS201': { 
		name: 'Accounting', 
		dept: 'business', 
		level: '200',
		description: 'Financial accounting principles'
	},
	'BUS202': { 
		name: 'Management', 
		dept: 'business', 
		level: '200',
		description: 'Business management and organization'
	},
	'LAW101': { 
		name: 'Constitutional Law', 
		dept: 'law', 
		level: '100',
		description: 'Introduction to constitutional principles'
	},
	'LAW102': { 
		name: 'Criminal Law', 
		dept: 'law', 
		level: '100',
		description: 'Criminal law and procedures'
	},
	'MED101': { 
		name: 'Anatomy', 
		dept: 'medicine', 
		level: '100',
		description: 'Human anatomy and body systems'
	},
	'MED102': { 
		name: 'Physiology', 
		dept: 'medicine', 
		level: '100',
		description: 'Physiological processes in the human body'
	}
};

// Programming courses and resources (for Computer Science only)
const programmingCourses = {
	'PROG001': {
		title: 'Python Fundamentals',
		description: 'Learn the basics of Python programming from scratch',
		videoUrl: 'https://www.youtube.com/embed/rfscVS0vtik',
		videoTitle: 'Python Fundamentals course',
		duration: '8 videos • 4 hours'
	},
	'PROG002': {
		title: 'Web Development Essentials',
		description: 'HTML, CSS, and JavaScript for modern web apps',
		videoUrl: 'https://www.youtube.com/embed/kJEsTjH5mKg',
		videoTitle: 'Web Development Essentials course',
		duration: '12 videos • 6 hours'
	},
	'PROG003': {
		title: 'Data Structures & Algorithms',
		description: 'Master advanced programming concepts',
		videoUrl: 'https://www.youtube.com/embed/RVFAyFWO4go',
		videoTitle: 'Data Structures and Algorithms course',
		duration: '15 videos • 8 hours'
	},
	'PROG004': {
		title: 'Database Management with SQL',
		description: 'SQL and database design principles',
		videoUrl: 'https://www.youtube.com/embed/7S_tz1z_5bA',
		videoTitle: 'Database Management with SQL course',
		duration: '10 videos • 5 hours'
	},
	'PROG005': {
		title: 'Object-Oriented Programming',
		description: 'Master OOP concepts and design patterns',
		videoUrl: 'https://www.youtube.com/embed/kCaUuHgE_-w',
		videoTitle: 'Object-Oriented Programming course',
		duration: '12 videos • 6 hours'
	},
	'PROG006': {
		title: 'API Development & REST',
		description: 'Build robust REST APIs and web services',
		videoUrl: 'https://www.youtube.com/embed/eW3gMR8AwZc',
		videoTitle: 'API Development course',
		duration: '9 videos • 5 hours'
	}
};

// Define activities for each course
const courseActivities = {
	'CS101': [
		{
			title: 'Variables and Data Types Assignment',
			description: 'Learn to work with different variable types and data structures',
			dueDate: 'Tomorrow',
			videoUrl: 'https://www.youtube.com/embed/rfscVS0vtik',
			videoTitle: 'Variables and Data Types'
		},
		{
			title: 'Function Basics Workshop',
			description: 'Master function creation, parameters, and return values',
			dueDate: 'In 3 days',
			videoUrl: 'https://www.youtube.com/embed/kJEsTjH5mKg',
			videoTitle: 'Function Basics'
		}
	],
	'CS102': [
		{
			title: 'Array and List Operations Lab',
			description: 'Hands-on practice with array manipulation',
			dueDate: 'Next Week',
			videoUrl: 'https://www.youtube.com/embed/RVFAyFWO4go',
			videoTitle: 'Array Operations'
		},
		{
			title: 'Stack and Queue Implementation',
			description: 'Implement basic stack and queue data structures',
			dueDate: 'In 2 weeks',
			videoUrl: 'https://www.youtube.com/embed/7S_tz1z_5bA',
			videoTitle: 'Stack and Queue'
		}
	],
	'CS201': [
		{
			title: 'Database Schema Design Project',
			description: 'Design a normalized database for a real-world application',
			dueDate: 'In 1 week',
			videoUrl: 'https://www.youtube.com/embed/7S_tz1z_5bA',
			videoTitle: 'Database Design'
		},
		{
			title: 'SQL Query Optimization',
			description: 'Learn to write efficient SQL queries',
			dueDate: 'In 2 weeks',
			videoUrl: 'https://www.youtube.com/embed/RVFAyFWO4go',
			videoTitle: 'Query Optimization'
		}
	],
	'CS202': [
		{
			title: 'Responsive Website Project',
			description: 'Build a fully responsive website using HTML5 and CSS3',
			dueDate: 'In 10 days',
			videoUrl: 'https://www.youtube.com/embed/kJEsTjH5mKg',
			videoTitle: 'Web Development'
		},
		{
			title: 'Interactive JavaScript Features',
			description: 'Add interactivity with JavaScript DOM manipulation',
			dueDate: 'In 2 weeks',
			videoUrl: 'https://www.youtube.com/embed/rfscVS0vtik',
			videoTitle: 'JavaScript Interaction'
		}
	],
	'CS301': [
		{
			title: 'Software Project Design Document',
			description: 'Create comprehensive design documentation for a software project',
			dueDate: 'In 5 days',
			videoUrl: 'https://www.youtube.com/embed/QH2-TGUlwu4',
			videoTitle: 'Software Design'
		},
		{
			title: 'Code Review and Testing Workshop',
			description: 'Learn best practices for code review and unit testing',
			dueDate: 'In 2 weeks',
			videoUrl: 'https://www.youtube.com/embed/lEuNrLWvTkc',
			videoTitle: 'Testing Practices'
		}
	],
	'CS302': [
		{
			title: 'Mobile App Prototype Assignment',
			description: 'Develop a mobile app prototype with core features',
			dueDate: 'In 1 week',
			videoUrl: 'https://www.youtube.com/embed/kCaUuHgE_-w',
			videoTitle: 'Mobile Development'
		}
	],
	'ENG101': [
		{
			title: 'Calculus Problem Set',
			description: 'Solve calculus problems from chapters 1-3',
			dueDate: 'Tomorrow',
			videoUrl: 'https://www.youtube.com/embed/eW3gMR8AwZc',
			videoTitle: 'Calculus Basics'
		}
	],
	'ENG102': [
		{
			title: 'Physics Mechanics Lab Report',
			description: 'Document your findings from the mechanics experiment',
			dueDate: 'Next Week',
			videoUrl: 'https://www.youtube.com/embed/lEuNrLWvTkc',
			videoTitle: 'Physics Lab'
		}
	],
	'BUS101': [
		{
			title: 'Business Case Study Analysis',
			description: 'Analyze a real-world business case and present findings',
			dueDate: 'In 5 days',
			videoUrl: 'https://www.youtube.com/embed/eW3gMR8AwZc',
			videoTitle: 'Business Analysis'
		}
	],
	'BUS102': [
		{
			title: 'Economic Analysis Essay',
			description: 'Write an essay on microeconomic principles',
			dueDate: 'In 1 week',
			videoUrl: 'https://www.youtube.com/embed/kCaUuHgE_-w',
			videoTitle: 'Economics'
		}
	],
	'LAW101': [
		{
			title: 'Constitutional Law Research Paper',
			description: 'Research and write about constitutional principles',
			dueDate: 'In 2 weeks',
			videoUrl: 'https://www.youtube.com/embed/kCaUuHgE_-w',
			videoTitle: 'Constitutional Law'
		}
	],
	'MED101': [
		{
			title: 'Anatomy Diagram Labeling Assignment',
			description: 'Label anatomical diagrams and structures',
			dueDate: 'In 3 days',
			videoUrl: 'https://www.youtube.com/embed/eW3gMR8AwZc',
			videoTitle: 'Anatomy'
		}
	]
};

// Wait for Supabase to load
function waitForSupabase() {
	return new Promise((resolve) => {
		if (window.supabaseClient) {
			resolve();
		} else {
			const checkInterval = setInterval(() => {
				if (window.supabaseClient) {
					clearInterval(checkInterval);
					resolve();
				}
			}, 100);
		}
	});
}

// ==================== PASSWORD VISIBILITY TOGGLE ====================
// Toggle password field visibility between password and text
function togglePasswordVisibility(fieldId) {
	const passwordField = document.getElementById(fieldId);
	const toggleBtn = event.target;
	
	if (!passwordField) return;
	
	// Toggle between password and text type
	if (passwordField.type === 'password') {
		passwordField.type = 'text';
		toggleBtn.textContent = '🙈'; // Closed eye when password is visible
	} else {
		passwordField.type = 'password';
		toggleBtn.textContent = '👁️'; // Open eye when password is hidden
	}
}

// Authentication Guard - Protect setup and dashboard pages
function checkAuthentication() {
	const user = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
	if (!user) {
		// Not logged in - redirect to auth page
		showAuthPage();
		return false;
	}
	return true;
}

// Show Auth Page
function showAuthPage() {
	const authSection = document.getElementById('auth-section');
	const setupSection = document.getElementById('setup-section');
	const dashboardSection = document.getElementById('dashboard-section');
	
	if (authSection) authSection.style.display = 'flex';
	if (setupSection) setupSection.style.display = 'none';
	if (dashboardSection) dashboardSection.style.display = 'none';
}

// Toggle between Login and Register forms
function toggleForms(e) {
	e.preventDefault();
	const loginForm = document.getElementById('login-form');
	const registerForm = document.getElementById('register-form');
	
	loginForm.classList.toggle('active');
	registerForm.classList.toggle('active');
	
	// Ensure proper display
	if (loginForm.classList.contains('active')) {
		loginForm.style.display = 'block';
		registerForm.style.display = 'none';
	} else {
		loginForm.style.display = 'none';
		registerForm.style.display = 'block';
	}
}

// Show login form after email verification
function showLoginForm() {
	const loginForm = document.getElementById('login-form');
	const registerForm = document.getElementById('register-form');
	const verifyForm = document.getElementById('verify-form');
	
	loginForm.classList.add('active');
	loginForm.style.display = 'block';
	
	registerForm.classList.remove('active');
	registerForm.style.display = 'none';
	
	verifyForm.classList.remove('active');
	verifyForm.style.display = 'none';
	
	// Clear and focus on email field
	document.getElementById('login-email').value = '';
	document.getElementById('login-password').value = '';
	setTimeout(() => {
		document.getElementById('login-email').focus();
	}, 100);
}

// Handle Registration with Supabase
document.getElementById('register-form').addEventListener('submit', async function(e) {
	e.preventDefault();
	
	console.log('📝 Registration form submitted');
	
	const name = document.getElementById('register-name').value;
	const email = document.getElementById('register-email').value;
	const phone = document.getElementById('register-phone').value;
	const country = document.getElementById('register-country').value;
	const track = document.getElementById('register-track').value;
	const duration = document.getElementById('register-duration').value;
	const address = document.getElementById('register-address').value;
	const password = document.getElementById('register-password').value;
	const confirm = document.getElementById('register-confirm').value;
	
	// Validate inputs
	if (!name || !email || !phone || !country || !track || !duration || !address || !password || !confirm) {
		alert('Please fill all fields');
		return;
	}
	
	// Validate passwords match
	if (password !== confirm) {
		alert('Passwords do not match!');
		return;
	}
	
	// Validate password strength
	if (password.length < 6) {
		alert('Password must be at least 6 characters');
		return;
	}
	
	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email.trim())) {
		alert('Please enter a valid email address');
		return;
	}
	
	try {
		// Prepare request payload with trimmed values
		const payload = {
			name: name.trim(),
			email: email.trim(),
			phone: phone.trim(),
			country: country.trim(),
			track: track.trim(),
			duration: duration.trim(),
			address: address.trim(),
			password: password,
			confirmPassword: confirm
		};
		
		console.log('📤 Sending registration request:', { name, email, phone, country, track, duration, address });
		
		// Call backend registration endpoint
		const response = await fetch(window.appConfig.API_URL + '/api/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		console.log('📊 Response status:', response.status);
		
		const data = await response.json();
		console.log('📥 Response data:', data);

		if (!response.ok || !data.success) {
			console.error('❌ Registration error:', { status: response.status, message: data.message });
			alert('Registration failed: ' + data.message);
			return;
		}

		console.log('✅ Registration successful!');
		alert('✅ Registration successful! Please enter the verification code sent to your email.');

		// Store registration data for verification step
		window.registrationData = {
			id: data.user.id,
			name: name,
			email: email,
			phone: phone,
			country: country,
			track: track,
			duration: duration,
			address: address
		};

		console.log('📋 Registration data stored:', window.registrationData);
		
		// Show verification form
		console.log('🔔 Calling showVerificationForm...');
		showVerificationForm(email);
		console.log('✅ showVerificationForm returned');
		
	} catch (err) {
		console.error('❌ Unexpected error:', err);
		alert('Error: ' + err.message);
	}
});

// Show verification form
function showVerificationForm(email) {
	console.log('🔍 showVerificationForm called with email:', email);
	
	const registerForm = document.getElementById('register-form');
	const verifyForm = document.getElementById('verify-form');
	const loginForm = document.getElementById('login-form');
	const authSection = document.getElementById('auth-section');
	
	console.log('📋 Found elements:', {
		registerForm: !!registerForm,
		verifyForm: !!verifyForm,
		loginForm: !!loginForm,
		authSection: !!authSection
	});
	
	// Make sure auth section is visible
	if (authSection) {
		authSection.style.display = 'block';
		authSection.classList.remove('hidden');
		console.log('✅ Auth section is visible');
	}
	
	// Hide login and register forms completely
	if (registerForm) {
		registerForm.classList.remove('active');
		registerForm.style.display = 'none';
		console.log('✅ Removed active from register-form');
	}
	
	if (loginForm) {
		loginForm.classList.remove('active');
		loginForm.style.display = 'none';
		console.log('✅ Removed active from login-form');
	}
	
	// Show verify form with explicit display and ensure it's not hidden
	if (verifyForm) {
		verifyForm.classList.remove('hidden');
		verifyForm.classList.add('active');
		verifyForm.style.display = 'block';
		verifyForm.style.visibility = 'visible';
		console.log('✅ Added active to verify-form and set display to block');
		console.log('🎨 Verify form style.display:', verifyForm.style.display);
		console.log('🎨 Verify form computed display:', window.getComputedStyle(verifyForm).display);
	}
	
	// Display email
	const verifyEmailDisplay = document.getElementById('verify-email-display');
	if (verifyEmailDisplay) {
		verifyEmailDisplay.textContent = `Verification code sent to: ${email}`;
		console.log('✅ Set verify email display');
	} else {
		console.error('❌ Could not find verify-email-display element');
	}
	
	// Clear registration form fields
	if (registerForm) {
		registerForm.reset();
		console.log('✅ Reset registration form');
	}
	
	// Focus on verification code input
	const verifyCodeInput = document.getElementById('verify-code');
	if (verifyCodeInput) {
		setTimeout(() => {
			verifyCodeInput.focus();
			verifyCodeInput.click();
			console.log('✅ Focused on verify-code input');
		}, 100);
	} else {
		console.error('❌ Could not find verify-code input');
	}
	
	console.log('✅ showVerificationForm completed');
}

// Handle email verification
document.getElementById('verify-form').addEventListener('submit', async function(e) {
	e.preventDefault();
	
	const code = document.getElementById('verify-code').value.trim();
	
	if (!code || code.length !== 6) {
		alert('Please enter a valid 6-digit code');
		return;
	}
	
	if (!window.registrationData) {
		alert('Registration data not found. Please register again.');
		return;
	}
	
	try {
		console.log('📤 Verifying code:', code);
		
		const response = await fetch(window.appConfig.API_URL + '/api/auth/verify-code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify({
				email: window.registrationData.email,
				code: code
			})
		});
		
		const data = await response.json();
		console.log('📥 Verification response:', data);
		
		if (!response.ok || !data.success) {
			alert('Verification failed: ' + (data.message || 'Invalid code'));
			return;
		}
		
		// Verification successful - registration is now complete
		console.log('✅ Email verification successful!');
		
		// Save complete registration data with email verified status
		const userData = {
			...window.registrationData,
			email_verified: true,
			id: window.registrationData.id || `user_${Date.now()}`,
			userID: window.registrationData.id || `user_${Date.now()}`,
			track: window.registrationData.track || ''
		};
		
		localStorage.setItem('bucodel_user', JSON.stringify(userData));
		// Also save to userData key so student dashboard can access it
		localStorage.setItem('userData', JSON.stringify(userData));
		
		// Create default setup data so user goes straight to dashboard
		const defaultSetup = {
			academic: {
				department: userData.department || 'Web Development',
				level: userData.level || '1 Year'
			},
			payment: {
				method: 'card'
			},
			contact: {
				phone: '',
				address: ''
			},
			completedAt: new Date().toISOString()
		};
		
		localStorage.setItem('bucodel_setup', JSON.stringify(defaultSetup));
		
		// Clear verification data
		document.getElementById('verify-code').value = '';
		window.registrationData = null;
		
		console.log('✅ Email verified! Redirecting to payment page.');

		// Ensure user data is stored for the payment page
		localStorage.setItem('bucodel_user', JSON.stringify(userData));

		// Store explicit payment-related data used by payment.html
		const paymentContext = {
			track: userData.track || '',
			duration: userData.duration || '',
			name: userData.name || '',
			email: userData.email || ''
		};
		localStorage.setItem('bucodel_payment', JSON.stringify(paymentContext));

		// Redirect to the dedicated payment page to complete payment
		window.location.href = 'payment.html';
		
	} catch (err) {
		console.error('❌ Verification error:', err);
		alert('Error: ' + err.message);
	}
});

// Resend verification code
async function resendVerificationCode(event) {
	event.preventDefault();
	
	if (!window.registrationData) {
		alert('Registration data not found. Please register again.');
		return;
	}
	
	try {
		console.log('📤 Requesting new verification code for:', window.registrationData.email);
		
		const response = await fetch(window.appConfig.API_URL + '/api/auth/resend-code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify({
				email: window.registrationData.email
			})
		});
		
		const data = await response.json();
		
		if (!response.ok || !data.success) {
			alert('Failed to resend code: ' + (data.message || 'Unknown error'));
			return;
		}
		
		alert('New verification code sent to your email!');
		document.getElementById('verify-code').value = '';
		document.getElementById('verify-code').focus();
		
	} catch (err) {
		console.error('❌ Resend error:', err);
		alert('Error: ' + err.message);
	}
}

// Back to registration
function backToRegistration(event) {
	event.preventDefault();
	
	const registerForm = document.getElementById('register-form');
	const verifyForm = document.getElementById('verify-form');
	
	// Hide verify form
	verifyForm.classList.remove('active');
	verifyForm.style.display = 'none';
	
	// Show register form
	registerForm.classList.add('active');
	registerForm.style.display = 'block';
	
	document.getElementById('verify-code').value = '';
	window.registrationData = null;
}

// Handle Login with Supabase
document.getElementById('login-form').addEventListener('submit', async function(e) {
	e.preventDefault();
	
	const email = document.getElementById('login-email').value;
	const password = document.getElementById('login-password').value;
	
	// Validate inputs
	if (!email || !password) {
		alert('Please enter email and password');
		return;
	}
	
	try {
		// Call backend login endpoint
		const response = await fetch(window.appConfig.API_URL + '/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			})
		});

		const data = await response.json();

		if (!data.success) {
			console.error('Login error:', data);
			alert('Login failed: ' + data.message);
			return;
		}

		const userName = data.user.name || 'User';
		const userId = data.user.id;
		const userEmail = data.user.email;
		const userTrack = data.user.track || '';
		
		const userData = {
			id: userId,
			userID: userId,
			name: userName,
			email: userEmail,
			track: userTrack
		};
		
		localStorage.setItem('bucodel_user', JSON.stringify(userData));
		// Also save to userData key so student dashboard can access it
		localStorage.setItem('userData', JSON.stringify(userData));
		
		// Check if user is approved by admin
		checkUserApprovalAndShowView(userId, userName, userEmail);
		
	} catch (err) {
		console.error('Login error:', err);
		alert('Error: ' + err.message);
	}
});

// Check if user is approved and show appropriate view
async function checkUserApprovalAndShowView(userId, userName, userEmail) {
	try {
		console.log('🔍 Checking user approval status for:', userId, userEmail);
		
		// Try with email as fallback
		const approvalId = userEmail || userId;
		const response = await fetch(window.appConfig.API_URL + `/api/user-approval/${approvalId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();
		console.log('✅ Approval check response:', data);

		if (data.isApproved) {
			// User is approved - show dashboard directly
			console.log('✅ User is approved! Showing dashboard...');
			localStorage.setItem('bucodel_setup', JSON.stringify({
				completed: true,
				department: data.user.department || '',
				level: data.user.level || '',
				registeredCourses: []
			}));
			showDashboard(userName);
		} else {
			// User is NOT approved - show waiting message
			console.log('⏳ User pending approval. Showing waiting page...');
			showWaitingForApproval(userName);
		}
	} catch (err) {
		console.error('❌ Error checking user approval:', err);
		// On error, show dashboard anyway (fallback)
		showDashboard(userName);
	}
}

// Helper: fetch approval status from server
async function fetchUserApprovalStatus(userIdOrEmail) {
	try {
		const resp = await fetch(window.appConfig.API_URL + `/api/user-approval/${userIdOrEmail}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await resp.json();
		return data && data.isApproved;
	} catch (err) {
		console.error('Error fetching approval status:', err);
		return false;
	}
}

// Show waiting for approval message
function showWaitingForApproval(name) {
	const authSection = document.getElementById('auth-section');
	const setupSection = document.getElementById('setup-section');
	const dashboardSection = document.getElementById('dashboard-section');
	
	// Hide auth section
	if (authSection) {
		authSection.style.display = 'none';
		authSection.classList.remove('active');
	}
	
	// Hide dashboard
	if (dashboardSection) dashboardSection.style.display = 'none';
	
	// Show setup section with waiting message
	if (setupSection) {
		setupSection.classList.remove('hidden');
		setupSection.style.display = 'flex';
		console.log('⏳ Waiting page shown');
	}
	
	// Update greeting if needed
	const greeting = document.querySelector('.user-greeting');
	if (greeting) {
		greeting.textContent = `Welcome, ${name}!`;
	}
	
	// Start polling for approval status every 3 seconds
	const storedUser = JSON.parse(localStorage.getItem('bucodel_user') || '{}');
	const approvalId = storedUser.id || storedUser.email || name || '';
	
	console.log('⏰ Starting approval polling for:', approvalId);
	
	const approvalPollInterval = setInterval(async () => {
		try {
			const isApproved = await fetchUserApprovalStatus(approvalId);
			console.log('🔍 Approval poll check:', approvalId, isApproved);
			
			if (isApproved) {
				console.log('✅ User approved! Redirecting to student.html...');
				clearInterval(approvalPollInterval);
				
				// Get user data and prepare for redirect
				const userData = JSON.parse(localStorage.getItem('bucodel_user') || '{}');
				const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
				const studentData = {
					userId: userData.id || 'user-' + Date.now(),
					email: userData.email,
					name: name || userData.fullName,
					initials: (name || userData.fullName || '').split(' ').map(n => n[0]).join('').toUpperCase(),
					setupData: JSON.parse(localStorage.getItem('bucodel_setup') || '{}'),
					payment: existingUserData.payment || { paymentStatus: 'completed' }
				};
				localStorage.setItem('userData', JSON.stringify(studentData));
				
				alert('✅ Your application has been approved! Redirecting to your dashboard...');
				window.location.href = 'student.html';
			}
		} catch (err) {
			console.warn('⚠️ Error checking approval during polling:', err);
		}
	}, 3000); // Poll every 3 seconds
}
// Show Dashboard and hide auth (verifies approval before showing)
async function showDashboard(name) {
	console.log('📊 showDashboard called for:', name);
	
	const authSection = document.getElementById('auth-section');
	const setupSection = document.getElementById('setup-section');
	const dashboardSection = document.getElementById('dashboard-section');
	
	// Hide auth section
	if (authSection) {
		authSection.style.display = 'none';
		authSection.classList.remove('active');
		console.log('✅ Auth section hidden');
	}
	
	// Ensure user is approved before showing dashboard
	const storedUser = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
	const approvalId = (storedUser && (storedUser.id || storedUser.email)) || name || '';
	const isApproved = await fetchUserApprovalStatus(approvalId);
	console.log('🔍 Approval check in showDashboard:', approvalId, isApproved);

	if (!isApproved) {
		console.log('⛔ User not approved yet — showing waiting page');
		showWaitingForApproval(name);
		return;
	}

	// Check if user has completed setup
	const userSetup = JSON.parse(localStorage.getItem('bucodel_setup') || 'null');
	console.log('📋 User setup status:', userSetup);

	if (!userSetup) {
		// Show setup section if not completed
		console.log('⚙️ Showing setup section...');
		if (setupSection) {
			setupSection.classList.remove('hidden');
			setupSection.style.display = 'flex';
			console.log('✅ Setup section shown');
		}
		if (dashboardSection) dashboardSection.style.display = 'none';
	} else {
		// Redirect to student dashboard
		console.log('📊 Redirecting to student dashboard...');
		
		// Get user data
		const userData = JSON.parse(localStorage.getItem('bucodel_user') || '{}');
		const userToken = localStorage.getItem('userToken');
		
		// Prepare student data
		const studentData = {
			userId: userData.id || 'user-' + Date.now(),
			id: userData.id || 'user-' + Date.now(),
			email: userData.email,
			name: name || userData.fullName,
			initials: (name || userData.fullName || '').split(' ').map(n => n[0]).join('').toUpperCase(),
			track: userData.track || userSetup.track || userSetup.trackName || null,
			setupData: userSetup,
			payment: {
				paymentStatus: 'completed'
			}
		};
		
		// Save to localStorage
		localStorage.setItem('userData', JSON.stringify(studentData));
		
		// Redirect to student dashboard
		window.location.href = 'student.html';
	}
}

// Filter menu items based on user's department and registered courses
function filterMenuItems() {
	const user = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
	const userSetup = JSON.parse(localStorage.getItem('bucodel_setup') || 'null');
	
	// Get menu items
	const programmingItem = document.querySelector('[data-view="programming"]');
	const activitiesItem = document.querySelector('[data-view="activities"]');
	
	// Show Programming only for Computer Science students
	if (programmingItem) {
		if (userSetup && userSetup.department === 'computer-science') {
			programmingItem.style.display = 'flex';
		} else {
			programmingItem.style.display = 'none';
		}
	}
	
	// Show Class Activities only if user has registered courses
	if (activitiesItem) {
		if (userSetup && userSetup.registeredCourses && userSetup.registeredCourses.length > 0) {
			activitiesItem.style.display = 'flex';
		} else {
			activitiesItem.style.display = 'none';
		}
	}
	
	console.log('✅ Menu items filtered based on department and courses');
}

// Populate registered courses in the dashboard
function populateRegisteredCourses() {
	const videosGrid = document.getElementById('videos-grid');
	const noCourseMsg = document.getElementById('no-courses-message');
	
	if (!videosGrid) return;
	
	// Get user's registered courses
	const userSetup = JSON.parse(localStorage.getItem('bucodel_setup') || 'null');
	
	if (!userSetup || !userSetup.registeredCourses || userSetup.registeredCourses.length === 0) {
		// Show no courses message
		videosGrid.innerHTML = '<div class="no-courses-message"><p>No courses registered yet. Complete your profile setup to register courses.</p></div>';
		return;
	}
	
	// Clear the grid
	videosGrid.innerHTML = '';
	
	// Create course cards for each registered course
	userSetup.registeredCourses.forEach((course) => {
		const courseCard = document.createElement('div');
		courseCard.className = 'video-card';
		courseCard.innerHTML = `
			<div class="video-thumbnail">
				<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; text-align: center; padding: 20px;">
					${course.code}
				</div>
			</div>
			<div class="video-info">
				<h3>${course.code} - ${course.title}</h3>
				<p>Instructor: ${course.instructor || 'TBA'}</p>
				<small>Credits: ${course.credits || 3}</small>
			</div>
		`;
		videosGrid.appendChild(courseCard);
	});
	
	console.log('✅ Registered courses displayed:', userSetup.registeredCourses.length);
}

// Setup Wizard Functions
let currentSetupStep = 1;

// Handle payment method selection
function initPaymentMethodListeners() {
	const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
	paymentRadios.forEach(radio => {
		radio.addEventListener('change', function() {
			// Hide all payment detail forms
			document.getElementById('card-details')?.classList.add('hidden');
			document.getElementById('paypal-details')?.classList.add('hidden');
			document.getElementById('bank-details')?.classList.add('hidden');
			document.getElementById('giftcard-details')?.classList.add('hidden');
			
			// Show selected payment detail form
			if (this.value === 'credit-card') {
				document.getElementById('card-details')?.classList.remove('hidden');
			} else if (this.value === 'paypal') {
				document.getElementById('paypal-details')?.classList.remove('hidden');
			} else if (this.value === 'bank-transfer') {
				document.getElementById('bank-details')?.classList.remove('hidden');
			} else if (this.value === 'gift-card') {
				document.getElementById('giftcard-details')?.classList.remove('hidden');
			}
			
			// Update amount display
			updateAmountDisplay();
			console.log('💳 Payment method selected:', this.value);
		});
	});
}

// Update payment duration and recalculate amounts
function updatePaymentDuration(duration) {
	console.log('📅 Duration changed to:', duration);
	
	// Update active button
	document.querySelectorAll('.duration-btn').forEach(btn => btn.classList.remove('active'));
	document.querySelector(`.duration-btn[data-duration="${duration}"]`)?.classList.add('active');
	
	// Update duration summary
	const summaryDuration = document.getElementById('summary-duration');
	if (summaryDuration) {
		summaryDuration.textContent = duration === '1-year' ? '1 Year' : (typeof duration === 'string' ? duration : '1 Year');
	}
	
	// Recalculate and update amount
	updatePaymentSummary();
	updateAmountDisplay();
}

// Update amount display when payment method is selected
function updateAmountDisplay() {
	const amountDisplay = document.getElementById('amount-display');
	const amountDescription = document.getElementById('amount-description');
	const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
	
	if (!amountDisplay) return;
	
	if (selectedMethod) {
		// Get amount from summary
		const totalAmount = document.getElementById('summary-total')?.textContent || '0';
		amountDisplay.textContent = totalAmount;
		amountDescription.textContent = `Ready to pay via ${selectedMethod.nextElementSibling.querySelector('.method-name').textContent}`;
		amountDisplay.style.color = 'white';
	} else {
		amountDisplay.textContent = '$0';
		amountDescription.textContent = 'Select a payment method to continue';
		amountDisplay.style.color = 'white';
	}
}

// Authorize and process payment
async function authorizePayment() {
	// Validate payment details first
	if (!validateSetupStep(2.5)) {
		return;
	}
	
	const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
	let paymentDetails = {};
	let bankAccountNumber = '';
	
	// Collect payment details based on method
	if (paymentMethod === 'credit-card') {
		paymentDetails = {
			cardName: document.getElementById('card-name').value,
			cardNumber: document.getElementById('card-number').value,
			cardExpiry: document.getElementById('card-expiry').value,
			cardCvc: document.getElementById('card-cvc').value
		};
	} else if (paymentMethod === 'paypal') {
		paymentDetails = {
			paypalEmail: document.getElementById('paypal-email').value
		};
	} else if (paymentMethod === 'bank-transfer') {
		paymentDetails = {
			bank: document.getElementById('select-bank').value,
			accountNumber: document.getElementById('bank-account').value,
			routingNumber: document.getElementById('bank-routing').value
		};
		bankAccountNumber = document.getElementById('bank-account').value;
	} else if (paymentMethod === 'gift-card') {
		paymentDetails = {
			giftcardNumber: document.getElementById('giftcard-number').value,
			giftcardPin: document.getElementById('giftcard-pin').value
		};
	}
	
	// Show loading state
	const btn = event.target;
	const originalText = btn.textContent;
	btn.textContent = 'Processing...';
	btn.disabled = true;
	
	try {
		// Verify account with the bank (simulated)
		if (paymentMethod === 'bank-transfer') {
			const verifyResponse = await verifyBankAccount(
				paymentDetails.bank,
				bankAccountNumber,
				paymentDetails.routingNumber
			);
			
			if (!verifyResponse.success) {
				alert('Account verification failed: ' + verifyResponse.message);
				btn.textContent = originalText;
				btn.disabled = false;
				return;
			}
		}
		
		// Process payment and transfer to admin account
		const paymentResponse = await processPaymentTransfer(paymentMethod, paymentDetails);
		
		if (paymentResponse.success) {
			alert('Payment authorized successfully! Proceeding to next step.');
			switchSetupStep(3);
		} else {
			alert('Payment processing failed: ' + paymentResponse.message);
		}
	} catch (error) {
		alert('Error processing payment: ' + error.message);
	} finally {
		btn.textContent = originalText;
		btn.disabled = false;
	}
}

// Verify bank account
async function verifyBankAccount(bank, accountNumber, routingNumber) {
	try {
		// In a real application, this would call a backend service to verify the account
		// For now, simulating verification
		return new Promise((resolve) => {
			setTimeout(() => {
				// Simulate account verification
				if (accountNumber.length >= 10 && routingNumber.length >= 6) {
					resolve({
						success: true,
						message: 'Account verified successfully',
						accountName: 'John Doe',
						bank: bank
					});
				} else {
					resolve({
						success: false,
						message: 'Invalid account or routing number'
					});
				}
			}, 1000);
		});
	} catch (error) {
		console.error('Bank verification error:', error);
		return { success: false, message: 'Verification service unavailable' };
	}
}

// Process payment transfer
async function processPaymentTransfer(paymentMethod, paymentDetails) {
	try {
		// Get current user info safely
		let currentUser = null;
		let userId = 'guest-' + Date.now();
		let userName = 'Guest User';
		let userEmail = '';
		
		// First, try to get user from localStorage (from registration)
		try {
			const storedUser = localStorage.getItem('bucodel_user');
			if (storedUser) {
				const userData = JSON.parse(storedUser);
				userName = userData.name || userData.full_name || userName;
				userEmail = userData.email || '';
				userId = userData.id || userId;
				console.log('✅ User retrieved from localStorage:', { userName, userEmail });
			}
		} catch (e) {
			console.log('Could not read user from localStorage');
		}
		
		// Second, try Supabase if localStorage doesn't have it
		if (userName === 'Guest User') {
			try {
				if (typeof supabase !== 'undefined' && supabase && supabase.auth) {
					const user = supabase.auth.user();
					if (user && user.id) {
						currentUser = user;
						userId = user.id;
						userEmail = user.email || '';
						userName = user.user_metadata?.full_name || user.email || 'User';
						console.log('✅ User retrieved from Supabase:', { userName, userEmail });
					}
				}
			} catch (e) {
				console.log('Supabase user not available');
			}
		}
		
		// Get amount and course info
		const department = document.getElementById('department').value;
		const level = document.getElementById('level').value;
		const courseOption = document.querySelector(`#department option[value="${department}"]`);
		const courseName = courseOption ? courseOption.textContent : 'Unknown';
		const priceMatch = courseName.match(/\$(\d+)/);
		const yearlyPrice = priceMatch ? parseInt(priceMatch[1]) : 0;
		let totalAmount = 0;
		if (level === '1-year' || !level) {
			totalAmount = yearlyPrice;
		} else {
			const durationMatch = (level || '').match(/(\d+)/);
			const years = durationMatch ? parseInt(durationMatch[1]) : 1;
			totalAmount = yearlyPrice * years;
		}
		
		// Collect payment data to send to backend
		const paymentData = {
			id: 'PAY-' + Date.now(),
			userId: userId,
			userEmail: userEmail,
			userName: userName,
			amount: totalAmount,
			method: paymentMethod,
			status: 'completed',
			department: department,
			level: level,
			courseName: courseName,
			timestamp: new Date().toISOString(),
			date: new Date().toISOString()
		};
		
		console.log('📤 Sending payment to backend:', paymentData);
		
		// Send payment to backend
		try {
			const response = await fetch(appConfig.API_URL + '/api/save-payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(paymentData)
			});
			
			const result = await response.json();
			
			if (response.ok && result.success) {
				console.log('✅ Payment saved to backend:', result);
				return {
					success: true,
					message: 'Payment processed successfully',
					transactionId: paymentData.id,
					data: result.data
				};
			} else {
				console.warn('⚠️ Backend returned error:', result);
				// Still resolve even if backend save fails
				return {
					success: true,
					message: 'Payment processed',
					transactionId: paymentData.id,
					data: paymentData
				};
			}
		} catch (fetchError) {
			console.error('❌ Error sending payment to backend:', fetchError);
			// Still resolve with simulated response if backend is unavailable
			return {
				success: true,
				message: 'Payment processed (offline mode)',
				transactionId: paymentData.id,
				data: paymentData
			};
		}
	} catch (error) {
		console.error('Payment transfer error:', error);
		return { success: false, message: 'Payment processing failed' };
	}
}

function nextSetupStep() {
	// Validate current step
	if (!validateSetupStep(currentSetupStep)) {
		return;
	}
	
	// Move to next step
	if (currentSetupStep === 2) {
		switchSetupStep(2.5);
	} else if (currentSetupStep === 2.5) {
		// Complete setup after payment details
		completeSetup();
	} else if (currentSetupStep < 2) {
		switchSetupStep(currentSetupStep + 1);
	}
}

function previousSetupStep() {
	if (currentSetupStep === 2.5) {
		switchSetupStep(2);
	} else if (currentSetupStep > 1) {
		switchSetupStep(currentSetupStep - 1);
	}
}

function switchSetupStep(stepNumber) {
	// Hide all steps (1, 2, and 2.5)
	for (let i = 1; i <= 2; i++) {
		const step = document.getElementById(`step-${i}`);
		if (step) {
			step.classList.remove('active');
		}
	}
	// Also hide step 2.5
	const step25 = document.getElementById('step-2.5');
	if (step25) {
		step25.classList.remove('active');
	}
	
	// Show current step
	let currentStep = null;
	if (stepNumber === 2.5) {
		currentStep = document.getElementById('step-2.5');
		// Update payment summary when showing step 2.5 (only if elements exist)
		if (document.getElementById('department') && document.getElementById('level')) {
			updatePaymentSummary();
		}
	} else {
		currentStep = document.getElementById(`step-${stepNumber}`);
	}
	
	if (currentStep) {
		currentStep.classList.add('active');
	}
	
	currentSetupStep = stepNumber;
}

// Update payment summary display
function updatePaymentSummary() {
	// Determine department code and current duration (support both select and button UI)
	const deptElement = document.getElementById('department') || document.getElementById('register-track');
	const levelElement = document.getElementById('level');
	const selectedDurationBtn = document.querySelector('.duration-btn.active');
	const currentDuration = selectedDurationBtn?.dataset.duration || (levelElement ? levelElement.value : '1-year');
	
	if (!deptElement) {
		console.log('⚠️ No department/register-track element found, skipping payment summary update');
		return;
	}
	
	const department = deptElement.value;
	// Find the corresponding option in whichever select was populated
	let courseOption = null;
	if (document.querySelector(`#department option[value="${department}"]`)) {
		courseOption = document.querySelector(`#department option[value="${department}"]`);
	} else if (document.querySelector(`#register-track option[value="${department}"]`)) {
		courseOption = document.querySelector(`#register-track option[value="${department}"]`);
	}
	
	const courseName = courseOption ? (courseOption.textContent.split(' - ')[0].trim() || courseOption.textContent.trim()) : 'Unknown';
	
	// Prefer explicit dataset prices if available (only yearly)
	const datasetYearly = courseOption ? parseInt(courseOption.dataset.price1year || courseOption.dataset.price1Year || courseOption.dataset.price1) : NaN;
	let yearlyPrice = !isNaN(datasetYearly) ? datasetYearly : 0;
	
	// If datasets not present, try to parse price from option text
	if ((yearlyPrice === 0 || isNaN(yearlyPrice)) && courseOption) {
		const priceMatch = courseOption.textContent.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)/);
		if (priceMatch) {
			yearlyPrice = parseInt(priceMatch[1].replace(/,/g, '')) || 0;
		}
	}
	
	// If still zero, try global trackPricing map as a last resort
	if ((!yearlyPrice || yearlyPrice === 0) && typeof trackPricing !== 'undefined') {
		const pricingKey = Object.keys(trackPricing).find(k => k.toLowerCase().includes((department || '').toLowerCase()));
		if (pricingKey) {
			yearlyPrice = trackPricing[pricingKey] || yearlyPrice;
		}
	}
	
	// Ensure numbers
	yearlyPrice = Number(yearlyPrice) || 0;
	
	// Active price is always yearly (6-month option removed)
	const currentPrice = yearlyPrice;
	
	// Update duration selector display (if present)
	const price1YearElement = document.getElementById('price-1-year');
	if (price1YearElement) price1YearElement.textContent = '$' + yearlyPrice.toLocaleString();
	
	// Update summary display
	const summaryElement = document.getElementById('summary-course');
	const durationElement = document.getElementById('summary-duration');
	const priceElement = document.getElementById('summary-price');
	const totalElement = document.getElementById('summary-total');
	
	if (summaryElement) summaryElement.textContent = courseName;
	if (durationElement) durationElement.textContent = '1 Year';
	if (priceElement) priceElement.textContent = '$' + yearlyPrice.toLocaleString();
	if (totalElement) totalElement.textContent = '$' + currentPrice.toLocaleString();
	
	// Update amount display if a payment method is selected
	updateAmountDisplay();
	
	console.log('💰 Payment Summary Updated:', { courseName, yearlyPrice, currentPrice, duration: currentDuration });
}

function validateSetupStep(stepNumber) {
	if (stepNumber === 1) {
		// Validate department and level
		const department = document.getElementById('department').value;
		const level = document.getElementById('level').value;
		
		if (!department) {
			alert('Please select a track');
			return false;
		}
		
		if (!level) {
			alert('Please select duration');
			return false;
		}
		
		return true;
	} else if (stepNumber === 2) {
		// Validate payment method selection
		const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
		if (!paymentMethod) {
			alert('Please select a payment method');
			return false;
		}
		return true;
	} else if (stepNumber === 2.5) {
		// Validate payment details based on selected method
		const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
		
		if (paymentMethod === 'credit-card') {
			const cardName = document.getElementById('card-name').value;
			const cardNumber = document.getElementById('card-number').value;
			const cardExpiry = document.getElementById('card-expiry').value;
			const cardCvc = document.getElementById('card-cvc').value;
			
			if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
				alert('Please fill in all card details');
				return false;
			}
		} else if (paymentMethod === 'paypal') {
			const paypalEmail = document.getElementById('paypal-email').value;
			if (!paypalEmail) {
				alert('Please enter your PayPal email');
				return false;
			}
		} else if (paymentMethod === 'bank-transfer') {
			const bankName = document.getElementById('select-bank').value;
			const bankAccount = document.getElementById('bank-account').value;
			const bankRouting = document.getElementById('bank-routing').value;
			
			if (!bankName) {
				alert('Please select a bank');
				return false;
			}
			if (!bankAccount || !bankRouting) {
				alert('Please fill in all bank details');
				return false;
			}
		} else if (paymentMethod === 'gift-card') {
			const giftcardNumber = document.getElementById('giftcard-number').value;
			const giftcardPin = document.getElementById('giftcard-pin').value;
			
			if (!giftcardNumber || !giftcardPin) {
				alert('Please fill in gift card details');
				return false;
			}
		}
		return true;
	}
	
	return true;
}

async function completeSetup() {
	// Validate setup steps (start from Payment step since Track step is skipped)
	let isValid = true;
	for (let i = 2; i <= 3; i++) {
		if (!validateSetupStep(i)) {
			switchSetupStep(i);
			isValid = false;
			break;
		}
	}
	
	if (!isValid) {
		return;
	}
	
	// Get user data from localStorage
	const userData = JSON.parse(localStorage.getItem('bucodel_user') || '{}');
	const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
	const paymentValue = paymentMethod ? paymentMethod.value : 'unknown';
	
	// Ensure payment step is valid
	if (!validateSetupStep(2.5)) {
		return;
	}

	// Determine department and level safely (fall back to registration data or defaults)
	let department = 'general';
	let level = '1-year';
	
	// First, try to get from registration data (most reliable)
	if (window.registrationData) {
		if (window.registrationData.track) {
			department = window.registrationData.track;
			console.log('📚 Got department from registration data:', department);
		}
		if (window.registrationData.duration) {
			level = window.registrationData.duration;
			console.log('⏱️ Got duration from registration data:', level);
		}
	}
	
	// Fall back to form elements if they exist
	if (document.getElementById('department')) {
		const formDept = document.getElementById('department').value;
		if (formDept) {
			department = formDept;
			console.log('📚 Got department from form:', department);
		}
	}
	if (document.getElementById('level')) {
		const formLevel = document.getElementById('level').value;
		if (formLevel) {
			level = formLevel;
			console.log('⏱️ Got duration from form:', level);
		}
	}
	
	console.log('📋 Final department and level:', { department, level });

	// Try to map department to a known pricing key in trackPricing
	let pricingKey = Object.keys(trackPricing).find(k => k.toLowerCase() === department.toLowerCase() || k.toLowerCase().includes(department.toLowerCase()));
	if (!pricingKey) {
		// try more flexible match
		pricingKey = Object.keys(trackPricing).find(k => k.toLowerCase().replace(/[^a-z]/g,'').includes(department.toLowerCase().replace(/[^a-z]/g,'')));
	}
	const yearlyPrice = pricingKey ? trackPricing[pricingKey] : 0;

	// Calculate totalAmount: only yearly or multi-year durations supported
	let totalAmount = 0;
	if (level === '1-year' || !level) {
		totalAmount = yearlyPrice;
	} else {
		const durationMatch = (level || '').match(/(\d+)/);
		const years = durationMatch ? parseInt(durationMatch[1]) : 1;
		totalAmount = yearlyPrice * years;
	}
	
	// Get track metadata from dropdown option (if it exists)
	let courseOption = null;
	if (document.getElementById('department')) {
		courseOption = document.querySelector(`#department option[value="${department}"]`);
	}
	
	let trackId = null;
	let trackDuration = null;
	let trackName = 'Unknown';
	
	if (courseOption) {
		trackId = courseOption.dataset.trackId;
		trackDuration = courseOption.dataset.trackDuration;
		trackName = courseOption.textContent.split(' - ')[0];
	} else if (window.registrationData && window.registrationData.track) {
		// Fall back to registration data if dropdown doesn't exist
		trackName = window.registrationData.track;
		console.log('📚 Using track name from registration data:', trackName);
	}
	
	// Get selected courses
	const selectedCourseCheckboxes = document.querySelectorAll('input[name="course"]:checked');
	const selectedCourses = Array.from(selectedCourseCheckboxes).map(checkbox => ({
		code: checkbox.value,
		name: checkbox.parentElement.textContent.trim()
	}));
	
	// Collect all setup data
	const setupData = {
		academic: {
			department: department,
			level: level,
			trackId: trackId,
			trackName: trackName,
			trackDuration: trackDuration
		},
		payment: {
			method: paymentValue
		},
		contact: {
			phone: document.getElementById('contact-phone').value,
			address: document.getElementById('contact-address').value
		},
		courses: selectedCourses,
		completedAt: new Date().toISOString()
	};
	
	// Create complete user registration data
	const completeUserData = {
		id: userData.id || 'user-' + Date.now(),
		email: userData.email || '',
		fullName: userData.fullName || '',
		department: setupData.academic.department,
		duration: setupData.academic.level,
		trackId: trackId,
		trackName: trackName,
		trackDuration: trackDuration,
		phone: setupData.contact.phone,
		address: setupData.contact.address,
		paymentMethod: setupData.payment.method,
		totalAmount: totalAmount,
		registrationDate: new Date().toISOString(),
		status: 'active'
	};
	
	// Create payment record
	const paymentRecord = {
		id: 'PAY-' + Date.now(),
		userId: completeUserData.id,
		userName: completeUserData.fullName,
		email: completeUserData.email,
		department: completeUserData.department,
		duration: completeUserData.duration,
		amount: totalAmount,
		paymentMethod: completeUserData.paymentMethod,
		paymentStatus: 'completed',
		transactionId: 'TXN' + Date.now(),
		timestamp: new Date().toISOString(),
		notes: 'Payment authorized and processed'
	};
	
	// Save setup data to localStorage
	localStorage.setItem('bucodel_setup', JSON.stringify(setupData));
	localStorage.setItem('bucodel_complete_user', JSON.stringify(completeUserData));

	console.log('📋 Setup saved with track:', setupData.academic.department);
	console.log('📞 Contact info saved:', setupData.contact.phone);
	console.log('💰 Payment recorded:', paymentRecord);

	// Save to user.json and payment.json
	try {
		// Save user registration
		await fetch('/api/save-user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(completeUserData)
		});

		// Save payment record
		await fetch('/api/save-payment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(paymentRecord)
		});

		console.log('✅ User and payment data saved');
	} catch (err) {
		console.warn('⚠️ Could not save to server endpoints:', err.message);
	}

	// Enroll user into the selected track (updates track&duration.json on server)
	try {
		if (completeUserData && completeUserData.id && setupData.academic && setupData.academic.trackId) {
			await fetch('/api/track-enroll', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					trackId: setupData.academic.trackId,
					userId: completeUserData.id,
					name: completeUserData.fullName,
					email: completeUserData.email
				})
			});
			console.log('✅ Enrollment request sent to server for track:', setupData.academic.trackId);
		}
	} catch (err) {
		console.warn('⚠️ Could not send enrollment to server:', err.message);
	}
	
	// Optionally save to backend server if needed
	try {
		const userIdToSave = userData?.id || completeUserData.id;
		if (userIdToSave) {
			const setupPayload = {
				department: setupData.academic.department,
				level: setupData.academic.level,
				trackId: setupData.academic.trackId,
				trackName: setupData.academic.trackName,
				trackDuration: setupData.academic.trackDuration,
				courses: selectedCourses,
				paymentMethod: setupData.payment.method,
				phone: setupData.contact.phone,
				address: setupData.contact.address
			};
			
			console.log('📤 Sending setup data to server with track:', setupPayload.trackName, 'and duration:', setupPayload.trackDuration);
			
			// Save setup data to backend server
			const response = await fetch(window.appConfig.API_URL + `/api/user/${userIdToSave}/setup`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(setupPayload)
			});

			const result = await response.json();
			if (result.success) {
				console.log('✅ Setup data saved to user.json with track:', setupData.academic.trackName);
				console.log('✅ Server response:', result.data);
			} else {
				console.warn('⚠️ Setup data saved locally (server save failed):', result.message);
			}
		} else {
			console.warn('⚠️ No user ID found to save setup data');
		}
	} catch (err) {
		console.warn('⚠️ Could not save setup to server, but local data is saved:', err.message);
	}
	
	// Hide setup section and show dashboard
	const setupSection = document.getElementById('setup-section');
	const dashboardSection = document.getElementById('dashboard-section');

	// After saving data, verify server approval before showing dashboard
	const storedUser = JSON.parse(localStorage.getItem('bucodel_user') || '{}');
	const approvalId = storedUser.id || storedUser.email || completeUserData.id;
	const approved = await fetchUserApprovalStatus(approvalId);

	if (!approved) {
		// Keep setup hidden and show waiting UI
		if (setupSection) {
			setupSection.classList.remove('hidden');
			setupSection.style.display = 'flex';
		}
		if (dashboardSection) dashboardSection.style.display = 'none';
		// Save user data for student dashboard still
		const studentDataPending = {
			userId: userData.id || 'user-' + Date.now(),
			email: userData.email,
			name: userData.fullName,
			initials: (userData.fullName || '').split(' ').map(n => n[0]).join('').toUpperCase(),
			setupData: setupData,
			payment: paymentRecord
		};
		localStorage.setItem('userData', JSON.stringify(studentDataPending));
		alert('Payment recorded. Awaiting admin acceptance before dashboard access.');
		showWaitingForApproval(completeUserData.fullName || completeUserData.email || 'User');
		return;
	}

	// Approved: show dashboard
	if (setupSection) setupSection.style.display = 'none';
	if (dashboardSection) dashboardSection.style.display = 'block';

	// Save user data for student dashboard
	const studentData = {
		userId: userData.id || 'user-' + Date.now(),
		email: userData.email,
		name: userData.fullName,
		initials: (userData.fullName || '').split(' ').map(n => n[0]).join('').toUpperCase(),
		setupData: setupData,
		payment: paymentRecord
	};
	localStorage.setItem('userData', JSON.stringify(studentData));
	
	// Clear the persistent page state since registration is complete
	PageStateManager.clearState();
	
	// Show a confirmation and redirect to student dashboard after 2 seconds
	alert('✅ Setup completed successfully! Redirecting to your student dashboard...');
	setTimeout(() => {
		window.location.href = 'student.html';
	}, 2000);
}

// Helper function to get department ID
function getDepartmentId(deptName) {
	const deptMap = {
		'computer-science': 1,
		'engineering': 2,
		'business': 3,
		'law': 4,
		'medicine': 5,
		'arts': 6
	};
	return deptMap[deptName] || null;
}

// Load courses based on department and academic level
async function loadCoursesForStudent() {
	const department = document.getElementById('department').value;
	const level = document.getElementById('level').value;
	
	if (!department || !level) {
		alert('Please complete Department & Level step first');
		return;
	}
	
	try {
		const supabase = window.supabaseClient;
		const departmentId = getDepartmentId(department);

		// If Supabase client not available, fall back to sample data immediately
		if (!supabase) {
			console.warn('Supabase not available, loading sample courses');
			loadSampleCourses(department, level);
			return;
		}

		// Fetch courses from Supabase
		const { data: courses, error } = await supabase
			.from('courses')
			.select('id, code, name, description, academic_level')
			.eq('department_id', departmentId)
			.eq('academic_level', level);
		
		if (error) {
			console.error('Error fetching courses:', error);
			// Check if table doesn't exist
			if (error.message && error.message.includes('relation')) {
				console.log('Courses table not initialized, using sample data');
			}
			// Fall back to sample data if Supabase fails or table doesn't exist
			loadSampleCourses(department, level);
			return;
		}
		
		// Clear previous courses
		const coursesList = document.getElementById('courses-list');
		coursesList.innerHTML = '';
		
		// Display courses from Supabase
		if (!courses || courses.length === 0) {
			coursesList.innerHTML = '<p style="color: #999;">No courses available for this selection</p>';
			return;
		}
		
		courses.forEach(course => {
			const label = document.createElement('label');
			label.className = 'course-checkbox';
			label.innerHTML = `
				<input type="checkbox" name="course" value="${course.code}">
				<span class="course-name">${course.code} - ${course.name}</span>
			`;
			coursesList.appendChild(label);
		});
		
	} catch (err) {
		console.error('Error:', err);
		loadSampleCourses(department, level);
	}
}

// Fallback: Load sample courses if Supabase is unavailable
function loadSampleCourses(department, level) {
	// Sample course data
	const allCourses = [
		// Computer Science courses
		{ id: 'CS101', name: 'Introduction to Programming', dept: 'computer-science', level: '100' },
		{ id: 'CS102', name: 'Data Structures', dept: 'computer-science', level: '100' },
		{ id: 'CS201', name: 'Database Management', dept: 'computer-science', level: '200' },
		{ id: 'CS202', name: 'Web Development', dept: 'computer-science', level: '200' },
		{ id: 'CS301', name: 'Software Engineering', dept: 'computer-science', level: '300' },
		{ id: 'CS302', name: 'Mobile Development', dept: 'computer-science', level: '300' },
		{ id: 'CS401', name: 'Advanced Algorithms', dept: 'computer-science', level: '400' },
		
		// Engineering courses
		{ id: 'ENG101', name: 'Engineering Mathematics', dept: 'engineering', level: '100' },
		{ id: 'ENG102', name: 'Physics I', dept: 'engineering', level: '100' },
		{ id: 'ENG201', name: 'Circuit Analysis', dept: 'engineering', level: '200' },
		{ id: 'ENG202', name: 'Mechanics', dept: 'engineering', level: '200' },
		{ id: 'ENG301', name: 'Control Systems', dept: 'engineering', level: '300' },
		{ id: 'ENG302', name: 'Thermodynamics', dept: 'engineering', level: '300' },
		
		// Business courses
		{ id: 'BUS101', name: 'Business Basics', dept: 'business', level: '100' },
		{ id: 'BUS102', name: 'Economics 101', dept: 'business', level: '100' },
		{ id: 'BUS201', name: 'Accounting', dept: 'business', level: '200' },
		{ id: 'BUS202', name: 'Management', dept: 'business', level: '200' },
		{ id: 'BUS301', name: 'Finance', dept: 'business', level: '300' },
		{ id: 'BUS302', name: 'Marketing', dept: 'business', level: '300' },
		
		// Law courses
		{ id: 'LAW101', name: 'Constitutional Law', dept: 'law', level: '100' },
		{ id: 'LAW102', name: 'Criminal Law', dept: 'law', level: '100' },
		{ id: 'LAW201', name: 'Contract Law', dept: 'law', level: '200' },
		{ id: 'LAW202', name: 'Tort Law', dept: 'law', level: '200' },
		
		// Medicine courses
		{ id: 'MED101', name: 'Anatomy', dept: 'medicine', level: '100' },
		{ id: 'MED102', name: 'Physiology', dept: 'medicine', level: '100' },
		{ id: 'MED201', name: 'Pathology', dept: 'medicine', level: '200' },
		{ id: 'MED202', name: 'Pharmacology', dept: 'medicine', level: '200' },
		
		// Arts & Sciences courses
		{ id: 'ART101', name: 'General Studies', dept: 'arts', level: '100' },
		{ id: 'ART102', name: 'Chemistry', dept: 'arts', level: '100' },
		{ id: 'ART201', name: 'Physics', dept: 'arts', level: '200' },
		{ id: 'ART202', name: 'Biology', dept: 'arts', level: '200' }
	];
	
	// Filter courses by selected department and level
	const filteredCourses = allCourses.filter(course => 
		course.dept === department && course.level === level
	);
	
	// Clear previous courses
	const coursesList = document.getElementById('courses-list');
	coursesList.innerHTML = '';
	
	// Display filtered courses
	if (filteredCourses.length === 0) {
		coursesList.innerHTML = '<p style="color: #999;">No courses available for this selection</p>';
		return;
	}
	
	filteredCourses.forEach(course => {
		const label = document.createElement('label');
		label.className = 'course-checkbox';
		label.innerHTML = `
			<input type="checkbox" name="course" value="${course.id}">
			<span class="course-name">${course.id} - ${course.name}</span>
		`;
		coursesList.appendChild(label);
	});
}

// Listen to department and level changes to update courses
document.addEventListener('change', function(e) {
	if (e.target.id === 'department' || e.target.id === 'level') {
		// Reload courses if on step 2
		if (currentSetupStep === 2) {
			loadCoursesForStudent();
		}
	}
});

// Check if user is already logged in
window.addEventListener('load', function() {
	const userData = localStorage.getItem('bucodel_user');
	if (userData) {
		const user = JSON.parse(userData);
		showDashboard(user.name);
	} else {
		// Show auth section if not logged in
		const authSection = document.getElementById('auth-section');
		if (authSection) {
			authSection.style.display = 'flex';
		}
	}
});

// Logout function
function logout() {
	// Clear all user data
	localStorage.removeItem('bucodel_user');
	localStorage.removeItem('bucodel_setup');
	window.registrationData = null;
	
	// Show login form
	const authSection = document.getElementById('auth-section');
	const setupSection = document.getElementById('setup-section');
	const dashboardSection = document.getElementById('dashboard-section');
	
	if (authSection) authSection.style.display = 'flex';
	if (setupSection) setupSection.style.display = 'none';
	if (dashboardSection) dashboardSection.style.display = 'none';
	
	// Show login form specifically
	const loginForm = document.getElementById('login-form');
	const registerForm = document.getElementById('register-form');
	const verifyForm = document.getElementById('verify-form');
	
	if (loginForm) loginForm.classList.add('active');
	if (registerForm) registerForm.classList.remove('active');
	if (verifyForm) verifyForm.classList.remove('active');
	
	// Clear form fields
	document.getElementById('login-email').value = '';
	document.getElementById('login-password').value = '';
	
	console.log('✅ Logged out successfully');
}

// Delete all registered users
function deleteAllUsers() {
	if (confirm('Are you sure you want to delete ALL registered users? This cannot be undone.')) {
		localStorage.clear();
		location.reload();
	}
}

// Toggle Sidebar
function toggleSidebar() {
	const sidebar = document.querySelector('.sidebar');
	sidebar.classList.toggle('collapsed');
	sidebar.classList.toggle('open');
}


// Load and display activities based on registered courses
function loadActivitiesForRegisteredCourses() {
	const userSetup = JSON.parse(localStorage.getItem('bucodel_setup') || 'null');
	
	if (!userSetup || !userSetup.registeredCourses || userSetup.registeredCourses.length === 0) {
		console.log('No registered courses found');
		return;
	}
	
	const activitiesContainer = document.getElementById('activities-view');
	if (!activitiesContainer) return;
	
	// Populate the course selector
	const courseSelector = document.getElementById('course-selector');
	if (courseSelector) {
		courseSelector.innerHTML = '<option value="">-- Choose a Course --</option>';
		
		userSetup.registeredCourses.forEach(courseId => {
			const courseInfo = courseDatabase[courseId] || { name: courseId };
			const option = document.createElement('option');
			option.value = courseId;
			option.textContent = `${courseId} - ${courseInfo.name}`;
			courseSelector.appendChild(option);
		});
		
		// Add event listener for course selection
		courseSelector.addEventListener('change', function() {
			displayActivitiesForCourse(this.value, userSetup.registeredCourses);
		});
	}
	
	// Create videos grid if it doesn't exist
	let videosGrid = activitiesContainer.querySelector('.videos-grid');
	if (!videosGrid) {
		videosGrid = document.createElement('div');
		videosGrid.className = 'videos-grid';
		const contentBox = activitiesContainer.querySelector('.content-box');
		if (contentBox) {
			const selector = contentBox.querySelector('#course-selector').parentElement;
			contentBox.appendChild(videosGrid);
		}
	}
	
	console.log('✅ Activities selector initialized for', userSetup.registeredCourses.length, 'courses');
}

// Display activities for a selected course
function displayActivitiesForCourse(courseId, registeredCourses) {
	const activitiesContainer = document.getElementById('activities-view');
	if (!activitiesContainer) return;
	
	let videosGrid = activitiesContainer.querySelector('.videos-grid');
	if (!videosGrid) {
		videosGrid = document.createElement('div');
		videosGrid.className = 'videos-grid';
		const contentBox = activitiesContainer.querySelector('.content-box');
		if (contentBox) {
			contentBox.appendChild(videosGrid);
		}
	}
	
	videosGrid.innerHTML = ''; // Clear existing content
	
	if (!courseId) {
		videosGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #999; padding: 40px; font-size: 16px;">Please select a course to view its activities.</p>';
		return;
	}
	
	const courseInfo = courseDatabase[courseId] || { name: courseId, dept: 'unknown' };
	const activities = courseActivities[courseId] || [];
	
	// Create a section header for the course
	const courseHeader = document.createElement('div');
	courseHeader.style.cssText = 'grid-column: 1 / -1; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #667eea;';
	courseHeader.innerHTML = `<h3 style="color: #667eea; margin: 0;">📚 ${courseId} - ${courseInfo.name}</h3>`;
	videosGrid.appendChild(courseHeader);
	
	// Display course activities
	if (activities.length > 0) {
		activities.forEach(activity => {
			const videoCard = document.createElement('div');
			videoCard.className = 'video-card';
			videoCard.innerHTML = `
				<div class="video-thumbnail">
					<iframe width="100%" height="200" data-src="${activity.videoUrl}" frameborder="0" sandbox="allow-scripts allow-popups" title="${activity.videoTitle} video"></iframe>
				</div>
				<div class="video-info">
					<h3>${activity.title}</h3>
					<p>${activity.description}</p>
					<small>Due: ${activity.dueDate}</small>
				</div>
			`;
			videosGrid.appendChild(videoCard);
		});
	} else {
		const noActivitiesMsg = document.createElement('p');
		noActivitiesMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; color: #999; padding: 20px; font-size: 14px;';
		noActivitiesMsg.textContent = 'No activities available for this course.';
		videosGrid.appendChild(noActivitiesMsg);
	}
	
	// Show programming resources if Computer Science course is selected
	if (courseInfo.dept === 'computer-science') {
		const programmingHeader = document.createElement('div');
		programmingHeader.style.cssText = 'grid-column: 1 / -1; margin-top: 30px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ff6b6b;';
		programmingHeader.innerHTML = `<h3 style="color: #ff6b6b; margin: 0;">💻 Programming Resources for ${courseId}</h3>`;
		videosGrid.appendChild(programmingHeader);
		
		// Display programming courses
		Object.keys(programmingCourses).forEach(progId => {
			const progCourse = programmingCourses[progId];
			const videoCard = document.createElement('div');
			videoCard.className = 'video-card';
			videoCard.innerHTML = `
				<div class="video-thumbnail">
					<iframe width="100%" height="200" data-src="${progCourse.videoUrl}" frameborder="0" sandbox="allow-scripts allow-popups" title="${progCourse.videoTitle} video"></iframe>
				</div>
				<div class="video-info">
					<h3>${progCourse.title}</h3>
					<p>${progCourse.description}</p>
					<small>${progCourse.duration}</small>
				</div>
			`;
			videosGrid.appendChild(videoCard);
		});
	}
	
	console.log(`✅ Activities and resources loaded for ${courseId}`);
}


// Initialize Sidebar
function initSidebar() {
	const navItems = document.querySelectorAll('.nav-item');
	
	navItems.forEach(item => {
		item.addEventListener('click', function(e) {
			// Don't trigger on logout button click
			if (this.classList.contains('btn-logout')) return;
			
			e.preventDefault();
			
			// Remove active class from all items
			navItems.forEach(nav => nav.classList.remove('active'));
			
			// Add active class to clicked item
			this.classList.add('active');
			
			// Get the data-view attribute to determine which content to show
			const viewName = this.getAttribute('data-view');
			
			if (viewName) {
				showContentView(viewName);
			}
			
			// Close sidebar on mobile after selection
			const sidebar = document.querySelector('.sidebar');
			if (window.innerWidth <= 768) {
				sidebar.classList.add('collapsed');
				sidebar.classList.remove('open');
			}
		});
	});
	
	// Set dashboard as default active
	const dashboardItem = document.querySelector('[data-view="dashboard"]');
	if (dashboardItem) {
		dashboardItem.classList.add('active');
	}
}

// Show/hide content views
function showContentView(viewName) {
	// Hide all content views
	const contentViews = document.querySelectorAll('.content-view');
	contentViews.forEach(view => {
		view.classList.remove('active');
	});
	
	// Show selected content view
	const selectedView = document.getElementById(viewName + '-view');
	if (selectedView) {
		selectedView.classList.add('active');
		
		// Load activities if showing the activities view
		if (viewName === 'activities') {
			loadActivitiesForRegisteredCourses();
		}
		
		// Load programming resources if showing the programming view
		if (viewName === 'programming') {
			loadProgrammingResources();
		}
	}
}

// Add click functionality to cards
document.querySelectorAll('.card').forEach(card => {
	card.addEventListener('click', function() {
		const title = this.querySelector('h3').textContent;
		console.log(`Navigating to: ${title}`);
	});
});

// Search functionality
document.querySelector('.btn-search')?.addEventListener('click', function() {
	const searchTerm = prompt('Enter what you want to search for:');
	if (searchTerm) {
		console.log(`Searching for: ${searchTerm}`);
	}
});

// Profile button functionality
document.querySelector('.btn-profile')?.addEventListener('click', function() {
	console.log('Opening profile menu');
});

// Smooth scroll for any anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function(e) {
		if (this.id !== 'logout-btn') {
			e.preventDefault();
			const href = this.getAttribute('href');
			// Only scroll if href is more than just '#'
			if (href && href.length > 1) {
				const target = document.querySelector(href);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				}
			}
		}
	});
});

// Add active state when card is clicked
document.querySelectorAll('.card-link').forEach(link => {
	link.addEventListener('click', function(e) {
		e.preventDefault();
		// Remove previous active state
		document.querySelectorAll('.card').forEach(card => card.classList.remove('active'));
		// Add active state to current card
		this.closest('.card').classList.add('active');
	});
});

// ==================== TRACK PRICE DISPLAY ====================
// Update price display when track is selected in registration or setup
function initializePriceDisplay() {
	// Registration form track change
	const registerDept = document.getElementById('register-department');
	if (registerDept) {
		registerDept.addEventListener('change', function() {
			const selectedTrack = this.value;
			const price = trackPricing[selectedTrack] || 0;
			if (price > 0) {
				console.log(`💰 ${selectedTrack} - Price: $${price}`);
			}
		});
	}
	
	// Setup form track change
	const setupDept = document.getElementById('department');
	if (setupDept) {
		setupDept.addEventListener('change', function() {
			const selectedTrack = this.value;
			const price = trackPricing[selectedTrack] || 0;
			if (price > 0) {
				console.log(`💰 Selected track price: $${price}`);
			}
		});
	}
}

// ==================== PAGE LOAD PROTECTION ====================
// WebSocket connection for real-time approval notifications
let approvalWebSocket;

// Connect to WebSocket server for real-time notifications
function connectApprovalWebSocket() {
	const user = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
	
	if (!user || !user.id) {
		console.log('⚠️ No user logged in, skipping WebSocket connection');
		return;
	}
	
	try {
		// Build WebSocket URL based on current page location
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = window.location.host;
		const wsUrl = `${protocol}//${host}`;
		
		console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);
		
		approvalWebSocket = new WebSocket(wsUrl);
		
		approvalWebSocket.onopen = () => {
			console.log('✅ WebSocket connected');
			
			// Send user ID to register for notifications
			approvalWebSocket.send(JSON.stringify({
				type: 'connect',
				userId: user.id
			}));
		};
		
		// Receive real-time messages from server
		approvalWebSocket.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				console.log('📨 WebSocket message received:', message);
				
				if (message.type === 'approval') {
					console.log('🎉 APPROVAL RECEIVED FROM SERVER!', message.message);
					showApprovalNotification(message.message);
				} else if (message.type === 'connected') {
					console.log('✅ Registered with server for real-time updates');
				}
			} catch (e) {
				console.error('Error parsing WebSocket message:', e);
			}
		};
		
		approvalWebSocket.onerror = (error) => {
			console.error('❌ WebSocket error:', error);
		};
		
		approvalWebSocket.onclose = () => {
			console.log('⚠️ WebSocket disconnected, attempting to reconnect in 5s...');
			setTimeout(connectApprovalWebSocket, 5000);
		};
	} catch (error) {
		console.error('❌ Error connecting to WebSocket:', error);
	}
}

// Show approval notification popup
function showApprovalNotification(message) {
	// Create a small toast notification in the corner
	let notificationContainer = document.getElementById('approval-notification');
	
	if (!notificationContainer) {
		notificationContainer = document.createElement('div');
		notificationContainer.id = 'approval-notification';
		notificationContainer.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
			color: white;
			padding: 16px 24px;
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0,0,0,0.3);
			z-index: 10000;
			max-width: 350px;
			animation: slideInRight 0.4s ease-in-out;
			font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			font-size: 14px;
		`;
		document.body.appendChild(notificationContainer);
	}
	
	notificationContainer.innerHTML = `
		<div style="font-weight: bold; margin-bottom: 5px;">✅ Payment Approved!</div>
		<div>${message}</div>
	`;
	
	notificationContainer.style.display = 'block';
	
	// Auto-hide after 2 seconds and then redirect
	setTimeout(() => {
		if (notificationContainer) {
			notificationContainer.style.display = 'none';
		}
		// Refresh page to check approval status and redirect if needed
		setTimeout(() => {
			console.log('🔄 Reloading page to process approval...');
			window.location.reload();
		}, 500);
	}, 2000);
}

// Poll for approvals every 3 seconds (fallback if WebSocket fails)
let approvalCheckInterval;
function startApprovalPolling() {
	console.log('📡 Starting approval polling (fallback)...');
	
	// First, try to establish WebSocket connection
	connectApprovalWebSocket();
	
	// Also keep polling as backup
	approvalCheckInterval = setInterval(() => {
		const user = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
		if (user && user.id && (!approvalWebSocket || approvalWebSocket.readyState !== WebSocket.OPEN)) {
			// Only poll if WebSocket is not connected
			checkApprovalViaAPI(user.id);
		}
	}, 5000);
}

// Fallback: Check approvals via API if WebSocket fails
async function checkApprovalViaAPI(userId) {
	try {
		const response = await fetch(window.appConfig.API_URL + '/api/user-notifications/' + userId);
		if (!response.ok) return;
		
		const data = await response.json();
		const approvalNotifications = data.notifications || [];
		
		if (approvalNotifications.length > 0 && !localStorage.getItem('bucodel_approval_shown')) {
			const approval = approvalNotifications[0];
			console.log('📬 Approval found via API (WebSocket backup):', approval);
			localStorage.setItem('bucodel_approval_shown', 'true');
			showApprovalNotification(approval.message);
		}
	} catch (error) {
		console.error('API fallback error:', error);
	}
}

function stopApprovalPolling() {
	if (approvalCheckInterval) {
		clearInterval(approvalCheckInterval);
		console.log('⏸️ Approval polling stopped');
	}
}

document.addEventListener('DOMContentLoaded', function() {
	console.log('📄 DOMContentLoaded event fired');
	
	// Clear old approval flags
	localStorage.removeItem('bucodel_approval_processed');
	localStorage.removeItem('bucodel_approval_shown');
	
	// Initialize auto-save for persistent page state
	PageStateManager.initAutoSave();
	
	// Initialize price display listeners
	try {
		initPaymentMethodListeners();
		initializePriceDisplay();
	} catch (e) {
		console.warn('⚠️ Payment init warning:', e.message);
	}
	
	const user = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
	const authSection = document.getElementById('auth-section');
	const setupSection = document.getElementById('setup-section');
	const dashboardSection = document.getElementById('dashboard-section');
	
	console.log('👤 User:', user ? user.email : 'No user');
	console.log('📍 Sections - Auth:', !!authSection, 'Setup:', !!setupSection, 'Dashboard:', !!dashboardSection);
	
	// If no user is logged in, show auth page and hide everything else
	if (!user) {
		console.log('🔓 No user - showing auth');
		if (authSection) {
			authSection.style.display = 'flex';
			authSection.classList.remove('hidden');
		}
		if (setupSection) setupSection.style.display = 'none';
		if (dashboardSection) dashboardSection.style.display = 'none';
	} else {
		// User is logged in - Check approval status
		console.log('🔒 User logged in - checking approval status...');
		
		// HIDE auth section COMPLETELY
		if (authSection) {
			authSection.style.display = 'none';
			authSection.style.visibility = 'hidden';
			authSection.style.opacity = '0';
			authSection.classList.add('hidden');
		}
		
		// Check user approval status
		checkUserApprovalOnPageLoad(user.id, user.name);
	}
});

// Check approval status when page loads
async function checkUserApprovalOnPageLoad(userId, userName) {
	try {
		console.log('🔍 Checking user approval on page load:', userId);
		
		const user = JSON.parse(localStorage.getItem('bucodel_user') || 'null');
		const userEmail = user?.email;
		
		// Try with email as fallback
		const approvalId = userEmail || userId;
		const response = await fetch(window.appConfig.API_URL + `/api/user-approval/${approvalId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();
		console.log('✅ Page load approval check:', data);

		const setupSection = document.getElementById('setup-section');
		const dashboardSection = document.getElementById('dashboard-section');

		if (data.isApproved) {
			// User is approved - show dashboard
			console.log('✅ User is approved! Showing dashboard...');
			if (setupSection) setupSection.style.display = 'none';
			if (dashboardSection) {
				dashboardSection.style.display = 'flex';
				dashboardSection.style.visibility = 'visible';
				dashboardSection.style.opacity = '1';
				dashboardSection.style.zIndex = '1';
				dashboardSection.style.pointerEvents = 'auto';
				console.log('✅ Dashboard shown');
			}
			
			// Initialize dashboard
			setTimeout(() => {
				try {
					if (typeof initSidebar === 'function') initSidebar();
					if (typeof filterMenuItems === 'function') filterMenuItems();
					if (typeof populateRegisteredCourses === 'function') populateRegisteredCourses();
					console.log('✅ Dashboard initialized');
				} catch (e) {
					console.error('❌ Dashboard init error:', e.message);
				}
				startApprovalPolling();
			}, 50);
		} else {
			// User NOT approved - if payment pending redirect to payment page, otherwise show waiting page
			console.log('⏳ User pending approval. Checking payment status...');
			if (data.payment_status && data.payment_status.toLowerCase() === 'pending') {
				console.log('🔁 Payment pending — redirecting to payment.html');
				window.location.href = 'payment.html';
				return;
			}
			// Otherwise show waiting page
			if (dashboardSection) dashboardSection.style.display = 'none';
			if (setupSection) {
				setupSection.style.display = 'flex';
				setupSection.style.visibility = 'visible';
				console.log('⏳ Waiting page shown');
			}
		}
	} catch (error) {
		console.error('❌ Error on page load approval check:', error);
		// Fallback: show dashboard
		const dashboardSection = document.getElementById('dashboard-section');
		const setupSection = document.getElementById('setup-section');
		if (setupSection) setupSection.style.display = 'none';
		if (dashboardSection) {
			dashboardSection.style.display = 'flex';
			dashboardSection.style.visibility = 'visible';
			dashboardSection.style.opacity = '1';
			dashboardSection.style.zIndex = '1';
			dashboardSection.style.pointerEvents = 'auto';
		}
	}
}

// ==================== LOAD TRACKS FOR REGISTRATION FORM ====================
// Function to load and populate tracks in the registration form
async function loadRegistrationTracks() {
	try {
		const response = await fetch(window.appConfig.API_URL + '/api/tracks');
		if (!response.ok) {
			console.error('Failed to load tracks:', response.status);
			return;
		}
		
		const result = await response.json();
		const tracks = result.data || result.tracks || [];
		
		// Load into registration form
		const trackSelect = document.getElementById('register-track');
		if (trackSelect) {
			while (trackSelect.options.length > 1) {
				trackSelect.remove(1);
			}
			tracks.forEach(track => {
				const option = document.createElement('option');
				option.value = track.code;
				option.textContent = track.name;
				option.dataset.trackId = track.id;
				option.dataset.price1year = track.prices ? track.prices['1-year'] : 0;
				trackSelect.appendChild(option);
			});
		}
		
		// Load into payment step (department dropdown)
		const deptSelect = document.getElementById('department');
		if (deptSelect) {
			while (deptSelect.options.length > 1) {
				deptSelect.remove(1);
			}
			tracks.forEach(track => {
				const option = document.createElement('option');
				option.value = track.code;
				option.textContent = track.name;
				option.dataset.trackId = track.id;
				option.dataset.price1year = track.prices ? track.prices['1-year'] : 0;
				deptSelect.appendChild(option);
			});
			
			// Add event listener for price updates
			deptSelect.addEventListener('change', updatePaymentSummary);
		}
		
		// Load duration options
		const levelSelect = document.getElementById('level');
		if (levelSelect) {
			levelSelect.addEventListener('change', updatePaymentSummary);
		}
		
		console.log('✓ Tracks loaded:', tracks.length, 'tracks');
	} catch (error) {
		console.error('Error loading tracks:', error);
	}
}

// Load tracks when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', loadRegistrationTracks);
} else {
	// Call immediately if DOM is already loaded
	setTimeout(loadRegistrationTracks, 500);
}

// Restore page state after a short delay to allow DOM to settle
setTimeout(() => {
	const savedState = PageStateManager.restoreState();
	if (savedState) {
		console.log('🔄 Restoring page state...');
		
		// Restore form data
		PageStateManager.restoreFormData(savedState.formData);
		
		// Restore selections
		if (savedState.selectedTrack) {
			PageStateManager.restoreTrack(savedState.selectedTrack);
		}
		if (savedState.selectedDuration) {
			PageStateManager.restoreDuration(savedState.selectedDuration);
		}
		if (savedState.selectedPaymentMethod) {
			PageStateManager.restorePaymentMethod(savedState.selectedPaymentMethod);
		}
		
		// Restore registration data
		if (savedState.registrationData && Object.keys(savedState.registrationData).length > 0) {
			window.registrationData = savedState.registrationData;
			console.log('✓ Registration data restored');
		}
		
		// Restore current step if user was in setup
		if (savedState.currentStep && document.getElementById('setup-section')?.style.display !== 'none') {
			const stepElement = document.querySelector(`[data-setup-step="${savedState.currentStep}"]`);
			if (stepElement) {
				// Switch to saved step
				const stepNum = parseInt(savedState.currentStep);
				if (!isNaN(stepNum)) {
					setTimeout(() => switchSetupStep(stepNum), 300);
				}
			}
		}
		
		console.log('✅ Page state fully restored');
	}
}, 1500);
