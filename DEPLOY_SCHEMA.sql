-- =============================================
-- YieldX Platform - COMPLETE DATABASE SCHEMA
-- =============================================
-- 🚀 Run this ENTIRE script in Supabase SQL Editor
-- Project: https://hwbpgmbcasgdvhbofauc.supabase.co
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. PROFILES TABLE (Main User Profiles)
-- =============================================
-- This links to Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'admin', 'organization')),
  
  -- Extended Profile
  display_name TEXT,
  phone_number TEXT,
  student_id TEXT,
  organization TEXT,
  major TEXT,
  bio TEXT,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  
  -- Social Links (stored as JSONB)
  social_links JSONB DEFAULT '{}'::jsonb,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  
  -- Gamification
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_login_date TIMESTAMPTZ,
  total_login_days INTEGER DEFAULT 0,
  
  -- Hierarchy
  university_id TEXT,
  class_id TEXT,
  
  -- Settings
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. LEVELS TABLE (8 Levels: 0-7)
-- =============================================
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  level_number INTEGER UNIQUE NOT NULL CHECK (level_number >= 0 AND level_number <= 7),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  subtitle_en TEXT,
  subtitle_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT, -- emoji or icon name
  max_xp INTEGER DEFAULT 500,
  unlocks_at_level INTEGER, -- prerequisite level
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. USER PROGRESS TABLE (Track Student Progress)
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  
  -- Progress Status
  status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'submitted', 'graded', 'late')),
  unlocked BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  
  -- Submission Data
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  grade DECIMAL(5,2),
  feedback TEXT,
  
  -- XP & Achievements
  xp_earned INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, level_id)
);

-- =============================================
-- 4. PROJECTS TABLE (Student Workspaces)
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Project Info
  name TEXT NOT NULL,
  description TEXT,
  mode TEXT DEFAULT 'individual' CHECK (mode IN ('individual', 'team', 'class')),
  
  -- Project Type (from Level 0)
  project_type TEXT CHECK (project_type IN ('agricultural', 'industrial', 'commercial', 'service')),
  project_subtype TEXT,
  
  -- Status & Progress
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress DECIMAL(5,2) DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  
  -- Class Integration
  class_code TEXT,
  qr_code TEXT,
  
  -- Level Data (stored as JSONB for flexibility)
  level_0_data JSONB DEFAULT '{}'::jsonb,
  level_1_data JSONB DEFAULT '{}'::jsonb,
  level_2_data JSONB DEFAULT '{}'::jsonb,
  level_3_data JSONB DEFAULT '{}'::jsonb,
  level_4_data JSONB DEFAULT '{}'::jsonb,
  level_5_data JSONB DEFAULT '{}'::jsonb,
  level_6_data JSONB DEFAULT '{}'::jsonb,
  level_7_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. BADGES TABLE (Achievements)
-- =============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Badge Info
  badge_type TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Progress
  earned BOOLEAN DEFAULT FALSE,
  earned_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  max_progress INTEGER DEFAULT 100,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. COHORTS TABLE (Classes/Study Groups)
-- =============================================
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Lecturer
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  semester TEXT,
  year INTEGER,
  university TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. COHORT MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cohort_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'assistant')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);

-- =============================================
-- 8. ANNOUNCEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Scope
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Author
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Read Tracking (array of user IDs)
  read_by UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =============================================
-- 9. MESSAGES TABLE (Direct Messages)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  deleted_by_sender BOOLEAN DEFAULT FALSE,
  deleted_by_recipient BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. PROJECT CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content
  message TEXT NOT NULL,
  is_announcement BOOLEAN DEFAULT FALSE,
  
  -- Status
  deleted BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. FILE UPLOADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- File Info
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Context
  level_number INTEGER CHECK (level_number >= 0 AND level_number <= 7),
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_level_id ON user_progress(level_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort_id ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_user_id ON cohort_members(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_cohort_id ON announcements(cohort_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_project_id ON file_uploads(project_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (profile_visibility = 'public' OR auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- LEVELS POLICIES (Everyone can read)
-- =============================================
CREATE POLICY "Levels are viewable by everyone"
  ON levels FOR SELECT
  USING (true);

-- =============================================
-- USER PROGRESS POLICIES
-- =============================================
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Lecturers can view student progress in their cohorts"
  ON user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cohorts c
      JOIN cohort_members cm ON c.id = cm.cohort_id
      WHERE c.lecturer_id = auth.uid()
      AND cm.user_id = user_progress.user_id
    )
  );

-- =============================================
-- PROJECTS POLICIES
-- =============================================
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Lecturers can view student projects in their cohorts"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cohorts c
      JOIN cohort_members cm ON c.id = cm.cohort_id
      WHERE c.lecturer_id = auth.uid()
      AND cm.user_id = projects.user_id
    )
  );

-- =============================================
-- BADGES POLICIES
-- =============================================
CREATE POLICY "Users can view own badges"
  ON badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges"
  ON badges FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- COHORTS POLICIES
-- =============================================
CREATE POLICY "Lecturers can manage own cohorts"
  ON cohorts FOR ALL
  USING (auth.uid() = lecturer_id);

CREATE POLICY "Students can view joined cohorts"
  ON cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohorts.id
      AND cm.user_id = auth.uid()
    )
  );

-- =============================================
-- COHORT MEMBERS POLICIES
-- =============================================
CREATE POLICY "Cohort members can view other members"
  ON cohort_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM cohorts c
      WHERE c.id = cohort_members.cohort_id
      AND c.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Lecturers can manage cohort members"
  ON cohort_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cohorts c
      WHERE c.id = cohort_members.cohort_id
      AND c.lecturer_id = auth.uid()
    )
  );

-- =============================================
-- ANNOUNCEMENTS POLICIES
-- =============================================
CREATE POLICY "Cohort members can view announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = announcements.cohort_id
      AND cm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM cohorts c
      WHERE c.id = announcements.cohort_id
      AND c.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Lecturers can manage announcements"
  ON announcements FOR ALL
  USING (auth.uid() = author_id);

-- =============================================
-- MESSAGES POLICIES
-- =============================================
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update message status"
  ON messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- =============================================
-- CHAT MESSAGES POLICIES
-- =============================================
CREATE POLICY "Project members can view chat messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = chat_messages.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can send chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = chat_messages.project_id
      AND p.user_id = auth.uid()
    )
  );

-- =============================================
-- FILE UPLOADS POLICIES
-- =============================================
CREATE POLICY "Users can view own files"
  ON file_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files"
  ON file_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON file_uploads FOR DELETE
  USING (auth.uid() = user_id);

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

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON cohorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INSERT LEVELS DATA (0-7)
-- =============================================
INSERT INTO levels (level_number, title_en, title_ar, icon, max_xp) VALUES
  (0, 'Project Foundation', 'أساسيات المشروع', '🎯', 500),
  (1, 'Market Analysis', 'تحليل السوق', '📊', 750),
  (2, 'Technical Study', 'الدراسة الفنية', '⚙️', 800),
  (3, 'Financial Planning', 'التخطيط المالي', '💰', 1000),
  (4, 'Risk Assessment', 'تقييم المخاطر', '⚠️', 900),
  (5, 'Business Model', 'نموذج العمل', '🏗️', 850),
  (6, 'Implementation Plan', 'خطة التنفيذ', '🚀', 1100),
  (7, 'Final Presentation', 'العرض النهائي', '🎓', 1200)
ON CONFLICT (level_number) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  icon = EXCLUDED.icon,
  max_xp = EXCLUDED.max_xp;

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own files to storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files from storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ YieldX Database Schema Created Successfully!';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables Created:';
  RAISE NOTICE '   - profiles (user accounts)';
  RAISE NOTICE '   - levels (0-7 learning levels)';
  RAISE NOTICE '   - user_progress (student progress tracking)';
  RAISE NOTICE '   - projects (student workspaces)';
  RAISE NOTICE '   - badges (achievements)';
  RAISE NOTICE '   - cohorts (classes)';
  RAISE NOTICE '   - cohort_members';
  RAISE NOTICE '   - announcements';
  RAISE NOTICE '   - messages';
  RAISE NOTICE '   - chat_messages';
  RAISE NOTICE '   - file_uploads';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Row Level Security: ENABLED';
  RAISE NOTICE '📁 Storage Bucket: project-files';
  RAISE NOTICE '🎯 Levels: 0-7 initialized';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. Create demo accounts (see step below)';
  RAISE NOTICE '   2. Test authentication';
  RAISE NOTICE '   3. Deploy your YieldX app';
  RAISE NOTICE '';
END $$;
