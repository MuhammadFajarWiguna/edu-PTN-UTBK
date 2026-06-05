# 🧪 Testing Instructions - Photo Upload & Avatar Sync

## Quick Start Testing

### Prerequisites
1. Server harus running di port 5001: `node server.js`
2. Frontend harus running: `npm run dev`
3. Browser console terbuka (F12)

---

## Test 1: Google OAuth Avatar Sync ✅

### Steps:
1. **Buka aplikasi** di browser (http://localhost:5173)
2. **Klik "Masuk"** di landing page
3. **Klik "Login dengan Google"** button
4. **Authenticate** dengan akun Google yang punya foto profil
5. **Cek console** - harus ada log seperti ini:
   ```
   🔐 Google OAuth Success!
      User: [Nama Anda]
      Email: [Email Anda]
      Avatar: https://lh3.googleusercontent.com/...
   ```
6. **Lihat sidebar** - foto profil Google harus muncul (bukan initial)
7. **Klik "Pengaturan Profil"** di sidebar
8. **Cek console** - harus ada log:
   ```
   ✅ Syncing OAuth avatar: https://lh3.googleusercontent.com/...
   ```
9. **Lihat header profile** - foto Google harus muncul

### Expected Result:
✅ Foto profil Google muncul di:
- Sidebar (kiri atas)
- Profile Settings header
- Tidak ada initial/huruf pertama, tapi foto asli

### If Failed:
- Cek console untuk error messages
- Cek localStorage: `localStorage.getItem('utbk_user')` di console
- Pastikan ada field `avatar` dengan URL Google

---

## Test 2: Custom Photo Upload ✅

### Steps:
1. **Buka "Pengaturan Profil"**
2. **Klik ikon kamera** (icon camera biru di pojok kanan bawah avatar)
3. **Pilih foto** dari komputer (JPG/PNG < 5MB)
4. **Lihat preview** - foto harus langsung muncul
5. **Hover ke foto** - button X merah harus muncul (jangan diklik dulu)
6. **Klik "Simpan Profil"** button di bawah
7. **Cek console** - harus ada log:
   ```
   💾 Saving profile...
      Name: [Nama Anda]
      Avatar: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
      ✅ Profile extended saved
      ✅ User data updated in localStorage
      🔄 Reloading page...
   ```
8. **Tunggu page reload** (otomatis)
9. **Cek sidebar** - custom foto harus muncul (bukan Google avatar lagi)

### Expected Result:
✅ Custom foto menggantikan OAuth avatar
✅ Custom foto persist setelah reload
✅ Custom foto muncul di sidebar dan profile settings

### If Failed:
- Cek apakah ada error "Ukuran file maksimal 5MB"
- Cek apakah ada error "File harus berupa gambar"
- Cek localStorage: `localStorage.getItem('utbk_profile_extended')`
- Pastikan ada field `avatar` dengan string base64 (dimulai dengan `data:`)

---

## Test 3: Avatar Priority Logic ✅

### Steps:
1. **Login dengan Google** (harus punya foto profil)
2. **Cek sidebar** - Google avatar muncul ✅
3. **Buka Pengaturan Profil**
4. **Upload custom photo**
5. **Simpan**
6. **Setelah reload** - custom photo muncul, Google avatar digantikan ✅
7. **Hover ke custom photo**
8. **Klik X button** (remove)
9. **Simpan lagi**
10. **Setelah reload** - Google avatar kembali muncul ✅

### Expected Result:
✅ Priority order respected:
1. Custom Upload (jika ada)
2. OAuth Avatar (jika tidak ada custom)
3. Initials (jika tidak ada keduanya)

---

## Test 4: Save Persistence ✅

### Steps:
1. **Upload foto custom**
2. **Simpan**
3. **Refresh browser** (F5) - foto masih ada ✅
4. **Buka tab baru** dengan URL yang sama - foto masih ada ✅
5. **Close browser completely**
6. **Buka lagi** - foto masih ada ✅
7. **Logout**
8. **Login lagi** - foto masih ada ✅

### Expected Result:
✅ Foto persist across:
- Page refresh
- New tabs
- Browser restart
- Logout/login cycle

### If Failed:
- Cek apakah localStorage di-clear saat logout
- Cek apakah ada setting "Clear data on exit" di browser

---

## Test 5: LinkedIn OAuth Avatar Sync ✅

### Steps:
(Same as Test 1, but use LinkedIn button)
1. **Klik "Login dengan LinkedIn"**
2. **Authenticate**
3. **Cek console** untuk log:
   ```
   🔐 LinkedIn OAuth Success!
      User: [Nama Anda]
      Email: [Email Anda]
      Avatar: https://media.licdn.com/...
   ```
4. **Cek sidebar** - LinkedIn avatar muncul

---

## Test 6: Error Handling ✅

### Test 6a: File Too Large
1. **Coba upload foto > 5MB**
2. **Expected**: Error message "Ukuran file maksimal 5MB" muncul di atas form

### Test 6b: Wrong File Type
1. **Coba upload file PDF atau TXT**
2. **Expected**: Error message "File harus berupa gambar (JPG, PNG, GIF)" muncul

### Test 6c: No Google Avatar
1. **Login dengan akun Google tanpa foto profil**
2. **Expected**: 
   - Console log: `⚠️ No OAuth avatar found`
   - Sidebar shows initials (huruf pertama nama)
   - Profile settings shows initials

---

## Debugging Tips 💡

### Check localStorage:
```javascript
// Buka browser console (F12)

// Cek user data
JSON.parse(localStorage.getItem('utbk_user'))

// Cek profile extended
JSON.parse(localStorage.getItem('utbk_profile_extended'))

// Clear all (if needed for fresh start)
localStorage.clear()
```

### Common Issues:

#### Issue: "Avatar Google tidak muncul"
**Solution**:
- Pastikan akun Google punya foto profil
- Cek console log setelah OAuth login
- Cek `localStorage.getItem('utbk_user')` - harus ada field `avatar`

#### Issue: "Custom upload hilang setelah refresh"
**Solution**:
- Pastikan klik "Simpan Profil" setelah upload
- Cek console - harus ada log "✅ Profile extended saved"
- Jangan close browser sebelum page reload selesai

#### Issue: "Foto tidak muncul di sidebar tapi muncul di profile"
**Solution**:
- Ini bisa karena user state belum update
- Force refresh (Ctrl+Shift+R)
- Atau logout dan login lagi

#### Issue: "Error saat save: Cannot read property of undefined"
**Solution**:
- Cek apakah server running di port 5001
- Cek apakah ada error di console
- Try logout dan login lagi

---

## Success Criteria ✅

Semua test dianggap berhasil jika:

- [x] Google OAuth avatar sync automatically
- [x] LinkedIn OAuth avatar sync automatically  
- [x] Custom photo upload works
- [x] Custom photo override OAuth avatar
- [x] Remove custom photo restores OAuth avatar
- [x] Save persist across refresh
- [x] Console logs appear correctly
- [x] No console errors
- [x] Sidebar avatar updates
- [x] Profile settings avatar updates

---

## Report Issues 🐛

Jika ada yang tidak berfungsi:

1. **Screenshot**:
   - Browser console (F12)
   - UI yang error
   
2. **Copy console logs**:
   - Semua error messages
   - Semua log messages (🔐 ✅ ⚠️ 💾)
   
3. **Check localStorage**:
   ```javascript
   console.log('utbk_user:', localStorage.getItem('utbk_user'))
   console.log('utbk_profile_extended:', localStorage.getItem('utbk_profile_extended'))
   ```
   
4. **Report dengan detail**:
   - What did you do? (steps)
   - What did you expect?
   - What actually happened?
   - Screenshots + console logs

---

Last Updated: June 2, 2026
Status: Ready for Testing
