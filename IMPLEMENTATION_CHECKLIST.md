# Admin Dashboard Implementation Checklist

Complete this checklist to implement the full admin real-time tracking system.

---

## 📋 Phase 1: Database Setup (15 minutes)

### Step 1.1: Run Database Migration
- [ ] Open Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Navigate to your project: `ysveoqfelzwdldhzkkws`
- [ ] Go to **SQL Editor**
- [ ] Open file: `database_migration_admin_tracking.sql`
- [ ] Copy entire contents
- [ ] Paste into Supabase SQL Editor
- [ ] Click **RUN** button
- [ ] Wait for success message
- [ ] Verify tables created: Run `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

### Step 1.2: Verify Tables
Run this query to confirm:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_activity',
  'tryout_sessions',
  'practice_sessions',
  'question_bank',
  'admin_stats_cache'
);
```
- [ ] All 5 tables appear in results

### Step 1.3: Check Indexes
```sql
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE '%activity%';
```
- [ ] Multiple indexes exist for performance

### Step 1.4: Verify RLS Policies
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```
- [ ] Policies exist for each table

---

## 👤 Phase 2: Create Admin Account (5 minutes)

### Option A: Via Supabase Dashboard (Recommended)
- [ ] Go to **Authentication** → **Users**
- [ ] Click **Add User** or **Invite User**
- [ ] Enter:
  - Email: `admin@eduptn.com`
  - Password: `admin123` (change later!)
  - Check "Email Confirmed"
- [ ] Click **Create User**
- [ ] Note the user ID
- [ ] Go to **Table Editor** → **auth.users**
- [ ] Find the new user
- [ ] Update `raw_user_meta_data` field:
  ```json
  {"name": "Admin EduPTN", "role": "ADMIN"}
  ```
- [ ] Save

### Option B: Via SQL Query (Faster)
```sql
-- Create admin user
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
  'admin@eduptn.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"name": "Admin EduPTN", "role": "ADMIN"}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@eduptn.com'
);
```
- [ ] Query executed successfully
- [ ] No errors returned

### Verify Admin Account
```sql
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'admin@eduptn.com';
```
- [ ] Returns: `admin@eduptn.com` with role `ADMIN`

---

## 📁 Phase 3: Frontend Files (10 minutes)

### Step 3.1: Verify New Files Exist
Check these files were created:
- [ ] `src/utils/activityTracker.js`
- [ ] `src/utils/utbkNationalAPI.js`
- [ ] `src/utils/adminDashboardAPI.js`
- [ ] `database_migration_admin_tracking.sql`
- [ ] `ADMIN_REAL_TIME_TRACKING.md`
- [ ] `QUICK_SETUP_GUIDE.md`
- [ ] `IMPLEMENTATION_SUMMARY.md`
- [ ] `ADMIN_DASHBOARD_VISUAL_GUIDE.md`
- [ ] `IMPLEMENTATION_CHECKLIST.md` (this file)

### Step 3.2: Check Existing Dependencies
Run in terminal:
```bash
npm list @supabase/supabase-js recharts
```
- [ ] Both packages are installed
- [ ] If not, run: `npm install @supabase/supabase-js recharts`

### Step 3.3: Verify Environment Variables
Check `.env` file has:
- [ ] `VITE_SUPABASE_URL="https://ysveoqfelzwdldhzkkws.supabase.co"`
- [ ] `VITE_SUPABASE_ANON_KEY="eyJhbGci..."`
- [ ] Both values match your Supabase project

---

## 🔗 Phase 4: Integration (20 minutes)

### Step 4.1: Update App.jsx
Add activity tracking on login/logout:

```javascript
// At top of file
import { activityTracker } from './utils/activityTracker';

// After user login (in handleAuthSuccess or similar)
useEffect(() => {
  if (user) {
    activityTracker.startTracking(user.id);
  }
  return () => {
    if (user) {
      activityTracker.stopTracking(user.id);
    }
  };
}, [user]);

// In logout handler
const handleLogout = async () => {
  if (user) {
    await activityTracker.stopTracking(user.id);
  }
  await apiService.logout();
  setUser(null);
};
```

- [ ] activityTracker imported
- [ ] startTracking called on login
- [ ] stopTracking called on logout
- [ ] No TypeScript/JavaScript errors

### Step 4.2: Update TryoutView.jsx
Add tryout tracking:

```javascript
// At top
import { activityTracker } from '../utils/activityTracker';

// In handleStartExam function
const handleStartExam = async (tryout) => {
  await activityTracker.trackTryoutStart(user.id, tryout.id, tryout.judul);
  // ... existing code
};

// In handleSubmitTryout function (after score calculated)
const handleSubmitTryout = async (result) => {
  // ... existing scoring code
  await activityTracker.trackTryoutComplete(user.id, tryoutId, result);
  // ... rest of code
};
```

- [ ] activityTracker imported
- [ ] trackTryoutStart called
- [ ] trackTryoutComplete called
- [ ] No errors

### Step 4.3: Update LatihanView.jsx
Add practice tracking:

```javascript
// At top
import { activityTracker } from '../utils/activityTracker';

// In handleStartPractice
const handleStartPractice = async (mapel) => {
  await activityTracker.trackPracticeStart(user.id, mapel);
  // ... existing code
};

// In handleSubmitPractice
const handleSubmitPractice = async (answers) => {
  // ... calculate score
  await activityTracker.trackPracticeComplete(user.id, mapel, score, correct, total);
  // ... rest of code
};
```

- [ ] activityTracker imported
- [ ] trackPracticeStart called
- [ ] trackPracticeComplete called
- [ ] No errors

### Step 4.4: Update AdminDashboardView.jsx
Add real-time data fetching:

```javascript
// At top
import { getDashboardStats, subscribeToDashboardUpdates } from '../utils/adminDashboardAPI';
import { getNationalUTBKAverage } from '../utils/utbkNationalAPI';

// Add state for real-time stats
const [realTimeStats, setRealTimeStats] = useState(null);
const [nationalAvg, setNationalAvg] = useState(null);

// Load stats on mount
useEffect(() => {
  const loadStats = async () => {
    const stats = await getDashboardStats();
    setRealTimeStats(stats);
    
    const national = await getNationalUTBKAverage();
    setNationalAvg(national);
  };
  
  loadStats();
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(loadStats, 30000);
  return () => clearInterval(interval);
}, []);

// Subscribe to real-time updates
useEffect(() => {
  const unsubscribe = subscribeToDashboardUpdates((updateType) => {
    console.log('Dashboard update:', updateType);
    getDashboardStats().then(setRealTimeStats);
  });
  
  return unsubscribe;
}, []);
```

- [ ] Imports added
- [ ] State variables created
- [ ] useEffect hooks added
- [ ] Auto-refresh working
- [ ] Real-time updates working

---

## 🧪 Phase 5: Testing (15 minutes)

### Test 1: Database Connection
```sql
-- Should return some rows
SELECT * FROM user_activity ORDER BY created_at DESC LIMIT 5;
```
- [ ] Query executes without errors
- [ ] Returns data (or empty array if no activity yet)

### Test 2: Admin Login
1. Open browser: `http://localhost:5173`
2. Login with:
   - Email: `admin@eduptn.com`
   - Password: `admin123`
3. Check:
   - [ ] Login successful
   - [ ] No console errors
   - [ ] Dashboard loads
   - [ ] "ADMIN" badge visible in UI

### Test 3: Admin Dashboard Access
1. Look for "Admin Dashboard" menu item
2. Click it
3. Check:
   - [ ] Admin dashboard loads
   - [ ] Statistics cards display
   - [ ] No JavaScript errors in console
   - [ ] "Sync DB" button visible

### Test 4: Activity Tracking
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform actions:
   - [ ] Login → Check network for activity insert
   - [ ] Navigate pages → Check for heartbeat
4. Verify in database:
```sql
SELECT activity_type, COUNT(*) 
FROM user_activity 
GROUP BY activity_type;
```
- [ ] See login activity
- [ ] See heartbeat activity

### Test 5: Real-Time Updates
1. Open admin dashboard in Chrome
2. Open incognito window
3. Login as student in incognito
4. Check admin dashboard:
   - [ ] Active users count increases
   - [ ] New user appears in active list
5. Take tryout in incognito:
   - [ ] Total tryouts count increases in admin dashboard

### Test 6: Graphs Rendering
In admin dashboard, check:
- [ ] Hourly Active Users graph renders
- [ ] Score Growth graph renders
- [ ] Tryout Completion Rate chart renders
- [ ] Practice Activity Heatmap renders
- [ ] No "undefined" or "NaN" in graphs
- [ ] Axes labeled correctly

### Test 7: National Average
In admin dashboard:
- [ ] National average comparison section visible
- [ ] Shows platform average
- [ ] Shows national average
- [ ] Shows difference/comparison
- [ ] Data looks reasonable (400-800 score range)

---

## 🐛 Phase 6: Troubleshooting

### Problem: Can't login as admin
**Solutions to try:**
1. [ ] Check admin user exists:
   ```sql
   SELECT * FROM auth.users WHERE email = 'admin@eduptn.com';
   ```
2. [ ] Check password is correct (try resetting)
3. [ ] Check email is confirmed
4. [ ] Clear browser cache and cookies

### Problem: Admin dashboard not visible
**Solutions to try:**
1. [ ] Verify user role:
   ```sql
   SELECT raw_user_meta_data->>'role' FROM auth.users WHERE email = 'admin@eduptn.com';
   ```
2. [ ] Should return "ADMIN"
3. [ ] Update if needed:
   ```sql
   UPDATE auth.users SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"ADMIN"') WHERE email = 'admin@eduptn.com';
   ```
4. [ ] Logout and login again

### Problem: Statistics show 0
**Solutions to try:**
1. [ ] Check tables have data:
   ```sql
   SELECT COUNT(*) FROM user_activity;
   SELECT COUNT(*) FROM tryout_sessions;
   ```
2. [ ] Create test data if empty (see test data scripts in docs)
3. [ ] Check RLS policies allow admin to see data
4. [ ] Check browser console for errors

### Problem: Graphs not rendering
**Solutions to try:**
1. [ ] Check recharts is installed: `npm list recharts`
2. [ ] Check browser console for errors
3. [ ] Verify data format in `adminDashboardAPI.js` functions
4. [ ] Check React DevTools for component errors

### Problem: Real-time updates not working
**Solutions to try:**
1. [ ] Check Supabase Realtime is enabled (Settings → API → Realtime)
2. [ ] Check browser console for WebSocket errors
3. [ ] Verify subscription code in AdminDashboardView.jsx
4. [ ] Test manual refresh button works

---

## 📊 Phase 7: Add Test Data (Optional - 10 minutes)

### Create Test Students
```sql
-- Insert 5 test students
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'student' || generate_series || '@test.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  ('{"name": "Test Student ' || generate_series || '", "role": "SISWA"}')::jsonb,
  NOW() - (generate_series || ' days')::interval,
  NOW()
FROM generate_series(1, 5);
```
- [ ] 5 test students created

### Create Test Activity
```sql
-- Insert test login activities
INSERT INTO user_activity (user_id, activity_type, metadata, created_at)
SELECT 
  id,
  'login',
  '{}'::jsonb,
  NOW() - (random() * interval '24 hours')
FROM auth.users
WHERE email LIKE 'student%@test.com';
```
- [ ] Test activities created

### Create Test Tryout Sessions
```sql
-- Insert test tryout sessions
INSERT INTO tryout_sessions (user_id, tryout_id, status, started_at, completed_at, score_total, score_tps, score_literasi)
SELECT 
  id,
  gen_random_uuid(),
  'completed',
  NOW() - (random() * interval '7 days'),
  NOW() - (random() * interval '7 days') + interval '2 hours',
  400 + (random() * 300)::int,
  400 + (random() * 300)::int,
  400 + (random() * 300)::int
FROM auth.users
WHERE email LIKE 'student%@test.com';
```
- [ ] Test tryout sessions created

### Verify Test Data
```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE 'student%@test.com') as students,
  (SELECT COUNT(*) FROM user_activity) as activities,
  (SELECT COUNT(*) FROM tryout_sessions) as sessions;
```
- [ ] Shows counts for all test data

---

## ✅ Phase 8: Final Verification

### Dashboard Metrics
Log in as admin and verify:
- [ ] Registered Students: Shows correct count
- [ ] Active Students: Shows users from last 24h
- [ ] Total Tryouts: Shows all sessions
- [ ] Question Bank: Shows question count
- [ ] Completed Tryouts: Shows finished sessions
- [ ] Completion Rate: Shows percentage

### Graphs
- [ ] Hourly Active Users: Shows line chart with data
- [ ] Score Growth: Shows multi-line trend
- [ ] Tryout Completion Rate: Shows bar chart
- [ ] Practice Activity Heatmap: Shows calendar view

### National Average
- [ ] Platform average displayed
- [ ] National average displayed
- [ ] Comparison shown
- [ ] Difference calculated correctly

### Real-Time Features
- [ ] Auto-refresh works (every 30 seconds)
- [ ] Manual refresh button works
- [ ] WebSocket updates trigger refresh
- [ ] No console errors during updates

---

## 🎉 Phase 9: Production Readiness

### Security
- [ ] Change admin password from default
- [ ] Enable rate limiting in Supabase
- [ ] Review RLS policies
- [ ] Set up API key rotation
- [ ] Configure CORS properly

### Performance
- [ ] Database indexes created
- [ ] Query performance tested
- [ ] Frontend lazy loading implemented
- [ ] Caching configured

### Monitoring
- [ ] Supabase logs reviewed
- [ ] Error tracking set up (optional: Sentry)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured

### Documentation
- [ ] Admin credentials documented (securely)
- [ ] Runbook created for common tasks
- [ ] Backup procedures documented
- [ ] Recovery procedures tested

---

## 🚀 Phase 10: Launch

### Pre-Launch
- [ ] All checklist items completed
- [ ] Admin can login
- [ ] Dashboard displays correctly
- [ ] Real-time updates working
- [ ] No console errors
- [ ] Mobile responsive works
- [ ] All graphs render

### Launch
- [ ] Deploy to production
- [ ] Verify production admin account
- [ ] Test production dashboard
- [ ] Monitor for first 24 hours
- [ ] Collect feedback from users

### Post-Launch
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Review user adoption
- [ ] Plan feature improvements
- [ ] Schedule regular backups

---

## 📞 Support

If you get stuck:
1. ✅ Check this checklist again
2. ✅ Read `QUICK_SETUP_GUIDE.md`
3. ✅ Review `ADMIN_REAL_TIME_TRACKING.md`
4. ✅ Check Supabase logs
5. ✅ Review browser console errors

---

## 🎯 Success Criteria

You've successfully implemented the system when:
- ✅ Admin can login with admin@eduptn.com
- ✅ Admin dashboard loads without errors
- ✅ All statistics display real data
- ✅ Graphs render correctly
- ✅ Real-time updates work
- ✅ Activity tracking logs user actions
- ✅ National average comparison works
- ✅ Question bank management functional
- ✅ Mobile responsive design works
- ✅ No console errors in production

---

**Congratulations! Your admin real-time dashboard is now fully functional! 🎉**

Next steps:
- Customize dashboard to your needs
- Add more test data for realistic graphs
- Train other admins on the system
- Monitor usage and gather feedback
- Plan Phase 2 features (advanced analytics, ML predictions, etc.)
