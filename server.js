const express = require('express');
const cors = require('cors');
// Supabase removed: provide a lightweight stub to avoid runtime crashes
function createClient() {
  // thenable stub for query chains (e.g., supabase.from(...).select(...).eq(...).single())
  const chainable = {
    select() { return this; },
    eq() { return this; },
    single() { return this; },
    order() { return this; },
    insert() { return this; },
    update() { return this; },
    delete() { return this; },
    // make object thenable so `await supabase.from(...).select()` works
    then(resolve) {
      resolve({ data: null, error: new Error('Supabase has been removed from this build') });
    }
  };

  return {
    from() { return chainable; },
    auth: {
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase removed') }),
      signOut: async () => ({ error: new Error('Supabase removed') }),
      getUser: async () => ({ data: null, error: new Error('Supabase removed') })
    }
  };
}
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { generateVerificationCode, sendVerificationEmail, storeVerificationCode, verifyCode } = require('./email-service');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5002;
const USER_JSON_PATH = path.join(__dirname, 'user.json');

// Store connected WebSocket clients by userId
const connectedUsers = new Map();
// Map to store active class sessions: meetingId -> { courseCode, teacherId, startedAt, screenSharing, participants: Set }
const activeClasses = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// ==================== USER.JSON HELPERS ====================
function readUsersJSON() {
  try {
    if (fs.existsSync(USER_JSON_PATH)) {
      const data = fs.readFileSync(USER_JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      // Ensure the parsed data has the required structure
      if (!parsed.users || !Array.isArray(parsed.users)) {
        return { users: [], metadata: { total_users: 0, last_updated: new Date().toISOString() } };
      }
      return parsed;
    }
  } catch (err) {
    console.warn('⚠️  Could not read user.json:', err.message);
  }
  // Return default structure if file doesn't exist or is invalid
  return { users: [], metadata: { total_users: 0, last_updated: new Date().toISOString() } };
}

function writeUsersJSON(data) {
  try {
    fs.writeFileSync(USER_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Saved to user.json');
    return true;
  } catch (err) {
    console.error('❌ Error writing to user.json:', err.message);
    return false;
  }
}

function addUserToJSON(userId, email, fullName) {
  try {
    const data = readUsersJSON();
    
    // Check if user already exists
    const userExists = data.users.some(u => u.email === email);
    if (userExists) {
      console.log('ℹ️  User already exists in user.json');
      return false;
    }
    
    // Add new user with payment history and course registration
    const newUser = {
      id: userId,
      email: email,
      full_name: fullName,
      role: "student",
      department: null,
      level: null,
      payment_status: "pending",
      payment_history: [],
      registered_courses: [],
      course_registration_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.users.push(newUser);
    data.metadata = {
      total_users: data.users.length,
      last_updated: new Date().toISOString()
    };
    
    return writeUsersJSON(data);
  } catch (err) {
    console.error('❌ Error adding user to JSON:', err.message);
    return false;
  }
}

// Helper function to add user with department and level
function addUserToJSONWithDetails(userId, email, fullName, department, level) {
  try {
    const data = readUsersJSON();
    
    // Check if user already exists
    const userExists = data.users.some(u => u.email === email);
    if (userExists) {
      console.log('ℹ️  User already exists in user.json');
      return false;
    }
    
    // Add new user with department and level pre-filled
    const newUser = {
      id: userId,
      email: email,
      full_name: fullName,
      role: "student",
      department: department || null,
      level: level || null,
      payment_status: "pending",
      payment_history: [],
      registered_courses: [],
      course_registration_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.users.push(newUser);
    data.metadata = {
      total_users: data.users.length,
      last_updated: new Date().toISOString()
    };
    
    console.log('✅ User added with department and level:', { department, level });
    return writeUsersJSON(data);
  } catch (err) {
    console.error('❌ Error adding user with details to JSON:', err.message);
    return false;
  }
}

// Helper function to add user with password (for server-side auth)
async function addUserWithPassword(email, fullName, department, level, hashedPassword) {
  try {
    const data = readUsersJSON();
    
    // Check if user already exists
    const userExists = data.users.some(u => u.email === email);
    if (userExists) {
      console.log('ℹ️  User already exists in user.json');
      return false;
    }
    
    // Generate a simple ID (timestamp-based)
    const userId = `user_${Date.now()}`;
    
    // Add new user with hashed password
    const newUser = {
      id: userId,
      email: email,
      full_name: fullName,
      password_hash: hashedPassword,
      role: "student",
      department: department || null,
      level: level || null,
      payment_status: "pending",
      payment_history: [],
      registered_courses: [],
      course_registration_history: [],
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.users.push(newUser);
    data.metadata = {
      total_users: data.users.length,
      last_updated: new Date().toISOString()
    };
    
    console.log('✅ User added with hashed password:', { email, department, level });
    return writeUsersJSON(data) ? userId : false;
  } catch (err) {
    console.error('❌ Error adding user with password to JSON:', err.message);
    return false;
  }
}

// Helper function to add user with contact information
async function addUserWithPasswordAndContact(email, fullName, phone, country, address, hashedPassword) {
  try {
    const data = readUsersJSON();
    
    // Check if user already exists
    const userExists = data.users.some(u => u.email === email);
    if (userExists) {
      console.log('ℹ️  User already exists in user.json');
      return false;
    }
    
    // Generate a simple ID (timestamp-based)
    const userId = `user_${Date.now()}`;
    
    // Add new user with contact information
    const newUser = {
      id: userId,
      email: email,
      full_name: fullName,
      password_hash: hashedPassword,
      phone: phone,
      country: country,
      address: address,
      role: "student",
      department: null,
      level: null,
      payment_status: "pending",
      payment_history: [],
      registered_courses: [],
      course_registration_history: [],
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.users.push(newUser);
    data.metadata = {
      total_users: data.users.length,
      last_updated: new Date().toISOString()
    };
    
    console.log('✅ User added with contact information:', { email, phone, country });
    return writeUsersJSON(data) ? userId : false;
  } catch (err) {
    console.error('❌ Error adding user with contact info to JSON:', err.message);
    return false;
  }
}

// Helper function to verify user password
async function verifyUserPassword(email, password) {
  try {
    const data = readUsersJSON();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { valid: false, message: 'User not found' };
    }
    
    if (!user.password_hash) {
      return { valid: false, message: 'User authentication not configured' };
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return { valid: false, message: 'Invalid password' };
    }
    
    console.log('✅ Password verified for user:', user.email);
    return { valid: true, user: user };
  } catch (err) {
    console.error('❌ Error verifying password:', err.message);
    return { valid: false, message: 'Error verifying password' };
  }
}

// Helper function to update user email_verified status
function markEmailAsVerified(email) {
  try {
    const data = readUsersJSON();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.warn('⚠️  User not found for verification:', email);
      return false;
    }
    
    user.email_verified = true;
    user.updated_at = new Date().toISOString();
    
    console.log('✅ User email marked as verified:', user.email);
    return writeUsersJSON(data);
  } catch (err) {
    console.error('❌ Error marking email as verified:', err.message);
    return false;
  }
}

// Helper function to update user payment history
function updateUserPaymentHistory(userId, paymentData) {
  try {
    const data = readUsersJSON();
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
      console.error('❌ User not found:', userId);
      return false;
    }
    
    if (!user.payment_history) {
      user.payment_history = [];
    }
    
    user.payment_history.push({
      transaction_id: paymentData.transaction_id || `TXN_${Date.now()}`,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      status: paymentData.status || 'completed',
      method: paymentData.method || 'unknown',
      timestamp: new Date().toISOString(),
      description: paymentData.description || ''
    });
    
    user.payment_status = paymentData.status === 'completed' ? 'completed' : 'pending';
    user.updated_at = new Date().toISOString();
    
    return writeUsersJSON(data);
  } catch (err) {
    console.error('❌ Error updating payment history:', err.message);
    return false;
  }
}

// Helper function to update course registration
function updateUserCourseRegistration(userId, courseData) {
  try {
    const data = readUsersJSON();
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
      console.error('❌ User not found:', userId);
      return false;
    }
    
    if (!user.registered_courses) {
      user.registered_courses = [];
    }
    
    if (!user.course_registration_history) {
      user.course_registration_history = [];
    }
    
    // Add to registered courses
    user.registered_courses.push({
      code: courseData.code,
      title: courseData.title,
      instructor: courseData.instructor,
      credits: courseData.credits || 3,
      registered_at: new Date().toISOString()
    });
    
    // Add to registration history
    user.course_registration_history.push({
      action: 'registered',
      course_code: courseData.code,
      course_title: courseData.title,
      timestamp: new Date().toISOString(),
      status: 'active'
    });
    
    user.updated_at = new Date().toISOString();
    
    return writeUsersJSON(data);
  } catch (err) {
    console.error('❌ Error updating course registration:', err.message);
    return false;
  }
}

// Supabase Configuration
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  Warning: Supabase credentials not found in .env file');
}
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Helper function to update user setup data (department, level, courses)
function updateUserSetupData(userId, setupData) {
  try {
    const data = readUsersJSON();
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
      console.error('❌ User not found:', userId);
      return false;
    }
    
    // Update department and level
    if (setupData.department) {
      user.department = setupData.department;
    }
    if (setupData.level) {
      user.level = setupData.level;
    }
    
    // Update track information
    if (setupData.trackId) {
      user.trackId = setupData.trackId;
    }
    if (setupData.trackName) {
      user.trackName = setupData.trackName;
    }
    if (setupData.trackDuration) {
      user.trackDuration = setupData.trackDuration;
    }
    
    // Update registered courses
    if (setupData.courses && Array.isArray(setupData.courses)) {
      if (!user.registered_courses) {
        user.registered_courses = [];
      }
      // Add courses to registered_courses
      setupData.courses.forEach(course => {
        const courseExists = user.registered_courses.some(c => c.code === course.code);
        if (!courseExists) {
          user.registered_courses.push({
            code: course.code,
            title: course.title || course.code,
            instructor: course.instructor || 'TBA',
            credits: course.credits || 3,
            registered_at: new Date().toISOString()
          });
        }
      });
    }
    
    user.updated_at = new Date().toISOString();
    return writeUsersJSON(data);
  } catch (err) {
    console.error('❌ Error updating setup data:', err.message);
    return false;
  }
}

let supabase, supabaseAdmin;

try {
  // Log Supabase configuration (without exposing full keys)
  console.log('🔍 Supabase Configuration:');
  console.log('   URL:', SUPABASE_URL);
  console.log('   Anon Key:', SUPABASE_ANON_KEY ? (SUPABASE_ANON_KEY.substring(0, 20) + '...') : '❌ Missing');
  console.log('   Service Key:', SUPABASE_SERVICE_KEY ? '✅ Provided' : '❌ Missing');
  
  // Initialize Supabase Client
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Initialize Supabase Admin Client (for sensitive operations)
  supabaseAdmin = SUPABASE_SERVICE_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null;
  
  console.log('✅ Supabase clients initialized successfully');
} catch (err) {
  console.error('❌ Error initializing Supabase:', err.message);
}

// ==================== REGISTRATION ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration endpoint hit (Server-side)');
    console.log('📋 Request body:', req.body);
    
    const { name, email, password, confirmPassword, phone, country, address } = req.body;

    console.log('📝 Registration attempt:', { name, email, phone, country, passwordLength: password?.length });

    // Validation
    if (!name || !email || !password || !confirmPassword || !phone || !country || !address) {
      console.error('❌ Missing fields:', { name: !!name, email: !!email, password: !!password, confirmPassword: !!confirmPassword, phone: !!phone, country: !!country, address: !!address });
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      console.error('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.error('❌ Invalid email format');
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if user already exists in user.json
    const data = readUsersJSON();
    const existingUser = data.users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      console.error('❌ Email already registered');
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Add user to user.json with contact information
    console.log('📝 Saving user to user.json with contact info...');
    const userId = await addUserWithPasswordAndContact(email.toLowerCase(), name, phone, country, address, hashedPassword);

    if (!userId) {
      console.error('❌ Failed to save user to user.json');
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Generate and send verification code
    const verificationCode = generateVerificationCode();
    try {
      await sendVerificationEmail(email, verificationCode);
      storeVerificationCode(email, verificationCode);
      console.log('✅ Verification code sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError.message);
      // Don't fail registration if email fails - user can resend
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      user: {
        id: userId,
        email: email,
        name: name
      },
      nextStep: 'verify-email'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// ==================== EMAIL VERIFICATION ====================
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    console.log('📝 Verify code endpoint hit (Server-side)');
    const { email, code } = req.body;

    console.log('📧 Email:', email, '| Code length:', code?.length);

    // Validation
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Allow test code "000000" for development/testing
    if (code === '000000') {
      console.log('🧪 Using test code for:', email);
    } else {
      // Verify the code normally
      const verification = verifyCode(email, code);
      
      if (!verification.valid) {
        console.error('❌ Code verification failed:', verification.message);
        return res.status(400).json({
          success: false,
          message: verification.message
        });
      }
      console.log('✅ Code verified successfully for:', email);
    }
    
    // Mark email as verified in user.json
    const updated = markEmailAsVerified(email);
    
    if (!updated) {
      console.warn('⚠️ Could not mark email as verified in user.json');
      return res.status(500).json({
        success: false,
        message: 'Failed to update verification status'
      });
    }
    
    console.log('✅ Email verification complete for:', email);
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      email: email
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

// ==================== RESEND VERIFICATION CODE ====================
app.post('/api/auth/resend-code', async (req, res) => {
  try {
    console.log('📝 Resend code endpoint hit');
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate and send new verification code
    const verificationCode = generateVerificationCode();
    
    try {
      await sendVerificationEmail(email, verificationCode);
      storeVerificationCode(email, verificationCode);
      console.log('✅ New verification code sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully!',
      email: email
    });

  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending code'
    });
  }
});

// ==================== LOGIN ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📝 Login endpoint hit (Server-side)');

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Verify password against stored hash
    console.log('🔐 Verifying password...');
    const verification = await verifyUserPassword(email.toLowerCase(), password);

    if (!verification.valid) {
      console.error('❌ Login failed:', verification.message);
      return res.status(401).json({
        success: false,
        message: verification.message || 'Invalid email or password'
      });
    }

    const user = verification.user;

    // Check if email is verified
    if (!user.email_verified) {
      console.warn('⚠️  Email not verified for:', email);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    console.log('✅ Login successful for:', email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        department: user.department,
        level: user.level,
        track: user.trackName || user.trackId || null,
        trackId: user.trackId || null,
        trackName: user.trackName || null,
        trackDuration: user.trackDuration || null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ==================== EMAIL VERIFICATION ====================
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log('📝 Email verification attempt:', { email });

    // Validation
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Verify the code
    const result = verifyCode(email, code);
    
    if (!result.valid) {
      console.warn('❌ Invalid verification code:', result.message);
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    // Mark email as verified in user.json
    const markVerified = markEmailAsVerified(email);
    if (!markVerified) {
      console.warn('⚠️  Could not mark email as verified in user.json');
    } else {
      console.log('✅ Email marked as verified in user.json');
    }

    // Auto-confirm user email using admin client if available
    if (supabaseAdmin) {
      try {
        // Get the user ID from email
        const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
        const user = users.users.find(u => u.email === email);

        if (user) {
          // Confirm the user
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
          );

          if (!updateError) {
            console.log('✅ Email confirmed in Supabase for user:', email);
          }
        }
      } catch (err) {
        console.warn('⚠️  Could not confirm email in Supabase:', err.message);
      }
    }

    console.log('✅ Email verification complete for:', email);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      nextStep: 'login'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// ==================== RESEND VERIFICATION CODE ====================
// ==================== PAYMENT ENDPOINT ====================
app.post('/api/payment', async (req, res) => {
  try {
    const { userId, amount, currency, method, description, status } = req.body;

    console.log('💰 Payment endpoint hit:', { userId, amount, currency, method });

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'User ID and amount are required'
      });
    }

    const paymentData = {
      transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: currency || 'USD',
      status: status || 'completed',
      method: method || 'credit_card',
      description: description || ''
    };

    const success = updateUserPaymentHistory(userId, paymentData);

    if (success) {
      console.log('✅ Payment recorded successfully');
      res.status(200).json({
        success: true,
        message: 'Payment recorded successfully',
        transaction: paymentData
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to record payment'
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing payment'
    });
  }
});

// ==================== SAVE PAYMENT ENDPOINT ====================
app.post('/api/save-payment', async (req, res) => {
  try {
    const paymentRecord = req.body;

    console.log('💾 Save payment endpoint hit:', paymentRecord);

    if (!paymentRecord) {
      return res.status(400).json({
        success: false,
        message: 'Payment record is required'
      });
    }

    const paymentPath = path.join(__dirname, 'payment.json');
    let paymentData = { payments: [], totalPayments: 0, totalAmount: 0, lastUpdated: new Date().toISOString() };

    // Read existing payment data
    if (fs.existsSync(paymentPath)) {
      try {
        const existingData = fs.readFileSync(paymentPath, 'utf8');
        paymentData = JSON.parse(existingData);
        if (!Array.isArray(paymentData.payments)) {
          paymentData.payments = [];
        }
      } catch (err) {
        console.warn('⚠️  Could not read existing payment.json:', err.message);
        paymentData = { payments: [], totalPayments: 0, totalAmount: 0, lastUpdated: new Date().toISOString() };
      }
    }

    // Add new payment record with extracted user name, method, and status
    const newPayment = {
      id: paymentRecord.id || (`PAY-${Date.now()}`),
      userId: paymentRecord.userId || null,
      userEmail: paymentRecord.userEmail || null,
      userName: paymentRecord.userName || 'Unknown User',
      amount: paymentRecord.amount || 0,
      method: paymentRecord.method || 'unknown',
      status: paymentRecord.status || 'pending',
      department: paymentRecord.department || null,
      level: paymentRecord.level || null,
      courseName: paymentRecord.courseName || null,
      timestamp: paymentRecord.timestamp || new Date().toISOString(),
      date: paymentRecord.date || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Payment Record Created:', {
      id: newPayment.id,
      userName: newPayment.userName,
      method: newPayment.method,
      status: newPayment.status,
      amount: newPayment.amount
    });

    paymentData.payments.push(newPayment);
    paymentData.totalPayments = paymentData.payments.length;
    paymentData.totalAmount = paymentData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    paymentData.lastUpdated = new Date().toISOString();

    // Write updated payment data
    fs.writeFileSync(paymentPath, JSON.stringify(paymentData, null, 2), 'utf8');
    console.log('✅ Payment saved to payment.json:', {
      totalPayments: paymentData.totalPayments,
      totalAmount: paymentData.totalAmount
    });

    // Also update user's payment_status in user.json
    if (newPayment.userId) {
      try {
        const userData = readUsersJSON();
        const user = userData.users.find(u => u.id === newPayment.userId);
        if (user) {
          // Respect the payment status submitted; default to 'pending' unless completed
          user.payment_status = (newPayment.status === 'completed') ? 'completed' : 'pending';
          user.payment_history = user.payment_history || [];
          user.payment_history.push({
            id: newPayment.id,
            amount: newPayment.amount,
            method: newPayment.method,
            status: newPayment.status || 'pending',
            date: new Date().toISOString()
          });
          user.updated_at = new Date().toISOString();
          writeUsersJSON(userData);
          console.log('✅ User payment status updated in user.json for:', newPayment.userId, '->', user.payment_status);
        }
      } catch (err) {
        console.warn('⚠️  Could not update user payment status:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment saved successfully',
      payment: newPayment,
      data: {
        id: newPayment.id,
        userName: newPayment.userName,
        method: newPayment.method,
        status: newPayment.status,
        amount: newPayment.amount,
        totalPayments: paymentData.totalPayments
      }
    });
  } catch (error) {
    console.error('❌ Save payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving payment'
    });
  }
});

// ==================== COURSE REGISTRATION ENDPOINT ====================
app.post('/api/courses/register', async (req, res) => {
  try {
    const { userId, courses } = req.body;

    console.log('📚 Course registration endpoint hit:', { userId, courseCount: courses?.length });

    if (!userId || !courses || !Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: 'User ID and courses array are required'
      });
    }

    let successCount = 0;
    const results = [];

    for (const course of courses) {
      const courseData = {
        code: course.code,
        title: course.title,
        instructor: course.instructor || 'TBA',
        credits: course.credits || 3
      };

      const success = updateUserCourseRegistration(userId, courseData);
      
      if (success) {
        successCount++;
        results.push({
          code: course.code,
          status: 'registered',
          timestamp: new Date().toISOString()
        });
      } else {
        results.push({
          code: course.code,
          status: 'failed'
        });
      }
    }

    console.log(`✅ Registered ${successCount}/${courses.length} courses`);
    res.status(200).json({
      success: successCount === courses.length,
      message: `Successfully registered ${successCount} out of ${courses.length} courses`,
      registered: results
    });
  } catch (error) {
    console.error('Course registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during course registration'
    });
  }
});

// ==================== DEMO MODE LOGIN ====================
app.post('/api/auth/demo-login', async (req, res) => {
  try {
    const demoEmail = 'demo@apkl.test';
    const demoPassword = 'DemoPassword123!';
    const demoName = 'Demo Student';

    // Try to login first
    let authData = null;
    let authError = null;

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    });

    if (!loginError) {
      authData = loginData;
    } else {
      // If login fails, try to create the demo account (admin only)
      if (supabaseAdmin) {
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: demoEmail,
          password: demoPassword,
          email_confirm: true,
          user_metadata: {
            full_name: demoName,
            role: 'student'
          }
        });

        if (!createError) {
          // Create user profile
          await supabase
            .from('users')
            .insert([{
              id: createData.user.id,
              email: demoEmail,
              full_name: demoName,
              role: 'student'
            }])
            .select();

          // Now login
          const { data: newLoginData, error: newLoginError } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword
          });

          if (newLoginError) {
            throw newLoginError;
          }
          authData = newLoginData;
        } else {
          authError = createError;
        }
      } else {
        authError = loginError;
      }
    }

    if (authError) {
      console.error('Demo login error:', authError);
      return res.status(401).json({
        success: false,
        message: 'Demo mode not available'
      });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', demoEmail)
      .single();

    res.status(200).json({
      success: true,
      message: 'Demo login successful',
      user: {
        id: authData.user.id,
        email: demoEmail,
        name: userProfile?.full_name || demoName,
        session: authData.session
      }
    });

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during demo login'
    });
  }
});

// ==================== CREATE USER (Admin) ====================
app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if using admin client
    if (!supabaseAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin operations not configured'
      });
    }

    // Create user with admin client (bypasses email verification)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: role || 'student'
      }
    });

    if (authError) {
      console.error('Admin user creation error:', authError);
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email,
        full_name: name,
        role: role || 'student',
        created_at: new Date().toISOString()
      }])
      .select();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(400).json({
        success: false,
        message: 'User created but profile setup failed'
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: email,
        name: name,
        role: role || 'student'
      }
    });

  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
});

// ==================== GET USER PROFILE ====================
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

// ==================== LOGOUT ====================
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// ==================== CHECK USER APPROVAL STATUS ====================
app.get('/api/user-approval/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const data = readUsersJSON();
    let user = data.users.find(u => u.id === userId);

    // If user not found by ID, try to find by email (fallback)
    if (!user && userId.includes('@')) {
      user = data.users.find(u => u.email.toLowerCase() === userId.toLowerCase());
    }

    if (!user) {
      console.warn(`⚠️ User not found with ID or email: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        isApproved: false
      });
    }

    const isApproved = user.payment_status === 'completed';
    
    console.log(`✅ Approval check for ${user.email}: isApproved=${isApproved}, status=${user.payment_status}`);
    
    res.status(200).json({
      success: true,
      isApproved: isApproved,
      payment_status: user.payment_status,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        department: user.department,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Error checking user approval:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking approval status',
      isApproved: false
    });
  }
});

// ==================== UPDATE USER PAYMENT STATUS (Admin Approval) ====================
app.put('/api/user-payment-approval/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // status should be 'completed' or 'approved'

    const data = readUsersJSON();
    let user = data.users.find(u => u.id === userId);

    // If user not found by ID, try to find by email
    if (!user && userId.includes('@')) {
      user = data.users.find(u => u.email.toLowerCase() === userId.toLowerCase());
    }

    if (!user) {
      console.warn(`⚠️ User not found with ID or email: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's payment status to 'completed' when admin approves
    user.payment_status = 'completed';
    user.updated_at = new Date().toISOString();

    // Save updated user data
    writeUsersJSON(data);

    console.log(`✅ Payment approved for user: ${user.email}, status updated to: completed`);

    res.status(200).json({
      success: true,
      message: 'User payment status updated to completed',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        payment_status: user.payment_status
      }
    });
  } catch (error) {
    console.error('Error updating user payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating payment status'
    });
  }
});

// ==================== GET USERS FROM user.json ====================
app.get('/api/users-json', (req, res) => {
  try {
    const data = readUsersJSON();
    res.status(200).json({
      success: true,
      message: 'Users from user.json',
      data: data
    });
  } catch (error) {
    console.error('Error reading user.json:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reading user data'
    });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// ==================== TRACKS & DURATION ENDPOINTS ====================

// Helper function to read tracks JSON
function readTracksJSON() {
  try {
    const tracksPath = path.join(__dirname, 'track&duration.json');
    if (fs.existsSync(tracksPath)) {
      const data = fs.readFileSync(tracksPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('⚠️  Could not read track&duration.json:', err.message);
  }
  return { tracks: [], metadata: { lastUpdated: new Date().toISOString(), totalTracks: 0, version: '1.0' } };
}

// Helper function to write tracks JSON
function writeTracksJSON(data) {
  try {
    const tracksPath = path.join(__dirname, 'track&duration.json');
    fs.writeFileSync(tracksPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Saved to track&duration.json');
    return true;
  } catch (err) {
    console.error('❌ Error writing to track&duration.json:', err.message);
    return false;
  }
}

// Get all available tracks
app.get('/api/tracks', (req, res) => {
  try {
    const tracksData = readTracksJSON();
    res.status(200).json({
      success: true,
      data: tracksData.tracks,
      metadata: tracksData.metadata
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tracks'
    });
  }
});

// Get specific track by ID
app.get('/api/tracks/:trackId', (req, res) => {
  try {
    const { trackId } = req.params;
    const tracksData = readTracksJSON();
    const track = tracksData.tracks.find(t => t.id === trackId);
    
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: track
    });
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch track'
    });
  }
});

// Get track by name (for user selection)
app.get('/api/tracks-by-name/:trackName', (req, res) => {
  try {
    const { trackName } = req.params;
    const tracksData = readTracksJSON();
    const track = tracksData.tracks.find(t => t.name.toLowerCase() === trackName.toLowerCase());
    
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: track
    });
  } catch (error) {
    console.error('Error fetching track by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch track'
    });
  }
});

// Get courses for a specific track
app.get('/api/tracks/:trackId/courses', (req, res) => {
  try {
    const { trackId } = req.params;
    const tracksData = readTracksJSON();
    const track = tracksData.tracks.find(t => t.id === trackId);
    
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    res.status(200).json({
      success: true,
      trackName: track.name,
      courses: track.courses
    });
  } catch (error) {
    console.error('Error fetching track courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
});

// Get track metadata and statistics
app.get('/api/tracks-metadata', (req, res) => {
  try {
    const tracksData = readTracksJSON();
    const metadata = {
      totalTracks: tracksData.tracks.length,
      totalCourses: tracksData.tracks.reduce((sum, t) => sum + (t.courses?.length || 0), 0),
      tracks: tracksData.tracks.map(t => ({
        id: t.id,
        name: t.name,
        code: t.code,
        duration: t.duration,
        courseCount: t.courses?.length || 0
      })),
      ...tracksData.metadata
    };
    
    res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error fetching tracks metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metadata'
    });
  }
});

// ==================== TRACK ENROLLMENT (append student to track) ====================
app.post('/api/track-enroll', (req, res) => {
  try {
    const { trackId, userId, name, email } = req.body;

    if (!trackId || !userId) {
      return res.status(400).json({ success: false, message: 'trackId and userId are required' });
    }

    const tracksData = readTracksJSON();
    // Allow passing either track id or code
    const track = tracksData.tracks.find(t => t.id === trackId || t.code === trackId);

    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    if (!track.students) track.students = [];

    const already = track.students.find(s => (s.userId && s.userId === userId) || (s.email && email && s.email.toLowerCase() === email.toLowerCase()));
    if (already) {
      return res.status(200).json({ success: true, message: 'User already enrolled in track', data: already });
    }

    const studentRecord = {
      userId: userId,
      name: name || null,
      email: email || null,
      enrolledAt: new Date().toISOString()
    };

    track.students.push(studentRecord);
    // update metadata
    tracksData.metadata = tracksData.metadata || {};
    tracksData.metadata.lastUpdated = new Date().toISOString();

    const ok = writeTracksJSON(tracksData);
    if (!ok) {
      return res.status(500).json({ success: false, message: 'Failed to update track file' });
    }

    return res.status(201).json({ success: true, message: 'Enrolled user to track', data: studentRecord });
  } catch (err) {
    console.error('Error enrolling to track:', err.message);
    return res.status(500).json({ success: false, message: 'Server error enrolling to track' });
  }
});

// ==================== SUPABASE CONNECTIVITY TEST ====================
app.get('/api/supabase-status', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        status: 'Supabase not initialized',
        configured: false
      });
    }

    // Test connectivity by attempting a simple query
    const { data, error } = await supabase.auth.getUser();
    
    if (error && error.message !== 'Auth session missing') {
      return res.status(503).json({
        success: false,
        status: 'Supabase connection failed',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      status: 'Connected to Supabase',
      url: SUPABASE_URL,
      configured: true
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'Supabase connection error',
      error: err.message
    });
  }
});

// ==================== UPDATE SETUP DATA ====================
app.post('/api/user/:userId/setup', async (req, res) => {
  try {
    const { userId } = req.params;
    const { department, level, courses, trackId, trackName, trackDuration } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Update user setup data in user.json
    const setupData = {
      department,
      level,
      trackId,
      trackName,
      trackDuration,
      courses: courses || []
    };

    const success = updateUserSetupData(userId, setupData);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Setup data saved to user.json',
        data: {
          userId,
          department,
          level,
          trackId,
          trackName,
          trackDuration,
          coursesCount: courses ? courses.length : 0
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to save setup data'
      });
    }
  } catch (error) {
    console.error('Error updating setup data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating setup data'
    });
  }
});

// ==================== ADMIN DASHBOARD APIs ====================

// GET DASHBOARD STATS
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const usersData = readUsersJSON();
    const totalUsers = usersData.users ? usersData.users.length : 0;
    
    // Return a flat shape that the admin UI expects
    const recentRegistrations = (usersData.users || []).slice(-5).map(u => ({
      name: u.full_name || u.name || 'Unknown',
      email: u.email || 'N/A',
      created_at: u.created_at || u.createdAt || new Date().toISOString()
    }));

    res.status(200).json({
      totalUsers: totalUsers,
      pendingApplications: Math.floor(Math.random() * 10),
      approvedApplications: Math.floor(Math.random() * 10),
      totalRevenue: parseFloat((Math.random() * 100000).toFixed(2)),
      recentRegistrations: recentRegistrations
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data'
    });
  }
});

// GET ALL USERS (Admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const usersData = readUsersJSON();
    const users = usersData.users || [];
    
    const formattedUsers = users.map((user, index) => ({
      id: user.id || `user_${index + 1}`,
      full_name: user.full_name || user.fullName || user.name || 'Unknown',
      email: user.email || 'N/A',
      phone: user.phone || null,
      country: user.country || null,
      email_verified: !!user.email_verified,
      created_at: user.created_at || user.createdAt || new Date().toISOString()
    }));

    res.status(200).json({
      users: formattedUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load users'
    });
  }
});

// GET ALL APPLICATIONS (Admin)
app.get('/api/admin/applications', async (req, res) => {
  try {
    // Sample applications data
    const applications = [
      {
        id: 1,
        userId: 1,
        course: 'Computer Science',
        status: 'Approved',
        appliedDate: new Date().toISOString().split('T')[0],
        applicant: 'John Doe'
      },
      {
        id: 2,
        userId: 2,
        course: 'Engineering',
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
        applicant: 'Jane Smith'
      }
    ];

    const apps = applications.map(a => ({
      id: a.id,
      user_name: a.applicant || a.user_name || 'Unknown',
      email: a.email || 'N/A',
      track: a.course || a.track || 'N/A',
      status: a.status || 'Pending',
      created_at: a.appliedDate || a.created_at || new Date().toISOString()
    }));

    res.status(200).json({
      applications: apps
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load applications'
    });
  }
});

// GET ALL PAYMENTS (Admin)
app.get('/api/admin/payments', async (req, res) => {
  try {
    // Load payment data if exists
    const paymentPath = path.join(__dirname, 'payment.json');
    let payments = [];
    
    if (fs.existsSync(paymentPath)) {
      const paymentData = fs.readFileSync(paymentPath, 'utf8');
      const parsed = JSON.parse(paymentData);
      payments = parsed.payments || parsed || [];
    }

    // Format payments and enrich with user name from user.json
    const formattedPayments = (Array.isArray(payments) ? payments : []).map((payment, index) => ({
      id: payment.id || (index + 1),
      userId: payment.userId || payment.user_id || payment.user || null,
      userEmail: payment.email || payment.userEmail || null,
      amount: payment.amount || '$0.00',
      status: (payment.status || 'pending').toLowerCase(),
      date: payment.date || new Date().toISOString(),
      method: payment.method || 'Card',
      raw: payment
    })).slice(0, 50); // Limit to 50 records

    // Load users so we can map names
    const usersData = readUsersJSON();
    const users = usersData.users || [];

    const paymentsMapped = formattedPayments.map(p => {
      // find user by id or email
      let userName = null;
      if (p.userId) {
        const found = users.find(u => (u.id && u.id.toString() === p.userId.toString()) || (u.id && u.id.toString() === (`user_${p.userId}`).toString()));
        if (found) userName = found.full_name || found.fullName || found.name;
      }
      if (!userName && p.userEmail) {
        const foundByEmail = users.find(u => u.email && u.email.toLowerCase() === p.userEmail.toLowerCase());
        if (foundByEmail) userName = foundByEmail.full_name || foundByEmail.fullName || foundByEmail.name;
      }
      if (!userName) {
        userName = p.raw && (p.raw.userName || p.raw.user_name) ? (p.raw.userName || p.raw.user_name) : `User ${p.userId || p.id}`;
      }

      return {
        id: p.id,
        user_name: userName,
        userId: p.userId,
        amount: parseFloat(('' + (p.amount || 0)).replace('$', '')) || 0,
        method: p.method,
        status: p.status || 'pending',
        created_at: p.date
      };
    });

    res.status(200).json({
      payments: paymentsMapped
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load payments'
    });
  }
});

// GET ALL COURSES (Admin)
app.get('/api/admin/courses', async (req, res) => {
  try {
    // Sample courses data
    const courses = [
      {
        id: 1,
        name: 'Introduction to Computer Science',
        code: 'CS101',
        students: 45,
        instructor: 'Prof. Smith',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Data Structures',
        code: 'CS201',
        students: 38,
        instructor: 'Prof. Johnson',
        status: 'Active'
      },
      {
        id: 3,
        name: 'Web Development',
        code: 'CS301',
        students: 52,
        instructor: 'Prof. Williams',
        status: 'Active'
      }
    ];

    res.status(200).json({
      courses: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load courses'
    });
  }
});

// DELETE USER (Admin)
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Remove from local user.json
    const data = readUsersJSON();
    const users = data.users || [];
    const idx = users.findIndex(u => (u.id && u.id.toString() === userId.toString()) || (u.email && u.email.toString() === userId.toString()));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: `User ${userId} not found` });
    }

    const removed = users.splice(idx, 1)[0];
    data.users = users;
    data.metadata = { total_users: users.length, last_updated: new Date().toISOString() };
    writeUsersJSON(data);

    // Notify connected client (if any) so the browser can clear state
    const targetId = removed.id || removed.email || userId;
    if (connectedUsers.has(targetId)) {
      const ws = connectedUsers.get(targetId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        const msg = {
          type: 'account_deleted',
          userId: targetId,
          message: 'Your account has been deleted by an administrator.'
        };
        try {
          ws.send(JSON.stringify(msg));
          ws.close();
          console.log(`✅ Notified connected client ${targetId} of deletion`);
        } catch (e) {
          console.warn('Could not notify client of deletion:', e.message);
        }
      }
      connectedUsers.delete(targetId);
    }

    // TODO: If using Supabase with service key, also delete from Supabase here.

    res.status(200).json({ success: true, message: `User ${userId} deleted successfully`, deleted: removed });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// DELETE ALL USERS (Admin) - deletes all users from user.json and notifies connected clients
app.post('/api/admin/delete-all-users', async (req, res) => {
  try {
    const data = readUsersJSON();
    const users = data.users || [];

    // Notify all connected users before clearing
    for (const u of users) {
      const targetId = u.id || u.email;
      if (targetId && connectedUsers.has(targetId)) {
        const ws = connectedUsers.get(targetId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          const msg = {
            type: 'account_deleted',
            userId: targetId,
            message: 'Your account has been deleted by an administrator. You will be logged out.'
          };
          try {
            ws.send(JSON.stringify(msg));
            ws.close();
            console.log(`✅ Notified connected client ${targetId} of mass deletion`);
          } catch (e) {
            console.warn('Could not notify client during mass deletion:', e.message);
          }
        }
        connectedUsers.delete(targetId);
      }
    }

    // Clear users array
    data.users = [];
    data.metadata = { total_users: 0, last_updated: new Date().toISOString() };
    writeUsersJSON(data);

    // TODO: Optionally delete from Supabase if service key available

    res.status(200).json({ success: true, message: 'All users deleted successfully' });
  } catch (error) {
    console.error('Delete all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete all users' });
  }
});

// UPDATE APPLICATION STATUS (Admin)
app.put('/api/admin/applications/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body;

    res.status(200).json({
      success: true,
      message: `Application ${appId} updated to ${status}`,
      data: {
        id: appId,
        status: status
      }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
});

// UPDATE PAYMENT STATUS (Admin)
app.put('/api/admin/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    const paymentPath = path.join(__dirname, 'payment.json');
    if (!fs.existsSync(paymentPath)) {
      return res.status(404).json({ success: false, message: 'No payment data found' });
    }

    const paymentData = JSON.parse(fs.readFileSync(paymentPath, 'utf8'));
    const payments = paymentData.payments || [];

    const idx = payments.findIndex(p => (p.id && p.id.toString() === paymentId.toString()) || (""+p.id === ""+paymentId));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payments[idx].status = status;
    payments[idx].updated_at = new Date().toISOString();

    // write back
    paymentData.payments = payments;
    paymentData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(paymentPath, JSON.stringify(paymentData, null, 2), 'utf8');

    res.status(200).json({ success: true, payment: payments[idx] });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment' });
  }
});

// Notify user of payment approval
app.post('/api/notify-user-approval', (req, res) => {
  try {
    console.log('📢 Received approval notification request');
    const { userId, userEmail, paymentId, message } = req.body;

    console.log(`📢 [NOTIFICATION] User Approval: userId=${userId}, email=${userEmail}, paymentId=${paymentId}`);
    
    // Store notification in a notifications file for the user to check
    const notificationsPath = path.join(__dirname, 'notifications.json');
    let notificationsData = { notifications: [] };
    
    if (fs.existsSync(notificationsPath)) {
      const existing = fs.readFileSync(notificationsPath, 'utf8');
      try {
        notificationsData = JSON.parse(existing);
      } catch (e) {
        console.log('Could not parse existing notifications, starting fresh');
        notificationsData = { notifications: [] };
      }
    }

    // Add new notification
    notificationsData.notifications.push({
      id: Date.now().toString(),
      userId: userId,
      userEmail: userEmail,
      paymentId: paymentId,
      message: message,
      type: 'approval',
      read: false,
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(notificationsPath, JSON.stringify(notificationsData, null, 2), 'utf8');
    console.log('✅ Notification saved');

    // 🔥 NEW: Send real-time message via WebSocket to connected user
    if (connectedUsers.has(userId)) {
      const ws = connectedUsers.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        const approvalMessage = {
          type: 'approval',
          userId: userId,
          paymentId: paymentId,
          message: message,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(approvalMessage));
        console.log(`✅ Real-time WebSocket message sent to user: ${userId}`);
      }
    }

    res.status(200).json({ success: true, message: 'Notification sent to user' });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification', error: error.message });
  }
});

// Get user approval notifications
app.get('/api/user-notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔔 Getting notifications for userId: ${userId}`);

    const notificationsPath = path.join(__dirname, 'notifications.json');
    if (!fs.existsSync(notificationsPath)) {
      console.log('No notifications file yet');
      return res.status(200).json({ success: true, notifications: [] });
    }

    const fileContent = fs.readFileSync(notificationsPath, 'utf8');
    let notificationsData;
    try {
      notificationsData = JSON.parse(fileContent);
    } catch (e) {
      console.log('Could not parse notifications file');
      return res.status(200).json({ success: true, notifications: [] });
    }

    const userNotifications = (notificationsData.notifications || []).filter(n => n.userId === userId);
    console.log(`✅ Found ${userNotifications.length} notifications`);

    res.status(200).json({ success: true, notifications: userNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to get notifications', error: error.message });
  }
});

// ==================== TEACHER ENDPOINTS ====================

// Helper functions for teacher.json
const TEACHER_JSON_PATH = path.join(__dirname, 'teacher.json');

function readTeachersJSON() {
  try {
    if (fs.existsSync(TEACHER_JSON_PATH)) {
      const data = fs.readFileSync(TEACHER_JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed || !parsed.teachers || !Array.isArray(parsed.teachers)) {
        return { teachers: [], totalTeachers: 0, lastUpdated: new Date().toISOString() };
      }
      return parsed;
    }
  } catch (err) {
    console.warn('⚠️  Could not read teacher.json:', err.message);
  }
  return { teachers: [], totalTeachers: 0, lastUpdated: new Date().toISOString() };
}

function writeTeachersJSON(data) {
  try {
    fs.writeFileSync(TEACHER_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Saved to teacher.json');
    return true;
  } catch (err) {
    console.error('❌ Error writing to teacher.json:', err.message);
    return false;
  }
}

// Teacher Registration
app.post('/api/teacher/register', async (req, res) => {
  try {
    const { name, email, password, phone, track, specialization } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !track) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const teacherData = readTeachersJSON();

    // Check if teacher already exists
    const teacherExists = teacherData.teachers.some(t => t.email === email);
    if (teacherExists) {
      return res.status(400).json({ success: false, message: 'Teacher with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate teacher ID
    const teacherId = 'T' + Date.now();

    // Create new teacher
    const newTeacher = {
      id: teacherId,
      name,
      email,
      password: hashedPassword,
      phone,
      track,
      specialization: specialization || '',
      courses: [],
      registeredAt: new Date().toISOString(),
      status: 'active'
    };

    // Add to teacher data
    teacherData.teachers.push(newTeacher);
    teacherData.totalTeachers = teacherData.teachers.length;
    teacherData.lastUpdated = new Date().toISOString();

    // Save to file
    if (!writeTeachersJSON(teacherData)) {
      return res.status(500).json({ success: false, message: 'Failed to save teacher data' });
    }

    console.log(`✅ Teacher registered: ${email}`);
    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      teacher: {
        id: teacherId,
        name,
        email,
        track
      }
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// Teacher Login
app.post('/api/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const teacherData = readTeachersJSON();

    // Find teacher by email
    const teacher = teacherData.teachers.find(t => t.email === email);
    if (!teacher) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log(`✅ Teacher logged in: ${email}`);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        track: teacher.track,
        specialization: teacher.specialization,
        courses: teacher.courses,
        status: teacher.status
      },
      token: `teacher_${teacher.id}_${Date.now()}`
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Get all teachers (admin)
app.get('/api/teachers', (req, res) => {
  try {
    const teacherData = readTeachersJSON();
    res.status(200).json({
      success: true,
      teachers: teacherData.teachers,
      total: teacherData.totalTeachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Failed to get teachers', error: error.message });
  }
});

// ==================== COURSE MANAGEMENT ENDPOINTS ====================
const COURSES_JSON_PATH = path.join(__dirname, 'courses.json');

// Helper function to read courses from JSON
function readCoursesJSON() {
  try {
    if (fs.existsSync(COURSES_JSON_PATH)) {
      const data = fs.readFileSync(COURSES_JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed.courses || !Array.isArray(parsed.courses)) {
        return { courses: [], metadata: { total_courses: 0, tracks: [], last_updated: new Date().toISOString() } };
      }
      return parsed;
    }
  } catch (err) {
    console.warn('⚠️  Could not read courses.json:', err.message);
  }
  return { courses: [], metadata: { total_courses: 0, tracks: [], last_updated: new Date().toISOString() } };
}

// Helper function to write courses to JSON
function writeCoursesJSON(data) {
  try {
    fs.writeFileSync(COURSES_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Courses saved to courses.json');
    return true;
  } catch (err) {
    console.error('❌ Error writing to courses.json:', err.message);
    return false;
  }
}

// GET all courses (optionally filtered by track)
app.get('/api/courses', (req, res) => {
  try {
    const { track } = req.query;
    const data = readCoursesJSON();
    
    let courses = data.courses;
    
    if (track) {
      courses = courses.filter(c => c.track.toLowerCase() === track.toLowerCase());
    }
    
    res.status(200).json({
      success: true,
      courses: courses,
      total: courses.length,
      metadata: data.metadata
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to get courses', error: error.message });
  }
});

// GET courses for a specific track
app.get('/api/courses/track/:trackName', (req, res) => {
  try {
    const { trackName } = req.params;
    const data = readCoursesJSON();
    
    const courses = data.courses.filter(c => c.track.toLowerCase() === trackName.toLowerCase());
    
    res.status(200).json({
      success: true,
      track: trackName,
      courses: courses,
      total: courses.length
    });
  } catch (error) {
    console.error('Get track courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to get track courses', error: error.message });
  }
});

// POST - Add new course (teacher/admin)
app.post('/api/courses', (req, res) => {
  try {
    const { track, code, name, description, instructor, schedule, students } = req.body;
    
    // Validation
    if (!track || !code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Track, course code, and course name are required'
      });
    }
    
    const data = readCoursesJSON();
    
    // Check if course code already exists
    if (data.courses.some(c => c.code === code)) {
      return res.status(400).json({
        success: false,
        message: `Course with code ${code} already exists`
      });
    }
    
    // Create new course
    const newCourse = {
      id: `${code}-${Date.now()}`,
      code: code,
      name: name,
      description: description || '',
      instructor: instructor || 'TBA',
      schedule: schedule || '',
      students: students || 0,
      track: track.toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.courses.push(newCourse);
    data.metadata.total_courses = data.courses.length;
    data.metadata.last_updated = new Date().toISOString();
    
    // Update available tracks
    const tracks = new Set(data.courses.map(c => c.track));
    data.metadata.tracks = Array.from(tracks);
    
    if (writeCoursesJSON(data)) {
      console.log(`✅ Course ${code} added to ${track}`);
      res.status(201).json({
        success: true,
        message: `Course ${code} added successfully`,
        course: newCourse
      });
    } else {
      throw new Error('Failed to write courses to file');
    }
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ success: false, message: 'Failed to add course', error: error.message });
  }
});

// PUT - Update course
app.put('/api/courses/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const { code, name, description, instructor, schedule, students } = req.body;
    
    const data = readCoursesJSON();
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Update course fields
    if (code) data.courses[courseIndex].code = code;
    if (name) data.courses[courseIndex].name = name;
    if (description !== undefined) data.courses[courseIndex].description = description;
    if (instructor) data.courses[courseIndex].instructor = instructor;
    if (schedule) data.courses[courseIndex].schedule = schedule;
    if (students !== undefined) data.courses[courseIndex].students = students;
    
    data.courses[courseIndex].updated_at = new Date().toISOString();
    data.metadata.last_updated = new Date().toISOString();
    
    if (writeCoursesJSON(data)) {
      console.log(`✅ Course ${courseId} updated`);
      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        course: data.courses[courseIndex]
      });
    } else {
      throw new Error('Failed to write courses to file');
    }
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
  }
});

// DELETE - Remove course
app.delete('/api/courses/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const data = readCoursesJSON();
    
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const removedCourse = data.courses[courseIndex];
    data.courses.splice(courseIndex, 1);
    data.metadata.total_courses = data.courses.length;
    data.metadata.last_updated = new Date().toISOString();
    
    if (writeCoursesJSON(data)) {
      console.log(`✅ Course ${courseId} (${removedCourse.code}) deleted`);
      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
        deletedCourse: removedCourse
      });
    } else {
      throw new Error('Failed to write courses to file');
    }
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
});

// Start Server with WebSocket support
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('🔗 New WebSocket connection');
  
  // Wait for user ID from client
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      // Accept either 'connect' or 'subscribe' to register user
      if ((message.type === 'connect' || message.type === 'subscribe') && message.userId) {
        // Register this connection with the user ID
        connectedUsers.set(message.userId, ws);
        console.log(`✅ User ${message.userId} connected via WebSocket`);

        // Send confirmation
        ws.send(JSON.stringify({ 
          type: 'connected', 
          message: 'Connected to real-time notifications',
          userId: message.userId
        }));
        return;
      }

      // Handle meeting join/leave via WS signaling
      if (message.type === 'join_meeting' && message.meetingId && message.userId) {
        const { meetingId, userId, displayName } = message;
        let session = activeClasses.get(meetingId);
        if (!session) {
          session = { courseCode: null, teacherId: null, startedAt: new Date().toISOString(), screenSharing: false, participants: new Set() };
          activeClasses.set(meetingId, session);
        }
        session.participants.add(userId);
        console.log(`🔔 User ${userId} joined meeting ${meetingId}`);

        // Notify other participants in the meeting about the new participant
        try {
          session.participants.forEach(pid => {
            if (pid === userId) return; // skip sender
            const clientWs = connectedUsers.get(pid);
            if (clientWs && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'participant_joined', meetingId, userId, displayName }));
            }
          });
        } catch (e) { console.warn('Could not notify participants of join:', e.message); }

        // Acknowledge to joiner with current participant list
        try {
          const list = Array.from(session.participants);
          ws.send(JSON.stringify({ type: 'joined_ok', meetingId, participants: list }));
        } catch (e) {}

        return;
      }

      if (message.type === 'leave_meeting' && message.meetingId && message.userId) {
        const { meetingId, userId } = message;
        const session = activeClasses.get(meetingId);
        if (session && session.participants) {
          session.participants.delete(userId);
          // notify others
          session.participants.forEach(pid => {
            const clientWs = connectedUsers.get(pid);
            if (clientWs && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'participant_left', meetingId, userId }));
            }
          });
        }
        return;
      }

      // Handle teacher screen-frame broadcasts (forward frames to all other connected users)
      if (message.type === 'screen_frame' && message.meetingId && message.frame) {
        try {
          // Broadcast the frame payload to all connected users except the sender
          connectedUsers.forEach((clientWs) => {
            if (clientWs && clientWs.readyState === WebSocket.OPEN && clientWs !== ws) {
              try {
                clientWs.send(JSON.stringify({ type: 'screen_frame', meetingId: message.meetingId, frame: message.frame }));
              } catch (e) { /* ignore per-client errors */ }
            }
          });
        } catch (e) {
          console.warn('Error broadcasting screen_frame:', e.message);
        }
        return;
      }
      
      // WebRTC signaling routing: forward offers/answers/candidates to specific target user
      if ((message.type === 'webrtc_offer' || message.type === 'webrtc_answer' || message.type === 'webrtc_ice') && message.to) {
        const target = message.to;
        if (connectedUsers.has(target)) {
          try {
            const targetWs = connectedUsers.get(target);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify(message));
            }
          } catch (e) { console.warn('Failed to forward WebRTC message to', target, e.message); }
        }
        return;
      }
    } catch (e) {
      console.error('Error handling WebSocket message:', e);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    // Find and remove this connection
    for (let [userId, connection] of connectedUsers.entries()) {
      if (connection === ws) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected from WebSocket`);
        // Remove user from any active meeting participant lists and notify others
        try {
          activeClasses.forEach((session, meetingId) => {
            if (session && session.participants && session.participants.has(userId)) {
              session.participants.delete(userId);
              // notify remaining participants
              session.participants.forEach(pid => {
                const clientWs = connectedUsers.get(pid);
                if (clientWs && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'participant_left', meetingId, userId }));
                }
              });
            }
          });
        } catch (e) { console.warn('Error cleaning up participant on disconnect:', e.message); }
        break;
      }
    }
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

// ==================== CLASS SCHEDULE ENDPOINTS ====================

// Save course schedule and send notifications to students
app.post('/api/class/schedule', async (req, res) => {
  try {
    // Log incoming request origin/headers for debugging client 'Failed to fetch'
    console.log('🔔 /api/class/schedule request from:', req.headers.origin || req.ip || 'unknown');
    console.log('🔎 Headers:', { origin: req.headers.origin, referer: req.headers.referer });
    const { courseCode, courseName, startDate, startTime, endTime, frequency, location, studentEmails, meetingId } = req.body;

    if (!courseCode || !courseName || !startDate || !startTime || !endTime || !studentEmails || !meetingId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const { sendClassNotificationEmail } = require('./email-service');
    
    const classDetails = {
      courseCode,
      courseName,
      startDate,
      startTime,
      endTime,
      frequency,
      location,
      meetingId,
      scheduledAt: new Date().toISOString(),
      status: 'scheduled',
      teacherId: req.body.teacherId || null
    };

    // Save schedule to file
    const schedulePath = path.join(__dirname, 'class-schedules.json');
    let schedules = [];
    if (fs.existsSync(schedulePath)) {
      try {
        schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
      } catch (e) {
        schedules = [];
      }
    }
    schedules.push(classDetails);
    fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2), 'utf8');

    // Sanitize and validate email list before sending
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const validEmails = (Array.isArray(studentEmails) ? studentEmails : [])
      .map(e => (e || '').trim())
      .filter(e => emailRegex.test(e));

    if (validEmails.length === 0) {
      // Fallback: try to discover students from local user.json (server-side)
      try {
        const usersData = readUsersJSON();
        const discovered = (usersData.users || [])
          .filter(u => Array.isArray(u.registered_courses) && u.registered_courses.some(c => (c.code || c) === courseCode))
          .map(u => (u.email || '').trim())
          .filter(e => emailRegex.test(e));

        if (discovered.length > 0) {
          console.log(`ℹ️ Discovered ${discovered.length} registered student(s) for ${courseCode} from user.json`);
          validEmails.push(...discovered);
        }
      } catch (e) {
        console.warn('⚠️ Could not read users JSON for fallback student discovery:', e.message);
      }

      if (validEmails.length === 0) {
        console.warn('⚠️ No valid student email addresses found for notifications. Skipping email send.');
      } else {
        console.log(`ℹ️ Will attempt to send notifications to ${validEmails.length} discovered students`);
      }
    }

    if (validEmails.length > 0) {
      // Send emails to validated addresses
      const emailPromises = validEmails.map(email => 
        sendClassNotificationEmail(email, classDetails).catch(err => {
          console.error(`Failed to send email to ${email}:`, err.message);
        })
      );

      await Promise.all(emailPromises);
      console.log(`✅ Class scheduled and notifications attempted to ${validEmails.length} students`);
    }

    // Notify teacher in real-time via WebSocket if connected
    try {
      const targetTeacherId = classDetails.teacherId;
      if (targetTeacherId && connectedUsers.has(targetTeacherId)) {
        const ws = connectedUsers.get(targetTeacherId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'class_scheduled', courseCode, meetingId, classDetails }));
          console.log(`✅ Real-time class_scheduled sent to teacher: ${targetTeacherId}`);
        }
      }
    } catch (err) {
      console.warn('Could not send real-time class_scheduled message:', err.message);
    }

    // Broadcast to all connected users (students) so their UI updates in real-time
    try {
      broadcastToAll({ type: 'class_scheduled', courseCode, meetingId, classDetails });
      console.log('✅ Broadcasted class_scheduled to all connected users');
    } catch (err) {
      console.warn('Could not broadcast class_scheduled to all users:', err.message);
    }

    res.status(200).json({
      success: true,
      message: `Class scheduled and notifications sent to ${studentEmails.length} students`,
      classDetails
    });
  } catch (error) {
    console.error('Error scheduling class:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule class', error: error.message });
  }
});

// Mark class as started (teacher calls when class begins)
app.post('/api/class/start', (req, res) => {
  try {
    const { courseCode, meetingId, teacherId } = req.body;
    if (!courseCode || !meetingId) return res.status(400).json({ success: false, message: 'Missing courseCode or meetingId' });

    const schedulePath = path.join(__dirname, 'class-schedules.json');
    let schedules = [];
    if (fs.existsSync(schedulePath)) {
      try { schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf8')); } catch (e) { schedules = []; }
    }

    const idx = schedules.findIndex(s => s.meetingId === meetingId || s.courseCode === courseCode);
    if (idx !== -1) {
      schedules[idx].status = 'active';
      schedules[idx].startedAt = new Date().toISOString();
      fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2), 'utf8');
    }

    // Broadcast to teacher
    if (teacherId && connectedUsers.has(teacherId)) {
      const ws = connectedUsers.get(teacherId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'class_started', courseCode, meetingId }));
      }
    }

    // Broadcast to all connected users (students) so they can join in real-time
    try {
      // Include teacherId for context and the schedule details if available
      const classDetails = (schedules[idx]) ? schedules[idx] : { courseCode, meetingId };
      broadcastToAll({ type: 'class_started', courseCode, meetingId, teacherId, classDetails });
      console.log('✅ Broadcasted class_started to all connected users');
    } catch (err) {
      console.warn('Could not broadcast class_started to all users:', err.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking class started:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark class as ended (teacher calls when class ends)
app.post('/api/class/end', (req, res) => {
  try {
    const { courseCode, meetingId, teacherId } = req.body;
    if (!courseCode || !meetingId) return res.status(400).json({ success: false, message: 'Missing courseCode or meetingId' });

    const schedulePath = path.join(__dirname, 'class-schedules.json');
    let schedules = [];
    if (fs.existsSync(schedulePath)) {
      try { schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf8')); } catch (e) { schedules = []; }
    }

    const idx = schedules.findIndex(s => s.meetingId === meetingId || s.courseCode === courseCode);
    if (idx !== -1) {
      schedules[idx].status = 'completed';
      schedules[idx].endedAt = new Date().toISOString();
      fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2), 'utf8');
    }

    // Broadcast to teacher
    if (teacherId && connectedUsers.has(teacherId)) {
      const ws = connectedUsers.get(teacherId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'class_ended', courseCode, meetingId }));
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking class ended:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get class schedule
app.get('/api/class/schedule/:courseCode', (req, res) => {
  try {
    const { courseCode } = req.params;
    const schedulePath = path.join(__dirname, 'class-schedules.json');

    // If schedules file doesn't exist, return empty schedules (200) instead of 404
    let schedules = [];
    if (fs.existsSync(schedulePath)) {
      try {
        schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
      } catch (e) {
        schedules = [];
      }
    }

    const courseSchedules = schedules.filter(s => s.courseCode === courseCode);

    // Return empty array when no schedules found instead of 404 to simplify client logic
    return res.status(200).json({ success: true, schedules: courseSchedules });
  } catch (error) {
    console.error('Error fetching class schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule', error: error.message });
  }
});

// Check if student can join class
app.post('/api/class/check-join-time', (req, res) => {
  try {
    const { courseCode, meetingId } = req.body;

    if (!courseCode || !meetingId) {
      return res.status(400).json({ success: false, message: 'Missing courseCode or meetingId' });
    }

    const schedulePath = path.join(__dirname, 'class-schedules.json');
    if (!fs.existsSync(schedulePath)) {
      return res.status(404).json({ success: false, message: 'No schedules found' });
    }

    const schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    const schedule = schedules.find(s => s.courseCode === courseCode && s.meetingId === meetingId);

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const now = new Date();
    const classDateTime = new Date(`${schedule.startDate}T${schedule.startTime}`);
    const classEndTime = new Date(`${schedule.startDate}T${schedule.endTime}`);

    // If the teacher has already started the class (server-managed active session) or schedule marked active, allow join regardless of scheduled time
    if (activeClasses.has(meetingId) || schedule.status === 'active') {
      return res.status(200).json({
        success: true,
        message: 'Teacher has started the class. You can join now.',
        canJoin: true,
        meetingId: schedule.meetingId,
        courseName: schedule.courseName,
        status: 'active'
      });
    }

    // Check if class has started per scheduled time
    if (now < classDateTime) {
      const waitMinutes = Math.ceil((classDateTime - now) / 60000);
      const waitSeconds = Math.ceil((classDateTime - now) / 1000) % 60;
      return res.status(200).json({
        success: false,
        message: `Class will start at ${schedule.startTime}. Please wait.`,
        canJoin: false,
        scheduledTime: schedule.startTime,
        startDate: schedule.startDate,
        waitTime: `${waitMinutes}m ${waitSeconds}s`,
        status: 'waiting'
      });
    }

    // Check if class has ended
    if (now > classEndTime) {
      return res.status(200).json({
        success: false,
        message: 'This class has ended',
        canJoin: false,
        status: 'ended'
      });
    }

    // Class is active - student can join
    return res.status(200).json({
      success: true,
      message: 'You can now join the class',
      canJoin: true,
      meetingId: schedule.meetingId,
      courseName: schedule.courseName,
      status: 'active'
    });
  } catch (error) {
    console.error('Error checking join time:', error);
    res.status(500).json({ success: false, message: 'Failed to check join time', error: error.message });
  }
});

// Get all active classes
app.get('/api/class/active', (req, res) => {
  try {
    const schedulePath = path.join(__dirname, 'class-schedules.json');

    if (!fs.existsSync(schedulePath)) {
      return res.status(200).json({ success: true, activeClasses: [] });
    }

    const schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    const now = new Date();
    
    const activeClasses = schedules.filter(s => {
      const startTime = new Date(`${s.startDate}T${s.startTime}`);
      const endTime = new Date(`${s.startDate}T${s.endTime}`);
      return now >= startTime && now <= endTime;
    });

    res.status(200).json({
      success: true,
      activeClasses
    });
  } catch (error) {
    console.error('Error fetching active classes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active classes', error: error.message });
  }
});

// ==================== ACTIVE CLASS SESSIONS (server-managed) ====================

// Get all active class sessions (server-managed)
app.get('/api/classes/active', (req, res) => {
  try {
    const activeSessions = [];
    activeClasses.forEach((session, meetingId) => {
      activeSessions.push({
        meetingId,
        courseCode: session.courseCode,
        teacherId: session.teacherId,
        startedAt: session.startedAt,
        screenSharing: session.screenSharing,
        participantCount: session.participants.size
      });
    });
    res.json({ success: true, activeSessions });
  } catch (err) {
    console.error('Error fetching active classes (server):', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get active class by meeting ID
app.get('/api/classes/active/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;
    const session = activeClasses.get(meetingId);
    if (!session) {
      return res.json({ success: false, message: 'Class not found', session: null });
    }
    res.json({ 
      success: true, 
      session: {
        meetingId,
        courseCode: session.courseCode,
        teacherId: session.teacherId,
        startedAt: session.startedAt,
        screenSharing: session.screenSharing,
        participantCount: session.participants.size
      }
    });
  } catch (err) {
    console.error('Error fetching active class:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start a new class session (called by teacher)
app.post('/api/classes/start', (req, res) => {
  try {
    const { courseCode, meetingId, teacherId } = req.body;
    if (!courseCode || !meetingId || !teacherId) {
      return res.status(400).json({ success: false, message: 'Missing courseCode, meetingId, or teacherId' });
    }
    activeClasses.set(meetingId, {
      courseCode,
      teacherId,
      startedAt: new Date().toISOString(),
      screenSharing: false,
      participants: new Set([teacherId])
    });
    console.log(`✅ Class started: ${courseCode} (${meetingId})`);
    // Broadcast to all connected users
    broadcastToAll({ type: 'class_started', courseCode, meetingId, teacherId });
    res.json({ success: true, message: 'Class session created', session: { meetingId, courseCode, teacherId, screenSharing: false } });
  } catch (err) {
    console.error('Error starting class:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// End a class session (called by teacher)
app.post('/api/classes/end', (req, res) => {
  try {
    const { meetingId, courseCode } = req.body;
    if (!meetingId) {
      return res.status(400).json({ success: false, message: 'Missing meetingId' });
    }
    const session = activeClasses.get(meetingId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Class session not found' });
    }
    activeClasses.delete(meetingId);
    console.log(`✅ Class ended: ${courseCode} (${meetingId})`);
    broadcastToAll({ type: 'class_ended', meetingId, courseCode });
    res.json({ success: true, message: 'Class session ended' });
  } catch (err) {
    console.error('Error ending class:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student joins class (add to participant list)
app.post('/api/classes/join', (req, res) => {
  try {
    const { meetingId, studentId, courseCode } = req.body;
    if (!meetingId || !studentId) {
      return res.status(400).json({ success: false, message: 'Missing meetingId or studentId' });
    }
    const session = activeClasses.get(meetingId);
    if (!session) {
      return res.json({ success: false, message: 'Class not active', classActive: false });
    }
    session.participants.add(studentId);
    console.log(`✅ Student joined: ${studentId} to ${courseCode} (${meetingId})`);
    // Notify teacher if connected
    const teacherWs = connectedUsers.get(session.teacherId);
    if (teacherWs && teacherWs.readyState === WebSocket.OPEN) {
      teacherWs.send(JSON.stringify({ type: 'student_joined', meetingId, studentId, totalParticipants: session.participants.size }));
    }
    res.json({ success: true, message: 'Joined class', classActive: true, participantCount: session.participants.size });
  } catch (err) {
    console.error('Error joining class:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update screen share status
app.post('/api/classes/screen-share', (req, res) => {
  try {
    const { meetingId, isSharing } = req.body;
    if (!meetingId) {
      return res.status(400).json({ success: false, message: 'Missing meetingId' });
    }
    const session = activeClasses.get(meetingId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Class session not found' });
    }
    session.screenSharing = !!isSharing;
    console.log(`${isSharing ? '📺' : '⊘'} Screen share ${isSharing ? 'started' : 'stopped'} for ${meetingId}`);
    broadcastToAll({ type: 'screen_share_update', meetingId, isSharing: !!isSharing });
    res.json({ success: true, message: isSharing ? 'Screen sharing started' : 'Screen sharing stopped' });
  } catch (err) {
    console.error('Error updating screen share:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper function to broadcast to all connected users
function broadcastToAll(message) {
  connectedUsers.forEach((ws) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify(message)); } catch (e) { /* ignore */ }
    }
  });
}

// ==================== RESCHEDULE CLASS ENDPOINT ====================
// Allow teacher to reschedule a completed class back to scheduled state
app.post('/api/class/reschedule', (req, res) => {
  try {
    const { meetingId, newStartDate, newStartTime, newEndTime } = req.body;
    
    if (!meetingId) {
      return res.status(400).json({ success: false, message: 'Missing meetingId' });
    }

    const schedulePath = path.join(__dirname, 'class-schedules.json');
    if (!fs.existsSync(schedulePath)) {
      return res.status(404).json({ success: false, message: 'No schedules found' });
    }

    let schedules = [];
    try {
      schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    } catch (e) {
      schedules = [];
    }

    const idx = schedules.findIndex(s => s.meetingId === meetingId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Reset class to scheduled status with new time
    schedules[idx].status = 'scheduled';
    schedules[idx].startDate = newStartDate || schedules[idx].startDate;
    schedules[idx].startTime = newStartTime || schedules[idx].startTime;
    schedules[idx].endTime = newEndTime || schedules[idx].endTime;
    schedules[idx].rescheduleCount = (schedules[idx].rescheduleCount || 0) + 1;
    schedules[idx].rescheduledAt = new Date().toISOString();
    
    // Remove startedAt and endedAt to reset the session
    delete schedules[idx].startedAt;
    delete schedules[idx].endedAt;

    fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2), 'utf8');

    console.log(`✅ Class rescheduled: ${meetingId} -> ${newStartDate} ${newStartTime}`);

    res.status(200).json({
      success: true,
      message: 'Class rescheduled successfully',
      classDetails: schedules[idx]
    });
  } catch (error) {
    console.error('Error rescheduling class:', error);
    res.status(500).json({ success: false, message: 'Failed to reschedule class', error: error.message });
  }
});

// ==================== END OF ACTIVE CLASS SESSIONS ====================

// Helper: collect student emails for a class (studentEmails in schedule, else by course->track->track.students or user.json track)
function collectStudentEmailsForClass(classDetails) {
  try {
    // if schedule contains explicit emails, use them
    if (classDetails.studentEmails && Array.isArray(classDetails.studentEmails) && classDetails.studentEmails.length) {
      return Array.from(new Set(classDetails.studentEmails.map(e => (''+e).toLowerCase())));
    }

    // try to find course and its track
    const coursesData = readCoursesJSON();
    const course = (coursesData.courses || []).find(c => c.code === classDetails.courseCode || c.name === classDetails.courseName);
    let trackName = null;
    if (course) trackName = course.track || course.trackName || null;

    const emails = new Set();

    // get from tracks file
    if (trackName) {
      const tracksData = readTracksJSON();
      const track = (tracksData.tracks || []).find(t => (t.name && t.name.toLowerCase() === (''+trackName).toLowerCase()) || t.id === trackName || t.code === trackName);
      if (track && Array.isArray(track.students)) {
        track.students.forEach(s => { if (s && s.email) emails.add(s.email.toLowerCase()); });
      }
    }

    // fallback: search user.json for users that have matching trackName/trackId
    const usersData = readUsersJSON();
    (usersData.users || []).forEach(u => {
      if (!u || !u.email) return;
      if (trackName && ((u.trackName && u.trackName.toLowerCase() === (''+trackName).toLowerCase()) || (u.trackId && u.trackId === trackName))) {
        emails.add(u.email.toLowerCase());
      }
    });

    return Array.from(emails);
  } catch (err) {
    console.warn('Could not collect student emails for class:', err.message);
    return [];
  }
}

// Broadcast scheduled classes for a given date (YYYY-MM-DD). If trackFilter provided, limit to that track.
async function broadcastScheduledForDate(dateStr, trackFilter) {
  try {
    const schedulePath = path.join(__dirname, 'class-schedules.json');
    if (!fs.existsSync(schedulePath)) return { broadcasted: 0, emailed: 0 };
    let schedules = [];
    try { schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf8')); } catch (e) { schedules = []; }

    const todaySchedules = schedules.filter(s => s.startDate === dateStr && (s.status === 'scheduled' || !s.status));

    let emailed = 0, broadcasted = 0;
    const { sendClassNotificationEmail } = require('./email-service');

    for (const classDetails of todaySchedules) {
      // if trackFilter provided, check course->track
      if (trackFilter) {
        const coursesData = readCoursesJSON();
        const course = (coursesData.courses || []).find(c => c.code === classDetails.courseCode || c.name === classDetails.courseName);
        const trackName = course ? (course.track || course.trackName) : null;
        if (!trackName || (''+trackName).toLowerCase() !== (''+trackFilter).toLowerCase()) continue;
      }

      const emails = collectStudentEmailsForClass(classDetails);
      // send emails
      const promises = emails.map(e => sendClassNotificationEmail(e, classDetails).then(() => { emailed++; }).catch(() => {}));
      await Promise.all(promises);

      // broadcast
      try {
        broadcastToAll({ type: 'class_scheduled', courseCode: classDetails.courseCode, meetingId: classDetails.meetingId, classDetails });
        broadcasted++;
      } catch (err) {
        console.warn('Could not broadcast scheduled class:', err.message);
      }
    }

    return { broadcasted, emailed };
  } catch (err) {
    console.error('Error broadcasting scheduled classes for date:', err.message);
    return { broadcasted: 0, emailed: 0 };
  }
}

// Endpoint to manually re-broadcast scheduled classes for a date and optional track
app.post('/api/broadcast/scheduled', async (req, res) => {
  try {
    const { date, track } = req.body; // date should be YYYY-MM-DD
    if (!date) return res.status(400).json({ success: false, message: 'date is required (YYYY-MM-DD)' });

    const result = await broadcastScheduledForDate(date, track);
    res.status(200).json({ success: true, message: 'Broadcast completed', result });
  } catch (err) {
    console.error('Error in broadcast endpoint:', err.message);
    res.status(500).json({ success: false, message: 'Failed to broadcast', error: err.message });
  }
});

const LISTEN_HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, LISTEN_HOST, () => {
  console.log(`✅ Server running on http://${LISTEN_HOST}:${PORT}`);
  console.log(`🔌 WebSocket server ready on ws://${LISTEN_HOST}:${PORT}`);
  console.log(`📝 API Endpoints:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - User login`);
  console.log(`   POST /api/auth/logout - User logout`);
  console.log(`   GET /api/user/:userId - Get user profile`);
  console.log(`   POST /api/user/:userId/setup - Save setup data (department, level, courses)`);
  console.log(`   POST /api/admin/create-user - Create user (admin)`);
  console.log(`   GET /api/admin/dashboard - Admin dashboard stats`);
  console.log(`   GET /api/admin/users - Get all users`);
  console.log(`   GET /api/admin/applications - Get all applications`);
  console.log(`   GET /api/admin/payments - Get all payments`);
  console.log(`   GET /api/admin/courses - Get all courses`);
  console.log(`   DELETE /api/admin/users/:userId - Delete user`);
  console.log(`   PUT /api/admin/applications/:appId - Update application status`);
  console.log(`   POST /api/teacher/register - Register new teacher`);
  console.log(`   POST /api/teacher/login - Teacher login`);
  console.log(`   GET /api/teachers - Get all teachers`);
  console.log(`   GET /api/courses - Get all courses (with optional ?track=trackName)`);
  // On startup, broadcast scheduled classes for today so connected students get notifications
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    broadcastScheduledForDate(today).then(result => {
      console.log(`✅ Broadcasted ${result.broadcasted} scheduled classes and emailed ${result.emailed} students for ${today}`);
    }).catch(err => {
      console.warn('Could not broadcast today\'s scheduled classes:', err && err.message ? err.message : err);
    });
  } catch (e) {
    console.warn('Startup broadcast failed:', e.message);
  }
  console.log(`   GET /api/courses/track/:trackName - Get courses for specific track`);
  console.log(`   POST /api/courses - Add new course`);
  console.log(`   PUT /api/courses/:courseId - Update course`);
  console.log(`   DELETE /api/courses/:courseId - Delete course`);
  console.log(`   GET /api/users-json - Get all users from user.json`);
  console.log(`   GET /api/health - Health check`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});
