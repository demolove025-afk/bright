# APKL - Bucodel University Management System - Setup Guide

## Overview
This guide helps you set up the complete APKL (Bucodel) University Management System with all dependencies and database initialization.

## Prerequisites
- Node.js v16 or higher
- npm or yarn
- Supabase account (free tier available)
- Modern web browser

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Configuration

#### A. Create Supabase Project
1. Go to [Supabase Console](https://app.supabase.com)
2. Click "New Project"
3. Enter project details and create
4. Note your `Project URL` and `Anon Key`

#### B. Update Environment Variables
The `.env` file is already configured with:
- `PORT=5000` (Backend server port)
- `SUPABASE_URL` (Already filled)
- `SUPABASE_ANON_KEY` (Already filled)
- `SUPABASE_SERVICE_KEY` (Leave empty unless you have admin access)
- `API_URL=http://localhost:5000`

**Important:** Keep your Supabase keys secure and never commit them to public repositories.

### 3. Initialize Database

#### A. Using Supabase SQL Editor
1. Go to Supabase Console → SQL Editor
2. Create a new query
3. Copy and paste the entire SQL schema from `database-init.js`
4. Execute the query

The schema will create these tables:
- `users` - User accounts
- `user_profiles` - User setup and enrollment data
- `departments` - Academic departments
- `courses` - Course catalog
- `student_courses` - Course enrollment records

#### B. Seed Department Data
In Supabase SQL Editor, run:
```sql
INSERT INTO departments (id, name, code) VALUES 
  (1, 'Computer Science', 'CS'),
  (2, 'Engineering', 'ENG'),
  (3, 'Business Administration', 'BUS'),
  (4, 'Law', 'LAW'),
  (5, 'Medicine', 'MED'),
  (6, 'Arts & Sciences', 'ART');
```

### 4. Add Sample Courses (Optional)
In Supabase SQL Editor:
```sql
-- Computer Science courses
INSERT INTO courses (code, name, description, department_id, academic_level, credits) VALUES
  ('CS101', 'Introduction to Programming', 'Learn basic programming concepts', 1, '100', 3),
  ('CS102', 'Data Structures', 'Understanding data structures and algorithms', 1, '100', 3),
  ('CS201', 'Database Management', 'Database design and SQL', 1, '200', 4),
  ('CS202', 'Web Development', 'Full-stack web development', 1, '200', 4);

-- Add more courses for other departments as needed
```

### 5. Start Development

#### Terminal 1: Backend Server
```bash
npm start
```
Server will run on `http://localhost:5000`

#### Terminal 2: Frontend
Open `index.html` in a browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Or using Node
npx http-server
```

## Project Structure

```
APKL/
├── index.html           # Main UI
├── script.js            # Frontend logic
├── styles.css           # Styling
├── server.js            # Backend server
├── config.js            # Configuration
├── supabase-config.js   # Supabase initialization
├── database-init.js     # Database schema
├── .env                 # Environment variables
├── package.json         # Dependencies
└── user.json            # Sample user data
```

## Common Issues & Solutions

### Issue: "Relation 'users' does not exist"
**Solution:** Database tables haven't been created. Run the SQL schema from Supabase Console (Step 3.A).

### Issue: CORS errors when fetching from backend
**Solution:** The backend is configured to serve static files and accept requests. Ensure server is running on port 5000.

### Issue: Courses not loading in setup wizard
**Solution:** 
1. Check if `courses` table exists in Supabase
2. Ensure `department_id` and `academic_level` are correctly set
3. App will fall back to sample data if table doesn't exist

### Issue: Can't connect to backend during development
**Solution:** 
- Check if server is running: `npm start`
- Check port 5000 is not in use
- Verify `.env` has correct `API_URL`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User
- `GET /api/user/:userId` - Get user profile

### Admin
- `POST /api/admin/create-user` - Create user (requires service key)

### Health Check
- `GET /api/health` - Server status

## Feature Overview

### User Registration & Login
- Email-based authentication via Supabase Auth
- Password validation (minimum 6 characters)
- Automatic user profile creation

### Setup Wizard (3 Steps)
1. **Payment**: Tuition fee payment confirmation
2. **Department & Level**: Select academic department and level
3. **Course Registration**: Select at least 3 courses

### Dashboard
- View enrolled courses
- Manage account settings
- Course schedules and grades (expandable)

## Development Notes

### Frontend Architecture
- Vanilla JavaScript (no frameworks)
- localStorage for client-side state
- Supabase JS client for real-time features

### Backend Architecture
- Express.js server
- Supabase client for database and auth
- CORS enabled for local development
- Static file serving

### Database Architecture
- PostgreSQL via Supabase
- Row Level Security (RLS) for data privacy
- Foreign key relationships for data integrity

## Next Steps

1. **Add payment integration** - Implement Paystack/Flutterwave API
2. **Real-time notifications** - Use Supabase Realtime
3. **Grade management** - Add grade submission and tracking
4. **Email notifications** - Configure Supabase email templates
5. **Admin dashboard** - Build admin interface for user management

## Support & Debugging

### Enable Debug Mode
In browser console:
```javascript
window.appConfig.DEBUG_MODE = true;
```

### View Logs
- Backend logs: Check terminal running `npm start`
- Frontend logs: Browser Developer Tools (F12)
- Database logs: Supabase Console → Logs

## Deployment Checklist

- [ ] Set production `API_URL` in config.js
- [ ] Store Supabase keys in secure environment variables
- [ ] Enable CORS for production domain
- [ ] Configure Supabase RLS policies
- [ ] Set up monitoring and error tracking
- [ ] Enable HTTPS for production

## License
This project is for educational purposes.
