# Admin Features Implementation Plan

## Overview
Implementasi fitur admin lengkap dengan dashboard analytics, management tools, dan fitur latihan soal.

## 1. Admin Dashboard dengan Recharts

### Features:
- **Overview Tab**: Stats cards + charts (user growth, score distribution, mapel breakdown)
- **Users Management**: List semua user, edit role, view activity
- **Soal Management**: CRUD soal tryout dengan filter & search
- **Materi Management**: CRUD materi pembelajaran
- **Tryout Management**: Create/edit/delete tryout, manage subtes
- **Latihan Management**: Monitor latihan sessions

### Charts (Recharts):
- Line Chart: User growth over time
- Bar Chart: Score distribution
- Pie Chart: Mapel breakdown
- Area Chart: Activity trends

## 2. Latihan View (New Feature)

### Railway API Endpoints:
- POST /api/v1/latihan/mulai - Start practice session
- POST /api/v1/latihan/:sessionId/submit - Submit answers
- GET /api/v1/latihan/riwayat - Get history
- GET /api/v1/latihan/:sessionId - Get session detail

### Flow:
1. Pilih Mapel (TPS, TKA_SAINTEK, TKA_SOSHUM)
2. Mulai Latihan → Get soal from API
3. Kerjakan soal satu per satu
4. Submit jawaban → Get hasil (skor, benar/salah per soal)
5. Lihat pembahasan
6. Riwayat latihan

## 3. Gamifikasi View Update

### Changes:
- Remove emoticons (🏆, 🎯, etc.)
- Use Lucide icons instead:
  - Trophy → Award icon
  - Target → Target icon
  - Fire → Flame icon
  - Star → Star icon
  - Medal → Medal icon

## 4. App.jsx Updates

### Add to sidebar:
```javascript
{ id: "latihan", label: "Latihan Soal", icon: <Zap /> }
```

### Add routing:
```javascript
{activeTab === "latihan" && <LatihanView user={user} onAddPoint={handleAddPoint} />}
```

## Implementation Priority:
1. ✅ Latihan View (most requested)
2. ✅ Gamifikasi icon update (quick win)
3. ✅ Admin Dashboard with Recharts (complex)
4. ✅ Admin management tools (CRUD operations)

## Files to Create/Update:
- [ ] src/components/LatihanView.jsx (NEW)
- [ ] src/components/AdminDashboardView.jsx (REBUILD)
- [ ] src/components/GamifikasiView.jsx (UPDATE icons)
- [ ] src/App.jsx (ADD latihan routing)
