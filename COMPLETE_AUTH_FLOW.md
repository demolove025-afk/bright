# Complete Authentication Flow

## Updated User Journey

### 1. **First Time User - Registration & Email Verification**

**Step 1: Register**
- User fills registration form (Name, Email, Department, Level, Password)
- Click "Create Account"
- Server creates user with `email_verified: false`
- Server sends 6-digit verification code to email

**Step 2: Enter Verification Code** ← NEW BEHAVIOR
- User sees "Verify Your Email" form automatically
- User enters 6-digit code from their email
- User clicks "Verify Code"
- Server marks `email_verified: true` in user.json
- User **goes directly to Setup/Dashboard** (NOT back to login)

**Step 3: Complete Setup**
- User completes setup wizard (payment, courses, etc.)
- User can now access full dashboard

### 2. **Returning User - Logout & Login Again**

**Step 1: Logout**
- User clicks logout button
- User data cleared from localStorage
- User redirected to **Login Form**
- Login form shows with empty fields

**Step 2: Login**
- User enters email and password
- Server verifies password ✅
- Server checks if `email_verified: true` ✅
- User goes to Setup or Dashboard (depending on setup status)

## Authentication Flow Diagram

```
FIRST TIME
├─ Register Form
│  └─ User fills: name, email, dept, level, password
│
├─ Show: Verify Email Form ← ENTER CODE HERE
│  └─ User enters 6-digit code
│
├─ Email Verified ✅
│  └─ email_verified: true in user.json
│
└─ Show: Setup Wizard or Dashboard
   └─ User completes setup or goes to dashboard

---

RETURNING USER (After Logout)
├─ Login Form
│  └─ User enters: email, password
│
├─ Verify Password ✅
│  └─ Check if email_verified: true ✅
│
└─ Show: Setup Wizard or Dashboard
   └─ Based on setup completion status
```

## Code Changes

### script.js - Verification Handler (Lines 518-545)
**Before:** After verification → Show Login Form
**After:** After verification → Show Dashboard/Setup

```javascript
// After successful code verification:
showDashboard(userData.name);  // ← Goes to dashboard, NOT login
```

### script.js - Logout Function (Lines 1081-1108)
**Before:** Just reload page
**After:** Clear data, show login form specifically

```javascript
function logout() {
  // Clear all data
  localStorage.removeItem('bucodel_user');
  localStorage.removeItem('bucodel_setup');
  
  // Show ONLY login form
  showAuthPage();  // Shows auth section
  loginForm.classList.add('active');  // Highlights login tab
  registerForm.classList.remove('active');
}
```

## User.json Structure

When user registers:
```json
{
  "email": "user@example.com",
  "password_hash": "$2b$10$...",
  "email_verified": false  // Cannot login yet
}
```

After verification:
```json
{
  "email": "user@example.com",
  "password_hash": "$2b$10$...",
  "email_verified": true   // Now can login
}
```

## Login Validation (server.js)

```javascript
// Login endpoint checks:
1. Password correct? ✅
2. Email verified? ✅
   ├─ If true → Return user data → Login success
   └─ If false → Error 403 "Please verify your email"
```

## Complete User Flows

### New User Flow
```
1. Register Form
   ↓
2. Verification Form (Enter Code)
   ↓
3. Email Verified
   ↓
4. Setup Wizard OR Dashboard
   ↓
5. Use app
```

### Logout & Login Flow
```
1. Click Logout
   ↓
2. Clear data
   ↓
3. Show Login Form
   ↓
4. Enter Email & Password
   ↓
5. Verify credentials
   ↓
6. Setup Wizard OR Dashboard
   ↓
7. Use app again
```

## Key Points

✅ **Registration:** Register → Verify Email → Setup/Dashboard
✅ **First Login:** Built into registration (verify email = login)
✅ **Logout:** Clears localStorage, shows login form
✅ **Returning Login:** Email + Password → Dashboard/Setup
✅ **Email Required:** Must verify before ANY login
✅ **No Double Login:** After verification, go straight to setup/dashboard

## Testing Checklist

- [ ] Register new user → See verification form
- [ ] Enter code → Go to setup/dashboard (NOT login)
- [ ] Complete setup → See dashboard
- [ ] Click logout → See login form
- [ ] Login with email/password → Back to dashboard
- [ ] Try login without email verified → Error message
- [ ] Register different department → Verify → Setup → Dashboard works

## What User Sees

**Register:** → Name, Email, Dept, Level, Password → "Create Account"
   ↓
**Verify:** → "Verify Your Email" form → Enter 6-digit code
   ↓
**Success:** → "Email verified! Welcome!" → Setup Wizard or Dashboard
   ↓
**Logout:** → Back to Login Form
   ↓
**Login:** → Email, Password → Dashboard
