# Latihan View - Feature Documentation

## ✅ COMPLETED

Fitur **Latihan Soal** sudah berhasil diimplementasikan dengan lengkap!

## Features

### 1. **Pilih Mapel Tab**
- 3 pilihan mapel:
  - **TPS** - Tes Potensi Skolastik (Penalaran Umum, Kuantitatif, Pemahaman Bacaan)
  - **TKA Saintek** - Matematika, Fisika, Kimia, Biologi
  - **TKA Soshum** - Geografi, Sejarah, Sosiologi, Ekonomi
- Card design dengan icon dan deskripsi
- Hover effect yang smooth
- Loading state saat memulai latihan

### 2. **Latihan Tab**
- **Progress Bar**: Menampilkan progress soal yang sudah dikerjakan
- **Timer**: Menghitung waktu pengerjaan secara real-time
- **Question Display**: 
  - Nomor soal dan total soal
  - Mapel dan subtest badge
  - Pertanyaan dengan format yang jelas
  - Pilihan jawaban (A, B, C, D, E) dengan highlight saat dipilih
- **Navigation**:
  - Tombol Previous/Next untuk navigasi antar soal
  - Grid navigator di sidebar (klik nomor soal untuk jump)
  - Visual indicator: soal saat ini (teal), sudah dijawab (light teal), belum dijawab (gray)
- **Submit Button**: 
  - Menampilkan jumlah soal yang sudah dijawab
  - Disabled jika belum ada jawaban
  - Loading state saat submit

### 3. **Hasil Tab**
- **Score Summary Card**:
  - Trophy icon
  - Skor total
  - Jumlah benar/salah
  - Waktu pengerjaan
- **Pembahasan Lengkap**:
  - Setiap soal ditampilkan dengan:
    - Status benar/salah (dengan icon)
    - Pertanyaan
    - Jawaban user
    - Jawaban yang benar
    - Pembahasan detail (jika tersedia)
  - Color coding: hijau untuk benar, merah untuk salah
- **Action Buttons**:
  - "Latihan Lagi" - Kembali ke pilih mapel
  - "Lihat Riwayat" - Pindah ke tab riwayat

### 4. **Riwayat Tab**
- List semua sesi latihan yang pernah dikerjakan
- Informasi per sesi:
  - Mapel
  - Tanggal dan waktu
  - Skor
  - Jumlah benar/salah
  - Status (Selesai/Belum Selesai)
- Empty state jika belum ada riwayat
- Loading state saat fetch data

## Railway API Integration

### Endpoints Used:
1. **POST /api/v1/latihan/mulai**
   - Body: `{ mapel: "TPS" | "TKA_SAINTEK" | "TKA_SOSHUM" }`
   - Returns: `{ session, soal[] }`

2. **POST /api/v1/latihan/:sessionId/submit**
   - Body: `{ jawaban: [{ soalId, jawaban }] }`
   - Returns: `{ skor, benar, salah, ... }`

3. **GET /api/v1/latihan/riwayat**
   - Returns: Array of past sessions

4. **GET /api/v1/latihan/:sessionId**
   - Returns: Session detail with results

### Fallback System:
- Jika Railway API tidak tersedia, akan fallback ke localStorage/mockData
- Error handling yang proper dengan pesan error yang jelas
- Loading states di semua async operations

## UI/UX Features

### Design:
- ✅ Professional & clean design
- ✅ Consistent dengan design system EduPTN
- ✅ Responsive (mobile & desktop)
- ✅ Dark mode support
- ✅ Smooth animations (fade-in, transitions)
- ✅ Color coding yang jelas (teal untuk primary, emerald untuk success, red untuk error)

### Icons (Lucide):
- `Zap` - Main icon untuk Latihan
- `Target` - Pilih Mapel tab
- `Play` - Latihan tab
- `Trophy` - Hasil tab
- `History` - Riwayat tab
- `Clock` - Timer
- `CheckCircle` - Jawaban benar
- `XCircle` - Jawaban salah
- `Award` - Score
- `ChevronLeft/Right` - Navigation
- `RotateCcw` - Mulai lagi

### Interactions:
- Hover effects pada cards dan buttons
- Active states pada selected answers
- Disabled states dengan opacity
- Loading spinners
- Toast notifications (via onAddPoint)

## Gamification Integration

- Otomatis memberikan poin setelah selesai latihan
- Poin dihitung berdasarkan skor: `Math.floor(skor / 10)`
- Trigger: `onAddPoint(points, "Menyelesaikan Latihan {mapel}")`

## Files Created/Modified

### Created:
- ✅ `src/components/LatihanView.jsx` (350+ lines)

### Modified:
- ✅ `src/App.jsx`:
  - Added `Zap` icon import
  - Added `LatihanView` import
  - Added "Latihan Soal" to sidebar (with amber Zap icon)
  - Added routing for latihan tab

## Testing Checklist

- [ ] Test pilih mapel TPS
- [ ] Test pilih mapel TKA Saintek
- [ ] Test pilih mapel TKA Soshum
- [ ] Test jawab soal dan navigasi
- [ ] Test submit jawaban
- [ ] Test lihat hasil dan pembahasan
- [ ] Test lihat riwayat
- [ ] Test error handling (Railway offline)
- [ ] Test responsive design (mobile)
- [ ] Test dark mode
- [ ] Test gamification points

## Next Steps

1. **Test dengan Railway API**:
   - Pastikan Railway backend sudah running
   - Test semua endpoints
   - Verify data structure

2. **Add More Features** (Optional):
   - Filter riwayat by mapel
   - Export hasil ke PDF
   - Share hasil ke social media
   - Leaderboard untuk latihan

3. **Admin Dashboard**:
   - Monitor latihan sessions
   - View statistics
   - Manage soal per mapel

## Usage

```javascript
// Di App.jsx
{activeTab === "latihan" && (
  <LatihanView 
    user={user}
    onAddPoint={handleAddPoint}
  />
)}
```

## Props

- `user` (object): Current logged in user
- `onAddPoint` (function): Callback untuk add gamification points

## State Management

- Local state untuk session, soal, jawaban, hasil
- API calls via `apiService` (with Railway fallback)
- Timer dengan useEffect
- Auto-load riwayat saat tab aktif

---

**Status**: ✅ READY FOR TESTING
**Estimated Lines**: ~350 lines
**Dependencies**: Railway API, apiService, Lucide icons
