-- Per-track tables (one table per learning track)
-- Use this file to create separate tables for each track if you prefer denormalized layout.

-- UI/UX track table
CREATE TABLE IF NOT EXISTS track_ui_ux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Web Development track table
CREATE TABLE IF NOT EXISTS track_web_dev (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mobile Development track table
CREATE TABLE IF NOT EXISTS track_mobile_dev (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fullstack Development track table
CREATE TABLE IF NOT EXISTS track_fullstack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Data Science track table
CREATE TABLE IF NOT EXISTS track_data_science (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cybersecurity track table
CREATE TABLE IF NOT EXISTS track_cybersecurity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cloud Computing track table
CREATE TABLE IF NOT EXISTS track_cloud (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Artificial Intelligence track table
CREATE TABLE IF NOT EXISTS track_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Animation track table
CREATE TABLE IF NOT EXISTS track_animation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Digital Marketing track table
CREATE TABLE IF NOT EXISTS track_marketing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  students INTEGER DEFAULT 0,
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample seed rows into the Fullstack track table
INSERT INTO track_fullstack (code, name, description, students, schedule) VALUES
  ('FS101', 'Frontend Fundamentals', 'Frontend development with HTML/CSS/JS', 35, 'MWF 09:00-10:00'),
  ('FS102', 'Backend Development', 'Node.js/Express/Postgres basics', 32, 'TTh 14:00-15:30'),
  ('FS103', 'Full Stack Integration', 'Connecting frontend and backend', 28, 'MWF 11:00-12:00')
ON CONFLICT DO NOTHING;
