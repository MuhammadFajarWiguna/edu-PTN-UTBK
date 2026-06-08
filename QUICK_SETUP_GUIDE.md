# Admin Real-Time Dashboard - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Database Setup (2 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project: `ysveoqfelzwdldhzkkws`
3. Go to **SQL Editor**
4. Copy and paste the entire content of `database_migration_admin_tracking.sql`
5. Click **RUN** button
6. Wait for success message

### Step 2: Create Admin Account (1 minute)

**Option A: Via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Fill in:
   - Email: `admin@eduptn.com`
   - Password: `admin123`
4. After creating, go to **Table Editor** → **users**
5. Find the new user and edit:
   - Set `role` column to: `ADMIN`
6. Save

**Option B: Via SQL (Faster)**
```sql
-- Run this in Supabase SQL Editor
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
)
VALUES (
  'admin@eduptn.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"name":"Admin EduPTN","role":"ADMIN"}'::jsonb
);

-- Then update role in your users table
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@eduptn.com';
```

### Step 3: Install Dependencies (1 minute)

```bash
# No new dependencies needed!
# All features use existing packages:
# - @supabase/supabase-js (already installed)
# - recharts (already installed for graphs)
```

### Step 4: Update Environment Variables (30 seconds)

Your `.env` file already has everything needed! Just verify:

```bash
# Check if these exist in .env:
VITE_SUPABASE_URL="https://ysveoqfelzwdldhzkkws.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 5: Test the System (1 minute)

```bash
# 1. Start the development server
npm run dev

# 2. Open in browser: http://localhost:5173
# 3. Login as ADMIN:
#    Email: admin@eduptn.com
#    Password: admin123

# 4. You should see "ADMIN" badge in the sidebar
# 5. Click "Admin Dashboard" menu item
```

---

## 📊 How to Use Admin Dashboard

### 1. View Real-Time Statistics

**Overview Tab:**
- Total Registered Students (auto-updates)
- Active Students Today (last 24 hours)
- Total Tryouts Taken (real-time count)
- Question Bank Size
- Completed Tryouts
- National Average Comparison

### 2. Monitor Active Users

**Users Tab:**
- See all registered students
- Filter by role (SISWA, ADMIN)
- View last activity timestamp
- See which students are online now (green indicator)

### 3. Track Tryout Activity

**Tryouts Tab:**
- View all tryout sessions
- See completion rates
- Monitor in-progress tryouts
- View student scores

### 4. Analytics & Graphs

**Analytics Tab:**
- **Hourly Active Users**: Line chart showing user activity
- **Score Growth**: Student average scores over time
- **Tryout Completion Rate**: Bar chart by week
- **Practice Activity**: Heatmap of daily practice sessions

### 5. Manage Questions

**Question Bank Tab:**
- Add new questions
- Edit existing questions
- Delete questions
- Import questions from CSV/JSON
- **Auto-sync to students**: Questions automatically available in practice/tryout

### 6. View National Comparison

The dashboard automatically fetches national UTBK averages and compares with platform performance:
- Platform Average vs National Average
- TPS comparison
- Literasi comparison
- Growth trends

---

## 🎯 Key Features Explained

### Real-Time Activity Tracking

When a student:
1. **Logs in** → Activity recorded, counts as "active"
2. **Starts tryout** → Session created, admin sees it
3. **Completes tryout** → Score calculated, appears in stats
4. **Starts practice** → Session tracked
5. **Answers questions** → Progress saved

### Heartbeat System

Every 5 minutes, active users send a "heartbeat" to mark themselves as online.
- Users are considered "active" if heartbeat within last 15 minutes
- Admin dashboard shows real-time count of active users

### Auto-Refresh

Admin dashboard auto-refreshes every 30 seconds to show latest data.
You can also manually refresh by clicking the "Sync DB" button.

---

## 🧪 Testing the System

### Test Scenario 1: Track New Student

1. Open admin dashboard in Chrome
2. Open incognito window
3. Register new student account
4. Watch admin dashboard → should see:
   - Registered students count +1
   - New user appears in active users list

### Test Scenario 2: Track Tryout Completion

1. Admin dashboard open in tab 1
2. Student takes tryout in tab 2
3. Admin dashboard should show:
   - Active tryout session (in-progress)
   - When completed: updated score in statistics
   - Score growth graph updated

### Test Scenario 3: Question Management

1. Admin adds new question
2. Student starts practice session
3. New question appears in student's practice
4. No reload needed - auto-synced!

---

## 📈 Understanding the Graphs

### 1. Hourly Active Users (Line Chart)
- **X-axis**: Hours (0-23)
- **Y-axis**: Number of unique active users
- **Updates**: Every 5 minutes
- **Use Case**: See peak usage times

### 2. Score Growth (Line Chart)
- **X-axis**: Weeks
- **Y-axis**: Average score
- **Lines**: Total, TPS, Literasi
- **Updates**: After each tryout completion
- **Use Case**: Monitor student improvement

### 3. Tryout Completion Rate (Bar Chart)
- **X-axis**: Weeks
- **Y-axis**: Percentage
- **Colors**: Green = high completion, Red = low
- **Use Case**: Identify if tryouts are too difficult

### 4. Practice Activity Heatmap (Calendar View)
- **Darker colors**: More activity
- **Lighter colors**: Less activity
- **Use Case**: See which days students study most

---

## 🔧 Troubleshooting

### Problem: "Registered Students" shows 0

**Solution:**
1. Check if database migration ran successfully
2. Verify RLS policies are set correctly
3. Run this SQL to check:
```sql
SELECT COUNT(*) FROM auth.users;
```

### Problem: Active users always shows 0

**Solution:**
1. Make sure activity tracking is integrated in App.jsx
2. Check browser console for errors
3. Verify Supabase connection:
```javascript
console.log(supabase.auth.getSession());
```

### Problem: Graphs show no data

**Solution:**
1. Need actual student activity first
2. Create test data:
```sql
-- Insert sample tryout session
INSERT INTO tryout_sessions (user_id, tryout_id, status, score_total, score_tps, score_literasi, completed_at)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  uuid_generate_v4(),
  'completed',
  620,
  610,
  630,
  NOW()
);
```

### Problem: Can't see Admin Dashboard menu

**Solution:**
1. Verify user role is set to 'ADMIN':
```sql
SELECT email, role FROM users WHERE email = 'admin@eduptn.com';
```
2. Should return role = 'ADMIN'
3. If not, update:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@eduptn.com';
```

---

## 🎨 Customization

### Change Refresh Interval

In `AdminDashboardView.jsx`:
```javascript
// Change from 30 seconds to 10 seconds
useEffect(() => {
  const interval = setInterval(() => {
    loadAdminData();
  }, 10000); // 10 seconds instead of 30000
  
  return () => clearInterval(interval);
}, []);
```

### Add Custom Metric

1. Create new function in `adminDashboardAPI.js`:
```javascript
export async function getCustomMetric() {
  const { data, error } = await supabase
    .from('your_table')
    .select('*');
  
  return data.length;
}
```

2. Add to dashboard in `AdminDashboardView.jsx`:
```javascript
const [customMetric, setCustomMetric] = useState(0);

useEffect(() => {
  getCustomMetric().then(setCustomMetric);
}, []);
```

### Change Graph Colors

In `AdminDashboardView.jsx`, find the chart component:
```javascript
<Line 
  dataKey="avg_total" 
  stroke="#14b8a6"  // Change this color
  strokeWidth={3}
/>
```

---

## 📱 Mobile Responsive

The admin dashboard is fully responsive:
- **Desktop**: Full layout with sidebar
- **Tablet**: Stacked layout
- **Mobile**: Hamburger menu, scrollable cards

---

## 🔐 Security Best Practices

### 1. Change Default Admin Password
```sql
-- Update admin password to something secure
UPDATE auth.users 
SET encrypted_password = crypt('your-secure-password', gen_salt('bf'))
WHERE email = 'admin@eduptn.com';
```

### 2. Enable Rate Limiting

In Supabase dashboard:
1. Go to **Settings** → **API**
2. Enable rate limiting
3. Set to: 60 requests/minute for authenticated users

### 3. Review RLS Policies

Ensure only admins can access sensitive data:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'user_activity';
```

---

## 🚀 Performance Optimization

### 1. Enable Database Indexes

Already created in migration, but verify:
```sql
-- Check indexes exist
SELECT * FROM pg_indexes WHERE tablename IN (
  'user_activity',
  'tryout_sessions',
  'practice_sessions'
);
```

### 2. Use Materialized Views

For expensive queries, create materialized views:
```sql
CREATE MATERIALIZED VIEW admin_daily_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE activity_type = 'tryout_complete') as tryouts
FROM user_activity
GROUP BY DATE(created_at);

-- Refresh daily via cron
```

### 3. Enable Supabase Caching

In Supabase dashboard:
1. Go to **Settings** → **API**
2. Enable response caching
3. Set cache TTL to 30 seconds for admin endpoints

---

## 📊 Export Reports

### Export to CSV

Add export button in `AdminDashboardView.jsx`:
```javascript
const exportToCSV = async () => {
  const { data } = await supabase
    .from('tryout_sessions')
    .select('*')
    .csv();
  
  // Download CSV file
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tryout_sessions.csv';
  a.click();
};
```

---

## 🆘 Support

If you encounter issues:

1. **Check browser console** for JavaScript errors
2. **Check Supabase logs**: Dashboard → Logs → API logs
3. **Verify database**: Run sample queries in SQL Editor
4. **Test API endpoints**: Use Postman or curl

### Useful SQL Queries for Debugging:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count records in each table
SELECT 'user_activity' as table, COUNT(*) FROM user_activity
UNION ALL
SELECT 'tryout_sessions', COUNT(*) FROM tryout_sessions
UNION ALL
SELECT 'practice_sessions', COUNT(*) FROM practice_sessions;

-- View recent activities
SELECT * FROM user_activity 
ORDER BY created_at DESC 
LIMIT 10;

-- Check admin user
SELECT email, role, created_at 
FROM users 
WHERE role = 'ADMIN';
```

---

## ✅ Success Checklist

- [ ] Database tables created successfully
- [ ] Admin user created with role = 'ADMIN'
- [ ] Can login as admin@eduptn.com
- [ ] Admin Dashboard menu item visible
- [ ] Overview tab shows statistics
- [ ] Can view registered students list
- [ ] Graphs render without errors
- [ ] Can add new question
- [ ] Activity tracking working (check user_activity table)
- [ ] National average comparison showing data

---

## 🎉 You're All Set!

Your admin dashboard is now fully functional with:
✅ Real-time student tracking
✅ Tryout completion monitoring
✅ Question bank management
✅ National average integration
✅ Score growth analytics
✅ Active user monitoring

**Next Steps:**
1. Customize the dashboard to your needs
2. Add more test data for realistic graphs
3. Share admin credentials with your team
4. Set up automated daily reports (optional)

**Need Help?** Check the detailed documentation in `ADMIN_REAL_TIME_TRACKING.md`
