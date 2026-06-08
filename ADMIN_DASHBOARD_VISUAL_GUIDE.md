# Admin Dashboard - Visual Feature Guide

## 🎨 Dashboard Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  🎓 EduPTN Admin Dashboard              [Sync DB] [👤 Admin]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 👥 245   │  │ 🔥 180   │  │ 📝 1,234 │  │ 📊 890   │        │
│  │ Students │  │ Active   │  │ Tryouts  │  │ Questions│        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📈 Hourly Active Users (Last 24 Hours)                │    │
│  │     ╱╲                                                  │    │
│  │    ╱  ╲    ╱╲                                          │    │
│  │   ╱    ╲  ╱  ╲  ╱╲                                     │    │
│  │  ╱      ╲╱    ╲╱  ╲                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  🎯 Score Growth Trend (8 Weeks)                        │    │
│  │  ━━━ Platform Avg    ━ ━ National Avg                  │    │
│  │                     ━━━━━╱                              │    │
│  │              ━━━━━━╱                                    │    │
│  │       ━━━━━╱                                            │    │
│  │  ━━━━╱                                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Overview Tab - Key Metrics

### Top Row Cards (KPIs)

```
╔═══════════════════╗  ╔═══════════════════╗  ╔═══════════════════╗
║  👥 REGISTERED    ║  ║  🔥 ACTIVE TODAY  ║  ║  📝 TOTAL TRYOUTS ║
║     STUDENTS      ║  ║                    ║  ║                    ║
║                    ║  ║                    ║  ║                    ║
║      245          ║  ║       180         ║  ║      1,234        ║
║  ───────────────  ║  ║  ───────────────  ║  ║  ───────────────  ║
║  ↗ +12 this week  ║  ║  ↗ 75% of total   ║  ║  ↗ +45 today      ║
╚═══════════════════╝  ╚═══════════════════╝  ╚═══════════════════╝

╔═══════════════════╗  ╔═══════════════════╗  ╔═══════════════════╗
║  📊 QUESTION BANK ║  ║  ✅ COMPLETED     ║  ║  📈 COMPLETION    ║
║                    ║  ║     TRYOUTS       ║  ║     RATE          ║
║                    ║  ║                    ║  ║                    ║
║      890          ║  ║       890         ║  ║       72%         ║
║  ───────────────  ║  ║  ───────────────  ║  ║  ───────────────  ║
║  ↗ +23 added     ║  ║  ↗ 721 students   ║  ║  ↗ +3% vs last    ║
╚═══════════════════╝  ╚═══════════════════╝  ╚═══════════════════╝
```

**What Each Card Shows:**
1. **Registered Students**: Total count from auth.users table
2. **Active Today**: Users with activity in last 24 hours
3. **Total Tryouts**: All tryout attempts (completed + in-progress)
4. **Question Bank**: Active questions available for use
5. **Completed Tryouts**: Finished tryout sessions
6. **Completion Rate**: Percentage of started tryouts that finished

---

## 📊 National Average Comparison

```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Platform vs National UTBK Average                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Platform Average:   545  ━━━━━━━━━━━━━━━━━━━━━ 🎯         │
│  National Average:   525  ━━━━━━━━━━━━━━━━━━              │
│                                                               │
│  Difference: +20 points (↗ 3.8% above national)             │
│                                                               │
│  ┌────────────────────────────────────────────────┐         │
│  │  TPS:        540  vs  520  (↗ +20)             │         │
│  │  Literasi:   550  vs  535  (↗ +15)             │         │
│  │  Saintek:    545  vs  545  (━ same)            │         │
│  │  Soshum:     530  vs  530  (━ same)            │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  📊 Your students perform above the national average!       │
└─────────────────────────────────────────────────────────────┘
```

**Color Coding:**
- 🟢 Green: Above national average
- 🟡 Yellow: At national average
- 🔴 Red: Below national average

---

## 📈 Hourly Active Users Graph

```
Users
 │
50 │              ╱╲
   │             ╱  ╲
40 │            ╱    ╲        ╱╲
   │           ╱      ╲      ╱  ╲
30 │          ╱        ╲    ╱    ╲
   │         ╱          ╲  ╱      ╲
20 │        ╱            ╲╱        ╲
   │       ╱                        ╲     ╱╲
10 │      ╱                          ╲   ╱  ╲
   │  ───╱                            ╲─╱    ╲
 0 └────────────────────────────────────────────→ Time
    00:00   06:00   12:00   18:00   24:00

Peak Hours:
  🔥 18:00-20:00 (Evening study time)
  🔥 13:00-15:00 (Afternoon break)
  
Low Activity:
  😴 01:00-05:00 (Late night)
```

**Insights:**
- Peak usage during evening study hours
- Lunchtime spike for quick practice
- Low overnight activity (as expected)

---

## 🎯 Score Growth Trend (Multi-Line)

```
Score
 │
700│                           ━━━━━╱   ← Platform Avg
   │                    ━━━━━━╱
650│             ━━━━━━╱
   │      ━━━━━━╱
600│ ━━━━╱
   │                  • • • • • •       ← National Avg
550│            • • • •
   │      • • • •
500│ • • • •
   │
   └────────────────────────────────────────→ Time
     W1   W2   W3   W4   W5   W6   W7   W8

Legend:
  ━━━  Platform Average (Solid Blue)
  • • •  National Average (Dotted Gray)
  
Trend: ↗ +15 points per week
Status: 🎉 Above national average since Week 3
```

**What This Shows:**
- Student improvement over time
- Comparison with national benchmark
- Effectiveness of study materials

---

## 📊 Tryout Completion Rate (Bar Chart)

```
Rate
 │
100%│
    │
 80%│ ████    ████          ████    ████
    │ ████    ████    ████  ████    ████
 60%│ ████    ████    ████  ████    ████
    │ ████    ████    ████  ████    ████
 40%│ ████    ████    ████  ████    ████
    │ ████    ████    ████  ████    ████
 20%│ ████    ████    ████  ████    ████
    │ ████    ████    ████  ████    ████
  0%└─────────────────────────────────────→ Time
     W1      W2      W3      W4      W5

Week 1: 75% (Good)       🟢
Week 2: 82% (Excellent)  🟢
Week 3: 68% (Moderate)   🟡
Week 4: 79% (Good)       🟢
Week 5: 81% (Excellent)  🟢

Average: 77% completion rate
```

**Interpretation:**
- 🟢 Green (>75%): High engagement
- 🟡 Yellow (60-75%): Moderate engagement
- 🔴 Red (<60%): Low engagement - investigate

---

## 🔥 Practice Activity Heatmap

```
    Mon  Tue  Wed  Thu  Fri  Sat  Sun
W1  🟢   🟢   🟡   🟢   🟢   🟣   🟡
W2  🟢   🟣   🟢   🟢   🟣   🟣   🟡
W3  🟡   🟢   🟢   🟣   🟢   🟣   ⚪
W4  🟢   🟢   🟡   🟢   🟢   🟣   🟡

Color Legend:
🟣 Dark Purple  = 40+ sessions (Very High)
🟢 Green        = 20-39 sessions (High)
🟡 Yellow       = 10-19 sessions (Moderate)
⚪ White        = 0-9 sessions (Low)

Insights:
✅ High activity on weekdays
🔥 Peak on Thu-Sat
😴 Lower on Sundays
```

**What This Tells You:**
- Best days for scheduled events
- When students are most active
- Potential for targeted reminders on low days

---

## 👥 Active Users List

```
┌─────────────────────────────────────────────────────────────┐
│  🟢 Currently Active Students (15 users online now)         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🟢 Ahmad Rivaldi          Last: 2 mins ago    [View Stats]  │
│     ahmad.rivaldi@gmail.com                                  │
│     Taking: Tryout Akbar #5 (In Progress)                   │
│                                                               │
│  🟢 Sarah Azzahra          Last: 5 mins ago    [View Stats]  │
│     sarah.azzahra@outlook.com                                │
│     Practicing: Penalaran Umum (7/20 questions)             │
│                                                               │
│  🟢 Budi Santoso           Last: 12 mins ago   [View Stats]  │
│     budi.santoso@yahoo.com                                   │
│     Browsing: Materi Belajar                                │
│                                                               │
│  🟡 Clara Angelica         Last: 18 mins ago   [View Stats]  │
│     clara.angelica@gmail.com                                 │
│     Idle: Dashboard View                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Status Indicators:
🟢 Green  = Active (< 5 mins)
🟡 Yellow = Recent (5-15 mins)
⚪ Gray   = Idle (> 15 mins)
```

---

## 📝 Question Bank Management

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Question Bank Manager                    [+ Add New]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Search: [_______________] 🔍    Filter: [TPS ▾] [All ▾]     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Q1234 | TPS - Penalaran Umum          [Edit] [Del]  │   │
│  │  "Jika semua A adalah B, dan semua B adalah..."      │   │
│  │  ⭐ Used: 234 times  ✅ Correct: 68%  🏷️ Sulit       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Q1235 | Literasi - Bahasa Indonesia  [Edit] [Del]   │   │
│  │  "Bacaan berikut digunakan untuk menjawab soal..."   │   │
│  │  ⭐ Used: 189 times  ✅ Correct: 72%  🏷️ Sedang      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Bulk Actions: [Import CSV] [Export All] [Archive Old]      │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Analytics per Question:
📊 Usage Count    - How often used
✅ Success Rate   - % students answered correctly
⏱️ Avg Time       - Average time to answer
🎯 Difficulty     - Easy, Medium, Hard
```

---

## 🎯 Individual Student View

```
┌─────────────────────────────────────────────────────────────┐
│  👤 Student Profile: Ahmad Rivaldi                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📧 Email: ahmad.rivaldi@gmail.com                           │
│  📅 Joined: May 18, 2026                                     │
│  🔥 Streak: 12 days                                          │
│  🏆 Level: 5 (2,450 XP)                                      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Performance Summary                                  │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │  Tryouts Taken:        8                             │   │
│  │  Tryouts Completed:    7 (88% completion)            │   │
│  │  Average Score:        635                           │   │
│  │  Highest Score:        672                           │   │
│  │  Latest Score:         658                           │   │
│  │                                                       │   │
│  │  Score Breakdown:                                     │   │
│  │    TPS:       620  [━━━━━━━━━━━━━━━━░░░░]  80%       │   │
│  │    Literasi:  650  [━━━━━━━━━━━━━━━━━░░░]  84%       │   │
│  │                                                       │   │
│  │  Practice Sessions:   24                             │   │
│  │  Hours Studied:       32h 45m                        │   │
│  │  Questions Answered:  1,234                          │   │
│  │  Accuracy Rate:       74%                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  📈 Progress Chart                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                              ╱                        │   │
│  │                         ━━━━                          │   │
│  │                    ━━━━                               │   │
│  │               ━━━━                                    │   │
│  │          ━━━━                                         │   │
│  │     ━━━━                                              │   │
│  └──────────────────────────────────────────────────────┘   │
│   W1    W2    W3    W4    W5    W6    W7    W8             │
│                                                               │
│  🎯 Target Campus: UI - Pendidikan Dokter                   │
│  📊 Passing Grade: 680 (Still need +22 points)              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Actions Panel

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Quick Actions                                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [🔄 Refresh Data]    [📊 Export Report]    [📧 Send Alert] │
│                                                               │
│  [🎯 Create Tryout]   [📝 Add Question]     [👥 View Users]  │
│                                                               │
│  [🗑️ Cleanup Old Data] [⚙️ Settings]        [❓ Help]        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔔 Real-Time Notifications

```
┌─────────────────────────────────────────────────────────────┐
│  🔔 Live Activity Feed                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🆕 Sarah just completed "Tryout Akbar #5" with score 672   │
│     2 seconds ago                                            │
│                                                               │
│  👤 New user registered: John Doe (john@example.com)         │
│     45 seconds ago                                           │
│                                                               │
│  ✅ Ahmad finished practice session (18/20 correct)          │
│     2 minutes ago                                            │
│                                                               │
│  📝 New question added to bank by Admin                      │
│     5 minutes ago                                            │
│                                                               │
│  🎯 Platform average now: 545 (+2 from yesterday)           │
│     12 minutes ago                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Auto-refresh: Every 30 seconds
Last updated: 2 seconds ago
```

---

## 🎨 Color Scheme Reference

### Status Colors
- 🟢 **Green (#10b981)**: Success, Active, Above Average
- 🟡 **Yellow (#f59e0b)**: Warning, Moderate, At Average
- 🔴 **Red (#ef4444)**: Error, Inactive, Below Average
- 🔵 **Blue (#3b82f6)**: Info, In Progress, Neutral
- 🟣 **Purple (#8b5cf6)**: Premium, Special, High Value

### Metric Colors
- **Teal (#14b8a6)**: Primary actions, main metrics
- **Orange (#fb923c)**: Secondary actions, highlights
- **Gray (#6b7280)**: Neutral, inactive, background

---

## 📱 Mobile View (Responsive)

```
┌─────────────────────┐
│  ☰ Menu   EduPTN   👤│
├─────────────────────┤
│                      │
│  ┌────────────────┐ │
│  │  👥 Students   │ │
│  │      245       │ │
│  └────────────────┘ │
│                      │
│  ┌────────────────┐ │
│  │  🔥 Active     │ │
│  │      180       │ │
│  └────────────────┘ │
│                      │
│  ┌────────────────┐ │
│  │  📝 Tryouts    │ │
│  │     1,234      │ │
│  └────────────────┘ │
│                      │
│  📊 Hourly Users    │
│  ─────────────────  │
│  [Graph here]       │
│                      │
│  🎯 Score Growth    │
│  ─────────────────  │
│  [Graph here]       │
│                      │
└─────────────────────┘

Features:
✅ Stack vertically
✅ Touch-optimized buttons
✅ Swipe navigation
✅ Collapsible sections
```

---

## 🎯 Admin Dashboard Menu Structure

```
EduPTN Admin Dashboard
│
├── 📊 Overview (Default)
│   ├── Key Metrics Cards
│   ├── National Comparison
│   ├── Hourly Activity Graph
│   └── Score Growth Trend
│
├── 👥 Users Management
│   ├── All Registered Students
│   ├── Active Users List
│   ├── Student Details View
│   └── Role Management
│
├── 📝 Tryout Management
│   ├── Create New Tryout
│   ├── Edit Existing Tryouts
│   ├── View All Sessions
│   └── Completion Analytics
│
├── 📚 Question Bank
│   ├── Add New Question
│   ├── Edit Questions
│   ├── Import Bulk (CSV/JSON)
│   ├── Export Questions
│   └── Usage Analytics
│
├── 📈 Analytics
│   ├── Score Growth
│   ├── Completion Rates
│   ├── Practice Heatmap
│   └── Custom Reports
│
├── 🎓 PTN & Jurusan
│   ├── Manage PTN List
│   ├── Manage Jurusan
│   └── Passing Grade Data
│
├── 🎮 Gamification
│   ├── Badges & Achievements
│   ├── XP System
│   └── Leaderboards
│
├── 💬 Community Moderation
│   ├── Forum Posts
│   ├── Delete Inappropriate Content
│   └── User Reports
│
├── 🔔 Notifications
│   ├── Send Broadcast
│   ├── Scheduled Messages
│   └── Email Campaigns
│
└── ⚙️ Settings
    ├── Platform Config
    ├── API Keys
    ├── Maintenance Mode
    └── Admin Accounts
```

---

## 🎉 Interactive Elements

### Hover Effects
```
Normal State:        Hover State:
┌──────────┐        ┌──────────┐
│  Button  │   →    │  Button  │ (Slight scale up)
└──────────┘        └──────────┘ (Shadow appears)
```

### Loading States
```
Loading:             Loaded:
┌──────────┐        ┌──────────┐
│  ⟳ ...   │   →    │ ✅ 245   │
└──────────┘        └──────────┘
```

### Refresh Animation
```
   ⟳         ⟳         ⟳
  ━━━   →   ━━━   →   ━━━
  Data      Sync      Done!
```

---

## 💡 Pro Tips for Admins

### 1. **Monitor Peak Hours**
Check hourly graph → schedule important events during high activity times

### 2. **Track Completion Rates**
Weekly completion < 60%? → Tryouts might be too difficult

### 3. **Question Analytics**
Low correct rate (< 40%)? → Review question clarity

### 4. **Score Trends**
Flat growth line? → Update study materials

### 5. **Active Users**
Low active rate? → Send engagement notifications

---

This visual guide should help you understand exactly what the admin dashboard looks like and how to interpret each metric! 🚀
