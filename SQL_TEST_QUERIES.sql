-- =====================================================
-- EduPTN Admin Dashboard - SQL Test Queries
-- Use these queries to verify setup and troubleshoot
-- =====================================================

-- =====================================================
-- 1. VERIFY DATABASE SETUP
-- =====================================================

-- Check if all required tables exist
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
  'user_activity',
  'tryout_sessions',
  'practice_sessions',
  'question_bank',
  'admin_stats_cache'
)
ORDER BY table_name;

-- Expected: 5 rows, each with column_count > 5

-- Check all indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'user_activity',
  'tryout_sessions',
  'practice_sessions',
  'question_bank'
)
ORDER BY tablename, indexname;

-- Expected: Multiple indexes per table

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Multiple policies per table

-- =====================================================
-- 2. VERIFY ADMIN ACCOUNT
-- =====================================================

-- Check if admin user exists
SELECT 
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'admin@eduptn.com';

-- Expected: 1 row with role = 'ADMIN'

-- Check admin user in public users table (if exists)
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
WHERE email = 'admin@eduptn.com';

-- If not exists, might need to sync from auth.users

-- =====================================================
-- 3. CHECK DATA COUNTS
-- =====================================================

-- Count all records in each table
SELECT 'auth.users' as table_name, COUNT(*) as record_count FROM auth.users
UNION ALL
SELECT 'user_activity', COUNT(*) FROM user_activity
UNION ALL
SELECT 'tryout_sessions', COUNT(*) FROM tryout_sessions
UNION ALL
SELECT 'practice_sessions', COUNT(*) FROM practice_sessions
UNION ALL
SELECT 'question_bank', COUNT(*) FROM question_bank
UNION ALL
SELECT 'admin_stats_cache', COUNT(*) FROM admin_stats_cache
ORDER BY table_name;

-- Shows counts for all tables

-- =====================================================
-- 4. VERIFY ACTIVITY TRACKING
-- =====================================================

-- Recent user activities (last 24 hours)
SELECT 
  ua.id,
  ua.activity_type,
  u.email,
  ua.metadata,
  ua.created_at,
  NOW() - ua.created_at as time_ago
FROM user_activity ua
JOIN auth.users u ON u.id = ua.user_id
WHERE ua.created_at > NOW() - INTERVAL '24 hours'
ORDER BY ua.created_at DESC
LIMIT 20;

-- Activity breakdown by type
SELECT 
  activity_type,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_occurrence
FROM user_activity
GROUP BY activity_type
ORDER BY count DESC;

-- Active users in last 15 minutes (for "currently online")
SELECT DISTINCT
  u.email,
  u.raw_user_meta_data->>'name' as name,
  MAX(ua.created_at) as last_activity
FROM user_activity ua
JOIN auth.users u ON u.id = ua.user_id
WHERE ua.created_at > NOW() - INTERVAL '15 minutes'
GROUP BY u.id, u.email, u.raw_user_meta_data
ORDER BY last_activity DESC;

-- =====================================================
-- 5. VERIFY TRYOUT TRACKING
-- =====================================================

-- All tryout sessions summary
SELECT 
  status,
  COUNT(*) as session_count,
  COUNT(DISTINCT user_id) as unique_students,
  AVG(score_total)::int as avg_score,
  MAX(score_total) as max_score,
  MIN(score_total) as min_score
FROM tryout_sessions
GROUP BY status
ORDER BY session_count DESC;

-- Recent completed tryouts
SELECT 
  ts.id,
  u.email,
  ts.status,
  ts.score_total,
  ts.score_tps,
  ts.score_literasi,
  ts.completed_at,
  ts.completed_at - ts.started_at as duration
FROM tryout_sessions ts
JOIN auth.users u ON u.id = ts.user_id
WHERE ts.status = 'completed'
ORDER BY ts.completed_at DESC
LIMIT 10;

-- Student with most tryouts
SELECT 
  u.email,
  u.raw_user_meta_data->>'name' as name,
  COUNT(*) as tryout_count,
  AVG(ts.score_total)::int as avg_score,
  MAX(ts.score_total) as highest_score
FROM tryout_sessions ts
JOIN auth.users u ON u.id = ts.user_id
GROUP BY u.id, u.email, u.raw_user_meta_data
ORDER BY tryout_count DESC
LIMIT 10;

-- =====================================================
-- 6. VERIFY PRACTICE TRACKING
-- =====================================================

-- Practice sessions by mapel
SELECT 
  mapel,
  COUNT(*) as session_count,
  COUNT(DISTINCT user_id) as unique_students,
  AVG(accuracy_percentage)::numeric(5,2) as avg_accuracy,
  AVG(score)::int as avg_score
FROM practice_sessions
WHERE status = 'completed'
GROUP BY mapel
ORDER BY session_count DESC;

-- Recent practice sessions
SELECT 
  ps.id,
  u.email,
  ps.mapel,
  ps.total_questions,
  ps.correct_answers,
  ps.accuracy_percentage,
  ps.completed_at
FROM practice_sessions ps
JOIN auth.users u ON u.id = ps.user_id
WHERE ps.status = 'completed'
ORDER BY ps.completed_at DESC
LIMIT 10;

-- =====================================================
-- 7. QUESTION BANK ANALYTICS
-- =====================================================

-- Questions by category
SELECT 
  mapel,
  subtest,
  tingkat,
  COUNT(*) as question_count,
  AVG(usage_count)::int as avg_usage,
  AVG(avg_correct_rate)::numeric(5,2) as avg_correct_rate
FROM question_bank
WHERE is_active = true
GROUP BY mapel, subtest, tingkat
ORDER BY mapel, subtest, tingkat;

-- Most used questions
SELECT 
  id,
  LEFT(pertanyaan, 60) || '...' as question_preview,
  mapel,
  subtest,
  tingkat,
  usage_count,
  avg_correct_rate
FROM question_bank
WHERE is_active = true
ORDER BY usage_count DESC
LIMIT 10;

-- Questions with low success rate (need review)
SELECT 
  id,
  LEFT(pertanyaan, 60) || '...' as question_preview,
  mapel,
  subtest,
  tingkat,
  usage_count,
  avg_correct_rate
FROM question_bank
WHERE is_active = true 
AND avg_correct_rate < 40
AND usage_count > 10
ORDER BY avg_correct_rate ASC
LIMIT 10;

-- =====================================================
-- 8. ADMIN DASHBOARD STATISTICS
-- =====================================================

-- Overview statistics (what admin sees)
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE raw_user_meta_data->>'role' = 'SISWA') as registered_students,
  (SELECT COUNT(DISTINCT user_id) FROM user_activity WHERE created_at > NOW() - INTERVAL '24 hours') as active_today,
  (SELECT COUNT(*) FROM tryout_sessions) as total_tryouts,
  (SELECT COUNT(*) FROM tryout_sessions WHERE status = 'completed') as completed_tryouts,
  (SELECT COUNT(*) FROM question_bank WHERE is_active = true) as active_questions,
  (SELECT COUNT(DISTINCT user_id) FROM tryout_sessions WHERE status = 'completed') as students_with_completed_tryouts;

-- Platform vs National Average comparison
WITH platform_stats AS (
  SELECT 
    AVG(score_total)::int as platform_avg_total,
    AVG(score_tps)::int as platform_avg_tps,
    AVG(score_literasi)::int as platform_avg_literasi
  FROM tryout_sessions
  WHERE status = 'completed'
  AND score_total IS NOT NULL
)
SELECT 
  platform_avg_total,
  520 as national_avg_total, -- From fallback data
  platform_avg_total - 520 as difference_total,
  platform_avg_tps,
  520 as national_avg_tps,
  platform_avg_tps - 520 as difference_tps,
  platform_avg_literasi,
  535 as national_avg_literasi,
  platform_avg_literasi - 535 as difference_literasi
FROM platform_stats;

-- =====================================================
-- 9. HOURLY ACTIVITY (FOR GRAPH)
-- =====================================================

-- User activity by hour (last 24 hours)
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_activities
FROM user_activity
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- =====================================================
-- 10. WEEKLY SCORE GROWTH (FOR GRAPH)
-- =====================================================

-- Average scores by week (last 8 weeks)
WITH weekly_scores AS (
  SELECT 
    DATE_TRUNC('week', completed_at) as week_start,
    AVG(score_total)::int as avg_total,
    AVG(score_tps)::int as avg_tps,
    AVG(score_literasi)::int as avg_literasi,
    COUNT(*) as session_count
  FROM tryout_sessions
  WHERE status = 'completed'
  AND completed_at > NOW() - INTERVAL '8 weeks'
  GROUP BY DATE_TRUNC('week', completed_at)
)
SELECT 
  week_start,
  TO_CHAR(week_start, 'Mon DD') as week_label,
  avg_total,
  avg_tps,
  avg_literasi,
  session_count
FROM weekly_scores
ORDER BY week_start;

-- =====================================================
-- 11. TROUBLESHOOTING QUERIES
-- =====================================================

-- Check for orphaned records (user_activity without user)
SELECT 
  ua.user_id,
  ua.activity_type,
  ua.created_at
FROM user_activity ua
LEFT JOIN auth.users u ON u.id = ua.user_id
WHERE u.id IS NULL
LIMIT 10;

-- Expected: 0 rows (if any, need to clean up)

-- Check for incomplete tryout sessions
SELECT 
  ts.id,
  u.email,
  ts.status,
  ts.started_at,
  NOW() - ts.started_at as time_elapsed
FROM tryout_sessions ts
JOIN auth.users u ON u.id = ts.user_id
WHERE ts.status = 'in_progress'
AND ts.started_at < NOW() - INTERVAL '3 hours'
ORDER BY ts.started_at DESC;

-- Expected: Shows abandoned sessions (can auto-mark as abandoned)

-- Check RLS is working (should only see own data as student)
SELECT current_setting('request.jwt.claims')::json->>'role' as current_role;

-- =====================================================
-- 12. PERFORMANCE CHECKS
-- =====================================================

-- Check query performance (explain analyze)
EXPLAIN ANALYZE
SELECT 
  COUNT(DISTINCT user_id)
FROM user_activity
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Should use index scan, not sequential scan

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 13. CREATE TEST DATA (IF NEEDED)
-- =====================================================

-- Insert test student users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test.student.' || generate_series || '@eduptn.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  ('{"name": "Test Student ' || generate_series || '", "role": "SISWA"}')::jsonb,
  NOW() - (generate_series || ' days')::interval,
  NOW()
FROM generate_series(1, 10)
ON CONFLICT (email) DO NOTHING;

-- Insert test login activities
INSERT INTO user_activity (user_id, activity_type, metadata, created_at)
SELECT 
  id,
  'login',
  '{}'::jsonb,
  NOW() - (random() * interval '24 hours')
FROM auth.users
WHERE email LIKE 'test.student.%@eduptn.com'
ON CONFLICT DO NOTHING;

-- Insert test tryout sessions with realistic scores
INSERT INTO tryout_sessions (
  user_id,
  tryout_id,
  status,
  started_at,
  completed_at,
  duration_minutes,
  score_total,
  score_tps,
  score_literasi
)
SELECT 
  id,
  gen_random_uuid(),
  'completed',
  NOW() - (random() * interval '30 days'),
  NOW() - (random() * interval '30 days') + interval '2 hours',
  120 + (random() * 60)::int,
  450 + (random() * 250)::int,
  450 + (random() * 250)::int,
  450 + (random() * 250)::int
FROM auth.users
WHERE email LIKE 'test.student.%@eduptn.com'
ON CONFLICT DO NOTHING;

-- Insert test practice sessions
INSERT INTO practice_sessions (
  user_id,
  mapel,
  status,
  started_at,
  completed_at,
  total_questions,
  correct_answers,
  score,
  accuracy_percentage
)
SELECT 
  id,
  (ARRAY['TPS', 'LITERASI', 'SAINTEK', 'SOSHUM'])[floor(random() * 4 + 1)],
  'completed',
  NOW() - (random() * interval '30 days'),
  NOW() - (random() * interval '30 days') + interval '30 minutes',
  20,
  (random() * 20)::int,
  (random() * 100)::int,
  (random() * 100)::numeric(5,2)
FROM auth.users
WHERE email LIKE 'test.student.%@eduptn.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 14. CLEANUP QUERIES
-- =====================================================

-- Remove test data (BE CAREFUL!)
-- Uncomment only if you want to delete test data

-- DELETE FROM user_activity WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email LIKE 'test.student.%@eduptn.com'
-- );

-- DELETE FROM tryout_sessions WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email LIKE 'test.student.%@eduptn.com'
-- );

-- DELETE FROM practice_sessions WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email LIKE 'test.student.%@eduptn.com'
-- );

-- DELETE FROM auth.users WHERE email LIKE 'test.student.%@eduptn.com';

-- =====================================================
-- 15. MONITORING QUERIES (RUN REGULARLY)
-- =====================================================

-- Daily active users trend (last 7 days)
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_activities
FROM user_activity
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Tryout completion rate by day
SELECT 
  DATE(started_at) as date,
  COUNT(*) as total_started,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  ROUND(COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric * 100, 2) as completion_rate_pct
FROM tryout_sessions
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- Average daily score trend
SELECT 
  DATE(completed_at) as date,
  COUNT(*) as tryouts_completed,
  AVG(score_total)::int as avg_score,
  AVG(score_tps)::int as avg_tps,
  AVG(score_literasi)::int as avg_literasi
FROM tryout_sessions
WHERE status = 'completed'
AND completed_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(completed_at)
ORDER BY date DESC;

-- =====================================================
-- 16. BACKUP QUERIES
-- =====================================================

-- Export user activity (for backup)
COPY (
  SELECT * FROM user_activity ORDER BY created_at DESC
) TO '/tmp/user_activity_backup.csv' CSV HEADER;

-- Export tryout sessions (for backup)
COPY (
  SELECT * FROM tryout_sessions ORDER BY created_at DESC
) TO '/tmp/tryout_sessions_backup.csv' CSV HEADER;

-- Note: Adjust paths as needed for your system

-- =====================================================
-- END OF SQL TEST QUERIES
-- =====================================================

-- For support, refer to:
-- - QUICK_SETUP_GUIDE.md
-- - ADMIN_REAL_TIME_TRACKING.md
-- - IMPLEMENTATION_CHECKLIST.md
