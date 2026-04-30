-- YieldX Platform Database Schema
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'admin', 'organization')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 0,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  country TEXT,
  university TEXT,
  bio TEXT
);

-- =============================================
-- PROJECTS TABLE (Student Workspaces)
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  total_xp INTEGER DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0,
  
  -- Level 0: Project Type Selection
  project_type TEXT CHECK (project_type IN ('agricultural', 'industrial', 'commercial', 'service')),
  project_subtype TEXT,
  
  -- Level Data (stored as JSONB for flexibility)
  level_0_data JSONB DEFAULT '{}'::jsonb,
  level_1_data JSONB DEFAULT '{}'::jsonb,
  level_2_data JSONB DEFAULT '{}'::jsonb,
  level_3_data JSONB DEFAULT '{}'::jsonb,
  level_4_data JSONB DEFAULT '{}'::jsonb,
  level_5_data JSONB DEFAULT '{}'::jsonb,
  level_6_data JSONB DEFAULT '{}'::jsonb,
  level_7_data JSONB DEFAULT '{}'::jsonb
);

-- =============================================
-- SUBMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 7),
  status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'submitted', 'graded', 'late')),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  grade DECIMAL(5,2),
  feedback TEXT,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COHORTS TABLE (Study Groups/Classes)
-- =============================================
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  lecturer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  semester TEXT,
  year INTEGER
);

-- =============================================
-- COHORT MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cohort_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'assistant')),
  UNIQUE(cohort_id, user_id)
);

-- =============================================
-- ANNOUNCEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  lecturer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort_id ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_user_id ON cohort_members(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_cohort_id ON announcements(cohort_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users: Can read all, update own profile
CREATE POLICY "Users can read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Projects: Users can only access their own projects
CREATE POLICY "Users can read own projects" ON projects FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid()::text = user_id::text);

-- Submissions: Users can access own submissions, lecturers can access student submissions
CREATE POLICY "Users can read own submissions" ON submissions FOR SELECT 
  USING (
    auth.uid()::text = user_id::text OR
    EXISTS (
      SELECT 1 FROM cohorts c
      JOIN cohort_members cm ON c.id = cm.cohort_id
      WHERE c.lecturer_id::text = auth.uid()::text
      AND cm.user_id::text = submissions.user_id::text
    )
  );
CREATE POLICY "Users can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own submissions" ON submissions FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Cohorts: Lecturers can manage their cohorts, students can view joined cohorts
CREATE POLICY "Lecturers can manage own cohorts" ON cohorts FOR ALL USING (auth.uid()::text = lecturer_id::text);
CREATE POLICY "Students can view joined cohorts" ON cohorts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohorts.id
      AND cm.user_id::text = auth.uid()::text
    )
  );

-- Cohort Members: Can read if member or lecturer
CREATE POLICY "Members can view cohort members" ON cohort_members FOR SELECT 
  USING (
    auth.uid()::text = user_id::text OR
    EXISTS (
      SELECT 1 FROM cohorts c
      WHERE c.id = cohort_members.cohort_id
      AND c.lecturer_id::text = auth.uid()::text
    )
  );
CREATE POLICY "Lecturers can manage cohort members" ON cohort_members FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM cohorts c
      WHERE c.id = cohort_members.cohort_id
      AND c.lecturer_id::text = auth.uid()::text
    )
  );

-- Announcements: Readable by cohort members, manageable by lecturers
CREATE POLICY "Members can view announcements" ON announcements FOR SELECT 
  USING (
    cohort_id IS NULL OR
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = announcements.cohort_id
      AND cm.user_id::text = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM cohorts c
      WHERE c.id = announcements.cohort_id
      AND c.lecturer_id::text = auth.uid()::text
    )
  );
CREATE POLICY "Lecturers can manage announcements" ON announcements FOR ALL USING (auth.uid()::text = lecturer_id::text);

-- Messages: Users can read/send own messages
CREATE POLICY "Users can read own messages" ON messages FOR SELECT 
  USING (auth.uid()::text = sender_id::text OR auth.uid()::text = recipient_id::text);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid()::text = recipient_id::text);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohorts_updated_at BEFORE UPDATE ON cohorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DEMO DATA (Optional - for testing)
-- =============================================

-- Insert demo users (passwords will be managed via Supabase Auth)
INSERT INTO users (id, email, name, role, total_xp, current_level) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo.student@yieldx.com', 'Demo Student', 'student', 2450, 3),
  ('00000000-0000-0000-0000-000000000002', 'demo.teacher@yieldx.com', 'Demo Teacher', 'lecturer', 0, 0),
  ('00000000-0000-0000-0000-000000000003', 'admin@yieldx.com', 'System Admin', 'admin', 0, 0)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- STORAGE BUCKETS FOR FILE UPLOADS
-- =============================================

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for attachments
CREATE POLICY "Users can upload own attachments" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read own attachments" ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own attachments" ON storage.objects FOR DELETE
  USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ YieldX Database Schema Created Successfully!';
  RAISE NOTICE '📊 Tables: users, projects, submissions, cohorts, cohort_members, announcements, messages';
  RAISE NOTICE '🔒 Row Level Security (RLS) enabled on all tables';
  RAISE NOTICE '📁 Storage bucket "attachments" created';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. Create user accounts via Supabase Auth Dashboard';
  RAISE NOTICE '   2. Test RLS policies';
  RAISE NOTICE '   3. Configure YieldX frontend to use Supabase client';
END $$;
