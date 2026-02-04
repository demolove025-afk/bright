# Where Registered Users Are Stored

## Primary Storage Locations

### 1. **Local File: `user.json`** (Immediate/Backup Storage)
**File Path:** `c:\Users\HP\OneDrive\Documents\ayomide web dev\APKL\user.json`

This JSON file stores all registered users locally. Structure:
```json
{
  "users": [
    {
      "id": "UUID",
      "email": "user@example.com",
      "full_name": "John Doe",
      "password_hash": "$2b$10$...",
      "role": "student",
      "department": "Computer Science",
      "level": "200",
      "payment_status": "pending",
      "registered_courses": [],
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T10:30:00Z"
    }
  ],
  "metadata": {
    "total_users": 3,
    "last_updated": "timestamp"
  }
}
```

---

### 2. **Browser LocalStorage** (Session Storage)
**Key:** `bucodel_user`

When a user logs in or registers, their basic info is stored in browser localStorage:
```javascript
localStorage.setItem('bucodel_user', JSON.stringify({
  id: userId,
  name: fullName,
  email: userEmail,
  role: 'student',
  registeredAt: timestamp
}));
```

Also stores:
- `bucodel_setup` - User's setup/onboarding data (payment, department, level, courses)

---

### 3. **Supabase Cloud Database** (Main Storage)
**URL:** `https://dftnznkpaiybmchgumgb.supabase.co`

Tables in Supabase:
- **`users`** - Core user data (id, email, full_name, role, created_at, updated_at)
- **`user_profiles`** - Additional user info (department, academic_level, payment_confirmed, setup_completed)
- **`student_courses`** - Courses registered by students
- **`courses`** - Available courses
- **`departments`** - Department information

---

## How Data Flows

```
User Registration Form (Frontend)
    ↓
script.js - Registration Handler
    ↓
Backend API: POST /api/auth/register
    ↓
server.js - Register Endpoint
    ├→ Save to user.json (Local File)
    └→ Save to Supabase Database (Cloud)
    ↓
Frontend - Store in localStorage (Session)
```

---

## Server Storage Logic

**File:** `server.js`

Key functions:
- `readUsersJSON()` - Reads all users from user.json
- `writeUsersJSON(data)` - Writes users to user.json
- `addUserToJSON()` - Adds a new user to user.json
- Backend routes also sync with Supabase database

---

## Summary

| Storage Location | Type | Purpose | Persistence |
|---|---|---|---|
| `user.json` | Local JSON File | Backup, offline access | Persistent (survives restarts) |
| `localStorage` | Browser Storage | Session state, quick access | Until browser data cleared |
| `Supabase DB` | Cloud Database | Primary storage, shared access | Persistent (cloud hosted) |

---

## How to View All Registered Users

### Option 1: View locally
Open: `user.json` - Shows all users stored locally

### Option 2: View in Supabase
1. Go to https://dftnznkpaiybmchgumgb.supabase.co
2. Login with your Supabase credentials
3. Navigate to "SQL Editor" or "Table Editor"
4. View the `users` and `user_profiles` tables

### Option 3: Use Backend API
```bash
# Get all users from server
GET http://localhost:5000/api/users
```

---

## Database Schema

Users are identified by:
- **UUID (id)** - Unique identifier
- **Email** - Unique email address
- **Full Name** - User's name
- **Role** - student, admin, etc.
- **Timestamps** - created_at, updated_at

Associated data:
- **Payment Status** - pending, completed
- **Department & Level** - Academic info
- **Registered Courses** - Courses user enrolled in
- **Setup Completion** - Whether onboarding is done
