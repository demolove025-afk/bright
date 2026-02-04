# Bucodel - University Management Portal

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm

Note: Supabase integration has been removed in this build. The server now uses local JSON files for user storage and sample data for courses.

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
  Edit `.env` file if needed (only `PORT` is required for local runs):
  ```
  PORT=5000
  ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

### API Endpoints

#### Authentication

- **Register User**
  ```
  POST /api/auth/register
  Body: { name, email, password, confirmPassword }
  ```

- **Login User**
  ```
  POST /api/auth/login
  Body: { email, password }
  ```

- **Logout User**
  ```
  POST /api/auth/logout
  ```

#### User Management

- **Get User Profile**
  ```
  GET /api/user/:userId
  ```

- **Create User (Admin)**
  ```
  POST /api/admin/create-user
  Body: { name, email, password, role }
  ```

#### Health Check

- **Server Status**
  ```
  GET /api/health
  ```

### Database Setup

This build uses local JSON files (`user.json`, `courses.json`) for data storage. For production, migrate to a managed database and update the server code accordingly.

### Features

✅ User Registration with email verification
✅ Secure Login/Logout
✅ User Profile Management
✅ Admin user creation
✅ Error handling
✅ CORS enabled for frontend integration
✅ Environment variable configuration

### Frontend Integration

The frontend sends requests to `http://localhost:5000/api/auth/*` endpoints.

Make sure:
1. Server is running on port 5000
2. CORS is enabled (already configured in server.js)
3. Frontend is served on the same domain or CORS headers are properly set

### Security Notes

⚠️ Never expose your `SUPABASE_SERVICE_KEY` in public code
⚠️ Use environment variables for all sensitive data
⚠️ Enable Row Level Security (RLS) on Supabase tables
⚠️ Validate all inputs on both frontend and backend

### Troubleshooting

**Error: SUPABASE_URL not defined**
- Check your `.env` file has correct Supabase credentials

**CORS Error**
- Ensure frontend domain is allowed in CORS settings
- Server already has `cors()` middleware enabled

**400 Bad Request on Login**
- Verify email/password are correct
- Check Supabase auth settings allow password auth

**Cannot POST /api/auth/...**
- Ensure server is running on port 5000
- Check endpoint URL in frontend code matches

---

For support or issues, check the browser console and server logs for detailed error messages.
