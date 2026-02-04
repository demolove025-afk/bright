# Quick Reference: Server-Side Auth Implementation

## What Changed?

**Before:** Login/Register → Supabase Auth Server → user.json
**Now:** Login/Register → Your Server (bcrypt) → user.json

## API Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "department": "Computer Science",
  "level": "100",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email for verification code.",
  "user": {
    "id": "user_1234567890",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "nextStep": "verify-email"
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_1234567890",
    "email": "john@example.com",
    "name": "John Doe",
    "department": "Computer Science",
    "level": "100"
  }
}
```

**Response (Email Not Verified):**
```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```

### POST /api/auth/verify-code
**Request:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "email": "john@example.com"
}
```

### POST /api/auth/resend-code
**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification code sent successfully!",
  "email": "john@example.com"
}
```

## Key Functions in server.js

```javascript
// Hash password and add user
async function addUserWithPassword(email, fullName, department, level, hashedPassword)

// Verify password during login
async function verifyUserPassword(email, password)

// Mark email as verified after code validation
function markEmailAsVerified(email)
```

## Password Security

- Passwords are hashed using bcrypt with 10 salt rounds
- Hashed passwords stored in user.json as `password_hash`
- Original passwords never stored in plain text
- Password comparison uses secure bcrypt.compare()

## User.json Structure

```
{
  "users": [
    {
      "id": "user_1234567890",
      "email": "john@example.com",
      "full_name": "John Doe",
      "password_hash": "$2b$10$...",
      "department": "Computer Science",
      "level": "100",
      "email_verified": false,
      "role": "student",
      ...other fields
    }
  ],
  "metadata": {
    "total_users": 1,
    "last_updated": "2025-01-26T..."
  }
}
```

## Requirements Met

✅ Register handled by server.js
✅ Login handled by server.js  
✅ Password hashing with bcrypt
✅ Email verification still working
✅ User stored in user.json
✅ No Supabase Auth dependency
✅ Client code remains unchanged

## Installation

```bash
npm install bcrypt
```

## Running the Server

```bash
npm start
# or with nodemon for development
npm run dev
```

## Testing

1. Open http://localhost:5000 (or your configured port)
2. Register new user
3. Check email for verification code
4. Verify email
5. Login with credentials
6. Check user.json to see password_hash
