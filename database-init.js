// Database initialization and setup helper
const fs = require('fs');
const path = require('path');

// SQL schema for required tables
const DATABASE_SCHEMA = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  department_id INTEGER,
  academic_level TEXT,
  payment_method TEXT,
  payment_confirmed BOOLEAN DEFAULT FALSE,
  setup_completed BOOLEAN DEFAULT FALSE,
  setup_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  department_id INTEGER REFERENCES departments(id),
  academic_level TEXT,
  credits INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Student Courses (enrollment) table
CREATE TABLE IF NOT EXISTS student_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  grade TEXT,
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_profiles table
CREATE POLICY "Users can view their own profile data" ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile data" ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for student_courses table
CREATE POLICY "Students can view their own courses" ON student_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can manage their own courses" ON student_courses FOR INSERT, UPDATE, DELETE
  USING (auth.uid() = user_id);
`;

// Department seed data
const DEPARTMENT_SEEDS = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Engineering', code: 'ENG' },
  { id: 3, name: 'Business Administration', code: 'BUS' },
  { id: 4, name: 'Law', code: 'LAW' },
  { id: 5, name: 'Medicine', code: 'MED' },
  { id: 6, name: 'Arts & Sciences', code: 'ART' }
];

// Export database schema and seeds
module.exports = {
  DATABASE_SCHEMA,
  DEPARTMENT_SEEDS,
  getSetupInstructions: () => `
    Database Setup Instructions:
    1. Go to Supabase Dashboard: https://app.supabase.com
    2. Open the SQL Editor
    3. Run the following SQL to initialize tables:
    
${DATABASE_SCHEMA}

    4. After running schema, seed the departments:
    
${DEPARTMENT_SEEDS.map(d => `INSERT INTO departments (id, name, code) VALUES (${d.id}, '${d.name}', '${d.code}');`).join('\n')}
    
    5. Done! Your database is now set up.
  `
};
