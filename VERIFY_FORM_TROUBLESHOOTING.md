# Verification Code Form - Troubleshooting Guide

## What Should Happen After Registration

### Step 1: User Submits Registration Form
- Fill in: Name, Email, Department, Level, Password
- Click "Create Account"

### Step 2: Page Shows Alert
- Alert message: "✅ Registration successful! Please enter the verification code sent to your email."
- Click OK to close alert

### Step 3: Verification Form Should Appear
- The page should show "Verify Your Email" form
- You should see the email address displayed (e.g., "Verification code sent to: yourname@email.com")
- There should be an input field for the 6-digit code
- A "Verify Code" button

## If the Verification Form is NOT Showing

### Check These Things:

1. **Open Browser Console** (F12)
   - Look at the Console tab
   - Should see many logs starting with ✅, 📝, 🔔, etc.
   - If you see any red errors, screenshot them

2. **Check the Logs in Console**
   - Should see: `📝 Registration form submitted`
   - Should see: `✅ Registration successful!`
   - Should see: `🔔 Calling showVerificationForm...`
   - Should see: `✅ Added active to verify-form`

3. **Check If Form Exists**
   - In browser Console, type: `document.getElementById('verify-form')`
   - Should return a form element (not null)
   - If null, the HTML is missing the form

4. **Check If Classes Are Added**
   - Type in Console: `document.getElementById('verify-form').className`
   - Should show: `auth-form active`

5. **Check Display Style**
   - Type in Console: `window.getComputedStyle(document.getElementById('verify-form')).display`
   - Should show: `block`

## Expected Console Output After Registration

```
📝 Registration form submitted
📤 Sending registration request: {...}
📊 Response status: 201
📥 Response data: {success: true, message: "...", user: {...}, nextStep: "verify-email"}
✅ Registration successful!
📋 Registration data stored: {...}
🔔 Calling showVerificationForm...
🔍 showVerificationForm called with email: yourname@email.com
📋 Found elements: {registerForm: true, verifyForm: true, loginForm: true}
✅ Removed active from register-form
✅ Removed active from login-form
✅ Added active to verify-form
🎨 Verify form style.display: 
🎨 Verify form computed display: block
✅ Set verify email display
✅ Reset registration form
✅ Focused on verify-code input
✅ showVerificationForm completed
✅ showVerificationForm returned
```

## What the Verification Form Should Look Like

```
┌─────────────────────────────────┐
│  Verify Your Email              │
├─────────────────────────────────┤
│ We've sent a 6-digit code to    │
│ your email. Please enter it     │
│ below to complete registration. │
│                                 │
│ Verification code sent to:      │
│ yourname@email.com              │
│                                 │
│ Verification Code               │
│ [    Input field for code    ]  │
│                                 │
│      [ Verify Code Button ]     │
│                                 │
│ Didn't receive the code?        │
│ Resend Code                     │
│                                 │
│ Back to Registration            │
└─────────────────────────────────┘
```

## Testing Steps

1. **Open http://localhost:5000**
2. **Click "Register"** (if not already showing register form)
3. **Fill in the form:**
   - Full Name: Test User
   - Email: test@example.com
   - Department: Computer Science
   - Level: 100
   - Password: Test1234
   - Confirm Password: Test1234
4. **Click "Create Account"**
5. **Wait for alert** (should see success message)
6. **Close alert** (click OK)
7. **Look at the form** - should now show "Verify Your Email" instead of registration form

## If Still Not Working

- Check email for 6-digit code
- Open F12 Developer Tools → Console
- Take a screenshot of any red errors
- Check if "auth-form active" is being set

## Related Code

**showVerificationForm** function in script.js adds the "active" class to verify-form
**CSS Rule** in styles.css: `.auth-form.active { display: block; }`
**HTML Element** in index.html: `<form id="verify-form" class="auth-form">`
