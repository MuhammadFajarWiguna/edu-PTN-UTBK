-- =====================================================
-- EduPTN Admin Real-Time Tracking Database Migration
-- Version: 1.0
-- Date: 2026-06-05
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER ACTIVITY TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  -- Activity types: login, logout, heartbeat, tryout_start, tryout_complete, 
  --                practice_start, practice_complete, page_view, feature_use
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_type ON user_activity(user_id, activity_type);

-- Add comment
COMMENT ON TABLE user_activity IS 'Tracks all user activities for admin dashboard analytics';

-- =====================================================
-- 2. ENHANCED TRYOUT SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tryout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_id UUID NOT NULL, -- References tryouts table (if exists)
  status VARCHAR(20) DEFAULT 'in_progress',
  -- Status: in_progress, completed, abandoned, timed_out
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- Actual time taken
  score_total INTEGER,
  score_tps INTEGER,
  score_literasi INTEGER,
  score_tka_saintek INTEGER,
  score_tka_soshum INTEGER,
  subtest_scores JSONB DEFAULT '{}',
  -- Format: {"Penalaran Umum": 650, "Pengetahuan Kuantitatif": 580, ...}
  answers JSONB DEFAULT '[]',
  -- Format: [{"soal_id": "uuid", "jawaban": "A", "is_correct": true}, ...]
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tryout_sessions_user_id ON tryout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tryout_sessions_tryout_id ON tryout_sessions(tryout_id);
CREATE INDEX IF NOT EXISTS idx_tryout_sessions_status ON tryout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_tryout_sessions_completed_at ON tryout_sessions(completed_at DESC);

-- Add comment
COMMENT ON TABLE tryout_sessions IS 'Complete tracking of student tryout attempts with scoring';

-- =====================================================
-- 3. PRACTICE SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel VARCHAR(100) NOT NULL,
  -- Mapel: TPS, LITERASI, SAINTEK, SOSHUM, Penalaran Umum, etc.
  subtest VARCHAR(100),
  status VARCHAR(20) DEFAULT 'in_progress',
  -- Status: in_progress, completed, abandoned
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  unanswered INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),
  answers JSONB DEFAULT '[]',
  -- Format: [{"soal_id": "uuid", "jawaban": "A", "is_correct": true, "time_spent_seconds": 45}, ...]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_mapel ON practice_sessions(mapel);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_status ON practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_completed_at ON practice_sessions(completed_at DESC);

-- Add comment
COMMENT ON TABLE practice_sessions IS 'Tracking of practice sessions with detailed performance metrics';

-- =====================================================
-- 4. QUESTION BANK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pertanyaan TEXT NOT NULL,
  opsi JSONB NOT NULL,
  -- Format: {"A": "Opsi A", "B": "Opsi B", "C": "Opsi C", "D": "Opsi D", "E": "Opsi E"}
  jawaban VARCHAR(1) NOT NULL,
  -- Correct answer: A, B, C, D, or E
  pembahasan TEXT,
  -- Detailed explanation
  mapel VARCHAR(50) NOT NULL,
  -- TPS, LITERASI, SAINTEK, SOSHUM
  subtest VARCHAR(100),
  -- Subtest category
  tingkat VARCHAR(20) DEFAULT 'sedang',
  -- Difficulty: mudah, sedang, sulit
  tags TEXT[],
  -- Array of tags for categorization
  image_url TEXT,
  -- Optional image for question
  created_by UUID REFERENCES auth.users(id),
  -- Admin who created the question
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  -- How many times this question has been used
  avg_correct_rate DECIMAL(5,2),
  -- Average percentage of students who answered correctly
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_mapel ON question_bank(mapel);
CREATE INDEX IF NOT EXISTS idx_question_bank_subtest ON question_bank(subtest);
CREATE INDEX IF NOT EXISTS idx_question_bank_tingkat ON question_bank(tingkat);
CREATE INDEX IF NOT EXISTS idx_question_bank_is_active ON question_bank(is_active);
CREATE INDEX IF NOT EXISTS idx_question_bank_created_by ON question_bank(created_by);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_question_bank_pertanyaan_search 
ON question_bank USING GIN (to_tsvector('indonesian', pertanyaan));

-- Add comment
COMMENT ON TABLE question_bank IS 'Centralized question bank with analytics and tagging';

-- =====================================================
-- 5. ADMIN STATS CACHE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_stats_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_type VARCHAR(50) UNIQUE NOT NULL,
  -- Types: registered_students, active_users, tryout_completion, etc.
  stat_value JSONB NOT NULL,
  -- Cached statistical data
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_stats_cache_type ON admin_stats_cache(stat_type);

-- Add comment
COMMENT ON TABLE admin_stats_cache IS 'Cache for expensive statistical queries to improve dashboard performance';

-- =====================================================
-- 6. TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_tryout_sessions_updated_at ON tryout_sessions;
CREATE TRIGGER update_tryout_sessions_updated_at
    BEFORE UPDATE ON tryout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_practice_sessions_updated_at ON practice_sessions;
CREATE TRIGGER update_practice_sessions_updated_at
    BEFORE UPDATE ON practice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_question_bank_updated_at ON question_bank;
CREATE TRIGGER update_question_bank_updated_at
    BEFORE UPDATE ON question_bank
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stats_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activities
CREATE POLICY "Users can view own activity"
ON user_activity FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own activities
CREATE POLICY "Users can insert own activity"
ON user_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all activities
CREATE POLICY "Admins can view all activities"
ON user_activity FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'ADMIN' OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- Policy: Users can view their own tryout sessions
CREATE POLICY "Users can view own tryout sessions"
ON tryout_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert/update their own tryout sessions
CREATE POLICY "Users can insert own tryout sessions"
ON tryout_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tryout sessions"
ON tryout_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Admins can view all tryout sessions
CREATE POLICY "Admins can view all tryout sessions"
ON tryout_sessions FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'ADMIN' OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- Policy: Users can view their own practice sessions
CREATE POLICY "Users can view own practice sessions"
ON practice_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert/update their own practice sessions
CREATE POLICY "Users can insert own practice sessions"
ON practice_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice sessions"
ON practice_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Admins can view all practice sessions
CREATE POLICY "Admins can view all practice sessions"
ON practice_sessions FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'ADMIN' OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- Policy: All authenticated users can view active questions
CREATE POLICY "Authenticated users can view questions"
ON question_bank FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);

-- Policy: Admins can manage questions
CREATE POLICY "Admins can insert questions"
ON question_bank FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' = 'ADMIN' OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

CREATE POLICY "Admins can update questions"
ON question_bank FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'ADMIN' OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

CREATE POLICY "Admins can delete questions"
ON question_bank FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'ADMIN' OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- Policy: Only admins can access stats cache
CREATE POLICY "Admins can view stats cache"
ON admin_stats_cache FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'ADMIN' OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

CREATE POLICY "Admins can modify stats cache"
ON admin_stats_cache FOR ALL
USING (
  auth.jwt() ->> 'role' = 'ADMIN' OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- =====================================================
-- 8. HELPER FUNCTIONS FOR ADMIN DASHBOARD
-- =====================================================

-- Function to get active users count in last N minutes
CREATE OR REPLACE FUNCTION get_active_users_count(minutes_ago INTEGER DEFAULT 15)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM user_activity
    WHERE created_at >= NOW() - INTERVAL '1 minute' * minutes_ago
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get tryout completion rate
CREATE OR REPLACE FUNCTION get_tryout_completion_rate()
RETURNS DECIMAL AS $$
DECLARE
  total_sessions INTEGER;
  completed_sessions INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_sessions FROM tryout_sessions;
  SELECT COUNT(*) INTO completed_sessions FROM tryout_sessions WHERE status = 'completed';
  
  IF total_sessions = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completed_sessions::DECIMAL / total_sessions::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate question usage statistics
CREATE OR REPLACE FUNCTION update_question_statistics(question_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE question_bank
  SET 
    usage_count = (
      SELECT COUNT(*) 
      FROM practice_sessions ps, jsonb_array_elements(ps.answers) answer
      WHERE answer->>'soal_id' = question_id::TEXT
    ),
    avg_correct_rate = (
      SELECT AVG(CASE WHEN (answer->>'is_correct')::BOOLEAN THEN 100 ELSE 0 END)
      FROM practice_sessions ps, jsonb_array_elements(ps.answers) answer
      WHERE answer->>'soal_id' = question_id::TEXT
    )
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. MATERIALIZED VIEWS FOR PERFORMANCE
-- =====================================================

-- Materialized view for daily statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_statistics AS
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_activities,
  COUNT(*) FILTER (WHERE activity_type = 'login') as logins,
  COUNT(*) FILTER (WHERE activity_type = 'tryout_complete') as tryouts_completed,
  COUNT(*) FILTER (WHERE activity_type = 'practice_complete') as practices_completed
FROM user_activity
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_daily_statistics_date ON daily_statistics(date DESC);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_daily_statistics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_statistics;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. SAMPLE ADMIN USER (FOR TESTING)
-- =====================================================

-- Insert sample admin user (update password hash as needed)
-- Note: This is for development only. Remove or change in production!
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  role
)
VALUES (
  uuid_generate_v4(),
  'admin@eduptn.com',
  crypt('admin123', gen_salt('bf')), -- You'll need to hash this properly
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","role":"ADMIN"}',
  '{"name":"Admin EduPTN","role":"ADMIN"}',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT ON user_activity TO authenticated;
GRANT INSERT ON user_activity TO authenticated;

GRANT SELECT, INSERT, UPDATE ON tryout_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON practice_sessions TO authenticated;
GRANT SELECT ON question_bank TO authenticated;

-- Grant all permissions to service_role (for admin operations)
GRANT ALL ON user_activity TO service_role;
GRANT ALL ON tryout_sessions TO service_role;
GRANT ALL ON practice_sessions TO service_role;
GRANT ALL ON question_bank TO service_role;
GRANT ALL ON admin_stats_cache TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_activity',
  'tryout_sessions',
  'practice_sessions',
  'question_bank',
  'admin_stats_cache'
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Admin Real-Time Tracking Database Migration Completed Successfully!';
  RAISE NOTICE 'Tables created: user_activity, tryout_sessions, practice_sessions, question_bank, admin_stats_cache';
  RAISE NOTICE 'Sample admin user: admin@eduptn.com / admin123';
  RAISE NOTICE 'Remember to change admin password in production!';
END $$;
