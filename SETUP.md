# EduPTN - Setup Guide

Platform persiapan UTBK-SNBT modern dengan tryout CAT, analitik IRT, rekomendasi jurusan AI, dan komunitas belajar.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di root project (sudah ada template `.env.example`):

```env
# Gemini AI Key (untuk fitur AI Konsultan)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Supabase Credentials
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Railway Backend API
RAILWAY_API_URL="https://utbk-backend-production.up.railway.app/api/v1"
```

**Cara mendapatkan kredensial:**

- **Supabase**: Buat project di [supabase.com](https://supabase.com), ambil URL dan keys dari Settings → API
- **Gemini API**: Dapatkan dari [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Railway API**: Sudah di-deploy, gunakan URL production atau ganti dengan `http://localhost:3000/api/v1` untuk development lokal

### 3. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
eduptn-utbk-prep/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx          # Landing page profesional
│   │   ├── AuthPage.jsx             # Halaman login/register
│   │   ├── DashboardView.jsx        # Dashboard siswa
│   │   ├── TryoutView.jsx           # Fitur tryout CAT (Railway API)
│   │   ├── AnalitikView.jsx         # Analitik skor & grafik
│   │   ├── CampusRecommendationView.jsx  # Rekomendasi jurusan PTN (Railway API)
│   │   ├── MateriView.jsx           # Materi belajar
│   │   ├── ConsultationView.jsx     # AI Konsultan (Gemini)
│   │   ├── GamifikasiView.jsx       # Gamifikasi (XP, level, badge)
│   │   ├── CalendarView.jsx         # Kalender belajar
│   │   ├── CommunityView.jsx        # Forum diskusi
│   │   └── AdminDashboardView.jsx   # Dashboard admin
│   ├── utils/
│   │   ├── railwayApi.js            # Service layer Railway API
│   │   └── api.js                   # Unified API service (Railway + fallback)
│   ├── data/
│   │   └── mockData.js              # Mock data untuk fallback
│   ├── App.jsx                      # Main app component
│   └── main.jsx                     # Entry point
├── server.js                        # Express server (Gemini proxy)
├── .env                             # Environment variables (JANGAN commit!)
├── .env.example                     # Template env variables
└── package.json
```

## 🔌 Railway API Endpoints

Backend Railway sudah di-deploy di: `https://utbk-backend-production.up.railway.app/api/v1`

### Auth
- `POST /auth/register` - Register akun baru
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Tryout
- `GET /tryout` - Daftar tryout PUBLISHED/ONGOING
- `POST /tryout/:id/mulai` - Mulai sesi tryout
- `POST /tryout/sesi/:sesiId/submit-subtes` - Submit jawaban subtes
- `POST /tryout/sesi/:sesiId/selesai` - Selesaikan tryout
- `GET /tryout/sesi/:sesiId/hasil` - Lihat hasil
- `GET /tryout/sesi/riwayat` - Riwayat tryout siswa

### PTN & Jurusan
- `GET /ptn` - Daftar PTN (filter: provinsi, tipe, akreditasi, search)
- `GET /ptn/:id` - Detail PTN + jurusan
- `GET /ptn/jurusan` - Semua jurusan (filter: kelompok, jenjang, search)
- `GET /ptn/jurusan/:id` - Detail jurusan

### Soal
- `GET /soal` - Daftar soal (filter: mapel)
- `GET /soal/:id` - Detail soal
- `POST /soal` - Buat soal (ADMIN)

### Latihan
- `POST /latihan/mulai` - Mulai sesi latihan
- `POST /latihan/:sessionId/submit` - Submit jawaban
- `GET /latihan/riwayat` - Riwayat latihan

## 🎨 Fitur Utama

### 1. Landing Page Profesional
- Hero section dengan CTA
- Statistik & social proof
- Fitur unggulan (6 cards)
- Perbandingan platform
- Preview dashboard
- Cara kerja (5 steps)
- Testimonial (3 siswa)
- Pricing (Free & Premium)
- FAQ (5 pertanyaan)
- CTA penutup
- Footer lengkap

### 2. Auth System
- Login/Register dengan Railway API
- Validasi real-time per field
- Show/hide password
- Error handling spesifik
- Loading state
- Demo accounts (Siswa & Admin)
- Fallback otomatis ke mode lokal

### 3. Tryout CAT
- Terhubung ke Railway API
- Flow lengkap: mulai → submit subtes → selesai → hasil
- Timer otomatis
- Navigasi soal
- Penilaian IRT
- Riwayat tryout
- Fallback lokal jika Railway offline

### 4. Rekomendasi Jurusan
- Data PTN & jurusan dari Railway
- Filter: kelompok, jenjang, passing grade, search
- Set target kampus
- Passing grade & daya tampung
- Fallback ke mock data

### 5. Analitik Skor
- Grafik perkembangan (Recharts)
- Nilai per subtes
- Identifikasi kelemahan
- Rekomendasi perbaikan

### 6. AI Konsultan
- Powered by Gemini 3.5 Flash
- Chat history
- Markdown support
- Fallback offline

### 7. Gamifikasi
- XP & Level system
- Badge achievements
- Leaderboard
- Streak harian

### 8. Forum Komunitas
- Post diskusi
- Like & comment
- Kategori topik
- User badges

## 🔐 Akun Demo

### Siswa
- Email: `siswa@eduptn.com`
- Password: `123456`

### Admin
- Email: `admin@eduptn.com`
- Password: `123456`

**Note:** Akun demo akan mencoba login ke Railway API. Jika server offline, otomatis fallback ke mode lokal.

## 🎯 Role System

### SISWA
- Akses semua fitur belajar
- Tryout & latihan
- Analitik skor
- Rekomendasi jurusan
- Forum komunitas
- AI konsultan
- Gamifikasi

### ADMIN
- Semua fitur SISWA
- Dashboard admin
- Kelola user
- Kelola soal (via Railway API)
- Kelola tryout (via Railway API)
- Statistik platform

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

Deploy folder `dist/` ke Vercel atau Netlify.

**Environment variables yang perlu di-set:**
- `RAILWAY_API_URL`
- `GEMINI_API_KEY` (jika pakai server.js)

### Backend (Railway)
Backend sudah di-deploy di Railway. Jika ingin deploy sendiri:
1. Push ke GitHub
2. Connect ke Railway
3. Set environment variables di Railway dashboard
4. Deploy otomatis

## 🐛 Troubleshooting

### Railway API tidak tersedia
- Aplikasi otomatis fallback ke mode lokal
- Data disimpan di localStorage
- Mock data digunakan untuk tryout & jurusan

### Gemini API error
- Cek `GEMINI_API_KEY` di `.env`
- AI Konsultan akan tampilkan pesan fallback

### Supabase connection error
- Cek kredensial di `.env`
- Server.js akan pakai mode lokal

## 📝 License

© 2026 EduPTN. All rights reserved.
