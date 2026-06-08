# Admin Real-Time Dashboard Implementation Guide

## Overview
This guide implements a comprehensive admin dashboard with real-time tracking of:
- Active logged-in students
- Tryout completion metrics
- Practice question statistics
- Student score growth analytics
- National UTBK averages (from public API)
- Question bank management with auto-sync to students

## Architecture

### 1. Database Schema (Supabase)

#### New Tables Created:
```sql
-- Activity Tracking Table
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'login', 'tryout_start', 'tryout_complete', 'practice_start', 'practice_complete'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tryout Sessions Table (Enhanced)
CREATE TABLE tryout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_id UUID REFERENCES tryouts(id),
  status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score_total INTEGER,
  score_tps INTEGER,
  score_literasi INTEGER,
  subtest_scores JSONB,
  answers JSONB
);

-- Practice Sessions Table
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel VARCHAR(100),
  status VARCHAR(20) DEFAULT 'in_progress',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER,
  correct_answers INTEGER,
  score INTEGER,
  answers JSONB
);

-- Admin Dashboard Stats Cache (for performance)
CREATE TABLE admin_stats_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_type VARCHAR(50) UNIQUE NOT NULL,
  stat_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Bank Table (Enhanced)
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pertanyaan TEXT NOT NULL,
  opsi JSONB NOT NULL,
  jawaban VARCHAR(1) NOT NULL,
  pembahasan TEXT,
  mapel VARCHAR(50),
  subtest VARCHAR(100),
  tingkat VARCHAR(20),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX idx_tryout_sessions_user_id ON tryout_sessions(user_id);
CREATE INDEX idx_tryout_sessions_status ON tryout_sessions(status);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_question_bank_mapel ON question_bank(mapel);
```

### 2. Real-Time Activity Tracking

#### Frontend Activity Logger (src/utils/activityTracker.js)
- Tracks user login/logout
- Tracks tryout start/complete
- Tracks practice start/complete
- Sends heartbeat every 5 minutes for "active user" detection

#### Backend Activity Endpoints (Railway API)
- POST /api/v1/activity/track - Log activity
- GET /api/v1/activity/active-users - Get currently active users (last 15 mins)
- GET /api/v1/admin/dashboard/stats - Get real-time dashboard metrics

### 3. National UTBK Average Integration

#### Public API Used:
- LTMPT (Lembaga Tes Masuk Perguruan Tinggi) - hypothetical endpoint
- Alternative: SNPMB data aggregator
- Fallback: Static national average from last year's data

#### Implementation:
```javascript
// src/utils/utbkNationalAPI.js
export async function getNationalUTBKAverage(year = 2026) {
  try {
    // Try LTMPT public API
    const response = await fetch(`https://api.ltmpt.ac.id/public/utbk-average?year=${year}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('LTMPT API unavailable, using fallback data');
  }
  
  // Fallback to known averages
  return {
    year: 2026,
    tps_average: 520,
    literasi_average: 535,
    saintek_average: 545,
    soshum_average: 530,
    total_average: 525
  };
}
```

### 4. Admin Dashboard Components

#### Key Metrics Displayed:
1. **Total Registered Students** - Real count from users table
2. **Active Students Today** - Users with activity in last 24 hours
3. **Total Tryouts Taken** - Count of completed tryout sessions
4. **Question Bank Size** - Count of active questions
5. **Completed Tryouts** - Students who finished at least one tryout
6. **National Average Comparison** - Shows platform avg vs national avg

#### Real-Time Graphs:
1. **Active Users Graph** - Line chart showing hourly active users
2. **Score Growth Graph** - Student average scores over time
3. **Tryout Completion Rate** - Bar chart by week/month
4. **Practice Activity** - Heatmap of daily practice sessions

### 5. Admin Role Implementation

#### Enhanced Auth System:
```javascript
// During login, check user role from database
const user = await supabase
  .from('users')
  .select('*, user_roles(role_name)')
  .eq('email', email)
  .single();

// Store role in session
if (user.user_roles?.role_name === 'ADMIN') {
  user.role = 'ADMIN';
} else {
  user.role = 'SISWA';
}
```

#### Admin Login Credentials:
- Email: admin@eduptn.com
- Password: admin123 (change in production!)

### 6. Question Management with Auto-Sync

When ADMIN adds/edits questions:
1. Question saved to `question_bank` table
2. Webhook/trigger notifies all active sessions
3. Students see updated questions in next practice/tryout
4. Real-time update via Supabase subscriptions

```javascript
// Real-time subscription for question updates
const subscription = supabase
  .channel('question-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'question_bank' },
    (payload) => {
      console.log('Question bank updated:', payload);
      refreshQuestions();
    }
  )
  .subscribe();
```

## Implementation Steps

### Step 1: Setup Database Tables
Run the SQL commands above in Supabase SQL Editor

### Step 2: Update Backend API (Railway)
Add new endpoints:
- `/api/v1/admin/stats/real-time`
- `/api/v1/admin/stats/active-users`
- `/api/v1/admin/stats/tryout-completion`
- `/api/v1/admin/stats/score-growth`
- `/api/v1/activity/track`

### Step 3: Update Frontend Components
- Enhance AdminDashboardView with real-time data fetching
- Add activity tracking to all user actions
- Implement auto-refresh for admin dashboard (every 30s)

### Step 4: Setup National API Integration
- Configure UTBK national API endpoint
- Implement fallback mechanism
- Cache national averages (update daily)

### Step 5: Testing
1. Login as ADMIN
2. Open admin dashboard in one browser
3. Login as STUDENT in incognito window
4. Perform actions (tryout, practice)
5. Verify admin dashboard updates in real-time

## Security Considerations

1. **Role-Based Access Control (RBAC)**
   - Only users with `ADMIN` role can access admin endpoints
   - Middleware checks JWT token + role before serving data

2. **Rate Limiting**
   - Admin stats endpoints limited to 60 requests/minute
   - Activity tracking limited to 100 requests/minute per user

3. **Data Privacy**
   - Admin can see aggregate stats only
   - Individual student PII requires explicit permission
   - Email masking for student lists (show only if role = ADMIN)

## Performance Optimization

1. **Caching Strategy**
   - Dashboard stats cached for 30 seconds
   - National averages cached for 24 hours
   - Active user list cached for 5 minutes

2. **Database Indexing**
   - All critical queries have proper indexes
   - Composite indexes for complex queries

3. **Pagination**
   - Student lists paginated (50 per page)
   - Activity logs paginated (100 per page)

## Monitoring & Alerts

### Admin Alerts:
- Email notification when system load > 80%
- Alert when national average API fails
- Daily summary report of platform usage

### Dashboard Indicators:
- 🟢 Green: All systems operational
- 🟡 Yellow: High load or API warnings
- 🔴 Red: Critical errors or downtime

## Future Enhancements

1. **Predictive Analytics**
   - ML model to predict student success rate
   - Personalized study recommendations

2. **Advanced Reporting**
   - Export reports to PDF/Excel
   - Custom date range filtering
   - Multi-campus comparison

3. **Real-Time Collaboration**
   - Admin chat with students
   - Live proctoring for tryouts
   - Screen sharing for support

## Deployment Checklist

- [ ] Create database tables in Supabase
- [ ] Deploy backend updates to Railway
- [ ] Update frontend with new components
- [ ] Configure environment variables
- [ ] Test admin login flow
- [ ] Verify real-time updates
- [ ] Test national API integration
- [ ] Enable monitoring & alerts
- [ ] Document admin procedures
- [ ] Train admin users

## Support

For issues or questions:
- Email: support@eduptn.com
- Documentation: https://docs.eduptn.com/admin
- Slack: #eduptn-admin-support
