# 🎯 Panduan Setup Tryout - EduPTN

## ❌ Masalah yang Diperbaiki

### 1. Error "Tryout tidak ditemukan"
**Penyebab**: Belum ada tryout yang dibuat di database Railway
**Solusi**: Admin harus membuat tryout terlebih dahulu melalui Admin Dashboard

### 2. Jawaban tidak muncul
**Penyebab**: Bug dalam normalisasi opsi jawaban dari Railway API
**Solusi**: Sudah diperbaiki - opsi jawaban sekarang di-normalize dengan benar

---

## 🚀 Cara Membuat Tryout Baru (Admin)

### Langkah 1: Login sebagai Admin
```
Email: admin@eduptn.com
Password: 123456
```
atau
```
Email: abu@gmail.com
Password: (password Anda)
```

### Langkah 2: Buka Admin Dashboard
1. Klik tombol **"Admin Dashboard"** di sidebar
2. Atau klik **"Mode Admin"** jika sudah login sebagai admin

### Langkah 3: Navigasi ke Tab Tryout
1. Di sidebar admin, klik **"Manajemen Tryout"**
2. Klik tombol **"+ Buat Tryout Baru"**

### Langkah 4: Isi Form Tryout
```
Judul: Tryout UTBK 2026 - Simulasi #1
Kategori: TPS & LITERASI
Status: DRAFT (ubah ke PUBLISHED setelah soal siap)
Durasi: 195 menit
Total Soal: 155 soal
Jadwal Mulai: (opsional)
Jadwal Selesai: (opsional)
```

### Langkah 5: Simpan Tryout
- Klik **"Simpan Tryout"**
- Tryout akan dibuat dengan status **DRAFT**
- Tryout akan tersimpan di Railway database

### Langkah 6: Tambahkan Soal ke Tryout (via Railway API)
**PENTING**: Setelah tryout dibuat, Anda perlu menambahkan soal menggunakan Railway API endpoint:

```bash
POST /api/v1/tryout/:tryoutId/subtes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "subtes": "TPS",
  "soal": [
    {
      "pertanyaan": "Jika x + y = 10 dan x - y = 2, maka nilai x adalah...",
      "opsi": {
        "A": "4",
        "B": "5",
        "C": "6",
        "D": "7",
        "E": "8"
      },
      "jawaban": "C",
      "tingkat": "sedang",
      "pembahasan": "x + y = 10 dan x - y = 2, maka 2x = 12, x = 6"
    }
  ]
}
```

### Langkah 7: Publish Tryout
1. Setelah soal ditambahkan, kembali ke Admin Dashboard
2. Klik tombol **"Publish"** pada tryout yang sudah siap
3. Status akan berubah dari **DRAFT** → **PUBLISHED**
4. Tryout sekarang bisa diakses oleh siswa

---

## 📋 Status Tryout

| Status | Deskripsi | Aksi Siswa |
|--------|-----------|------------|
| **DRAFT** | Tryout masih dalam tahap persiapan | ❌ Tidak bisa diakses |
| **PUBLISHED** | Tryout siap dan tersedia | ✅ Bisa dimulai |
| **ONGOING** | Tryout sedang berlangsung | ✅ Bisa dimulai |
| **ENDED** | Tryout sudah selesai | ❌ Tidak bisa diakses |

---

## 🔧 Troubleshooting

### Tryout tidak muncul di list siswa
**Cek:**
1. Status tryout harus **PUBLISHED** atau **ONGOING**
2. Tryout sudah tersimpan di Railway database
3. Refresh halaman atau klik tombol refresh

### Error saat membuat tryout
**Solusi:**
1. Pastikan koneksi ke Railway API aktif
2. Cek console browser untuk error detail
3. Jika Railway offline, tryout akan tersimpan lokal dan sync otomatis saat online

### Soal tidak muncul saat mulai tryout
**Penyebab**: Belum ada soal yang ditambahkan ke tryout
**Solusi**: Gunakan Railway API endpoint `/tryout/:id/subtes` untuk menambahkan soal

---

## 🎓 Flow Lengkap Tryout

```
ADMIN:
1. Buat Tryout (DRAFT) → Railway API: POST /tryout
2. Tambah Soal → Railway API: POST /tryout/:id/subtes
3. Publish Tryout → Railway API: PATCH /tryout/:id/status

SISWA:
1. Lihat List Tryout → Railway API: GET /tryout
2. Mulai Tryout → Railway API: POST /tryout/:id/mulai
3. Jawab Soal → Frontend state management
4. Submit Subtes → Railway API: POST /tryout/sesi/:sesiId/submit-subtes
5. Selesai Tryout → Railway API: POST /tryout/sesi/:sesiId/selesai
6. Lihat Hasil → Railway API: GET /tryout/sesi/:sesiId/hasil
```

---

## 🔗 Railway API Endpoints

### Admin Endpoints
```
POST   /api/v1/tryout                    - Buat tryout baru
POST   /api/v1/tryout/:id/subtes         - Tambah soal ke subtes
PATCH  /api/v1/tryout/:id/status         - Update status tryout
DELETE /api/v1/tryout/:id                - Hapus tryout DRAFT
```

### Siswa Endpoints
```
GET    /api/v1/tryout                    - List tryout PUBLISHED/ONGOING
POST   /api/v1/tryout/:id/mulai          - Mulai sesi tryout
POST   /api/v1/tryout/sesi/:id/submit-subtes - Submit jawaban subtes
POST   /api/v1/tryout/sesi/:id/selesai  - Selesaikan tryout
GET    /api/v1/tryout/sesi/:id/hasil    - Lihat hasil tryout
GET    /api/v1/tryout/sesi/riwayat      - Riwayat tryout siswa
```

---

## ✅ Checklist Setup Tryout

- [ ] Login sebagai admin
- [ ] Buka Admin Dashboard
- [ ] Klik "Manajemen Tryout"
- [ ] Klik "+ Buat Tryout Baru"
- [ ] Isi form tryout (judul, kategori, durasi, dll)
- [ ] Simpan tryout (status: DRAFT)
- [ ] Tambahkan soal via Railway API endpoint
- [ ] Publish tryout (ubah status ke PUBLISHED)
- [ ] Test sebagai siswa - tryout harus muncul di list
- [ ] Mulai tryout dan pastikan soal muncul
- [ ] Submit jawaban dan cek hasil

---

## 📞 Bantuan

Jika masih ada masalah:
1. Cek console browser (F12) untuk error detail
2. Cek Railway API logs untuk error backend
3. Pastikan token admin valid dan tidak expired
4. Cek koneksi internet dan Railway API status

---

**Terakhir diperbarui**: 28 Mei 2026
**Versi**: 1.0.0
