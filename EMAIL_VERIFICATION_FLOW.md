# Email Verification - Updated Flow

## What Changed

The registration process now **requires email verification before users can login**.

## Registration Flow (Updated)

### Step 1: Register
- User fills out registration form with name, email, department, level, password
- Click "Create Account"
- Server receives request at `/api/auth/register`
- Server hashes password with bcrypt
- Server saves user to user.json with `email_verified: false`
- Server generates and sends verification code to email
- Client shows verification form

### Step 2: Verify Email (REQUIRED)
- User enters 6-digit code from their email
- Click "Verify Code"
- Server receives request at `/api/auth/verify-code`
- Server validates the code
- Server marks user `email_verified: true` in user.json
- **User is now registered and verified**
- Client shows "Email verified successfully! You can now login."
- Client redirects to login form

### Step 3: Login
- User can now enter email and password
- Click "Sign In"
- Server receives request at `/api/auth/login`
- Server verifies password
- **Server checks if `email_verified: true`** ← NEW CHECK
- If email not verified: Returns 403 error "Please verify your email before logging in"
- If email verified: Returns user data and allows login
- User sees dashboard

## Key Changes in Code

### server.js
1. Added check in `/api/auth/login`:
```javascript
if (!user.email_verified) {
  return res.status(403).json({
    success: false,
    message: 'Please verify your email before logging in'
  });
}
```

2. Fixed case-insensitive email matching:
```javascript
const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
```

3. Added logging to verify-code endpoint to track verification status

### script.js
1. Updated verification success handler to show login form instead of dashboard
2. Added `showLoginForm()` helper function
3. Email verification now properly required before login

## User.json Structure

When user registers:
```json
{
  "id": "user_1234567890",
  "email": "ayomideoluniyi49@gmail.com",
  "full_name": "Olamide",
  "password_hash": "$2b$10$...",
  "email_verified": false,  // ← Initially false
  "department": "Computer Science",
  "level": "200",
  ...
}
```

After email verification:
```json
{
  "id": "user_1234567890",
  "email": "ayomideoluniyi49@gmail.com",
  "full_name": "Olamide",
  "password_hash": "$2b$10$...",
  "email_verified": true,   // ← Changed to true
  "department": "Computer Science",
  "level": "200",
  ...
}
```

## Testing the Complete Flow

1. **Register new user**
   - Open http://localhost:5000
   - Click "Register"
   - Fill form: Name, Email, Department, Level, Password
   - Click "Create Account"
   - Should see verification form

2. **Verify email**
   - Check email for 6-digit code
   - Enter code in verification form
   - Click "Verify Code"
   - Should see "Email verified successfully! You can now login."
   - Should be redirected to login form

3. **Login**
   - Enter email and password
   - Click "Sign In"
   - Should see dashboard (no 403 error)

## Error Handling

If user tries to login without verifying email:
- ❌ Error 403: "Please verify your email before logging in"

If user enters wrong verification code:
- ❌ Error 400: "Invalid code" or code expired message

## Benefits

✅ Ensures valid email before account can be used
✅ Prevents spam/invalid email registrations
✅ Users must complete verification to access system
✅ Email normalization (case-insensitive)
✅ Secure password verification with bcrypt

## Troubleshooting

**User can't login after verification:**
- Check user.json: email_verified should be `true`
- Check case of email (should be lowercase in user.json)
- Check if verification code was actually processed

**Verification code not received:**
- Check email spam folder
- Check email-service logs
- Click "Resend Code" to send new code

**Email marked verified but login still fails:**
- Check server logs for detailed error
- Verify user.json was properly updated with email_verified: true
- Try a fresh registration
