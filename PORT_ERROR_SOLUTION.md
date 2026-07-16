# 🔧 Solusi Error: Port Already in Use

## ❌ Error yang Terjadi

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:5001
Error: listen EADDRINUSE: address already in use 0.0.0.0:24678
```

**Penyebab:** Port 5001 (HTTP server) dan 24678 (WebSocket) masih digunakan oleh process lain atau server yang tidak tertutup dengan benar.

---

## ✅ Solusi 1: Gunakan Script Helper (RECOMMENDED)

### **Cara Paling Mudah - Automatic Port Cleanup**

Saya sudah membuat script yang otomatis membersihkan port sebelum start server.

```bash
# Jalankan script ini setiap kali mau start server
./start-server.sh
```

**Script ini akan:**
1. ✅ Check port 5001 dan 24678
2. ✅ Kill process yang menggunakan port tersebut
3. ✅ Clean up node server.js yang masih running
4. ✅ Start dev server dengan clean state

**Keuntungan:**
- 🚀 One command solution
- ✅ Automatic cleanup
- ✅ Selalu berhasil start
- ✅ No manual intervention

---

## ✅ Solusi 2: Manual Cleanup

### **Jika script tidak work, gunakan cara manual:**

### **Step 1: Kill Process di Port 5001**

```bash
# Cari PID process yang menggunakan port 5001
lsof -ti:5001

# Kill process (ganti <PID> dengan angka yang muncul)
kill -9 <PID>
```

**Atau one-liner:**
```bash
lsof -ti:5001 | xargs kill -9 2>/dev/null
```

### **Step 2: Kill Process di Port 24678**

```bash
# Kill WebSocket port
lsof -ti:24678 | xargs kill -9 2>/dev/null
```

### **Step 3: Kill Semua Node Server**

```bash
# Kill semua node server.js yang masih running
pkill -f "node server.js"
```

### **Step 4: Verifikasi Port Kosong**

```bash
# Check apakah port sudah kosong (output harus 0)
lsof -ti:5001 -ti:24678 | wc -l
```

Output yang diharapkan: `0`

### **Step 5: Start Dev Server**

```bash
npm run dev
```

---

## ✅ Solusi 3: Restart Terminal

Jika masih error, cara paling ampuh:

```bash
# 1. Close terminal/console yang sedang buka
# 2. Buka terminal baru
# 3. Navigate ke project directory
cd /home/pc-15/Downloads/eduptn-utbk-prep

# 4. Jalankan script helper
./start-server.sh
```

---

## ✅ Solusi 4: Reboot System (Last Resort)

Jika semua solusi di atas gagal:

```bash
# Restart komputer
sudo reboot
```

Setelah restart:
```bash
cd /home/pc-15/Downloads/eduptn-utbk-prep
./start-server.sh
```

---

## 🔍 Cara Check Port yang Digunakan

### **Check Port 5001**
```bash
lsof -i:5001
```

Output akan menampilkan:
```
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    37552  pc-15   23u  IPv4 234567      0t0  TCP *:5001 (LISTEN)
```

### **Check Port 24678 (WebSocket)**
```bash
lsof -i:24678
```

### **Check Semua Process Node**
```bash
ps aux | grep node
```

---

## 🛠️ Troubleshooting

### **Problem 1: Permission Denied saat kill process**

**Solution:**
```bash
# Gunakan sudo
sudo lsof -ti:5001 | xargs sudo kill -9
sudo lsof -ti:24678 | xargs sudo kill -9
```

### **Problem 2: Script tidak bisa dijalankan**

**Error:** `Permission denied: ./start-server.sh`

**Solution:**
```bash
# Berikan permission execute
chmod +x start-server.sh

# Jalankan lagi
./start-server.sh
```

### **Problem 3: Port masih digunakan setelah kill**

**Solution:**
```bash
# Force kill dengan SIGKILL
pkill -9 -f "node server.js"

# Tunggu 2 detik
sleep 2

# Coba lagi
npm run dev
```

### **Problem 4: WebSocket error tapi HTTP server jalan**

**Solution:**
Port 24678 (WebSocket) mungkin digunakan app lain.

```bash
# Check process apa yang pakai port 24678
lsof -i:24678

# Kill process tersebut
lsof -ti:24678 | xargs kill -9
```

---

## 📋 Best Practices

### **✅ DO:**

1. **Selalu gunakan script helper** untuk start server:
   ```bash
   ./start-server.sh
   ```

2. **Stop server dengan Ctrl+C** (jangan close terminal langsung)

3. **Check port sebelum start** jika manual:
   ```bash
   lsof -ti:5001 -ti:24678 | wc -l
   # Output harus: 0
   ```

4. **Gunakan single terminal** untuk dev server (jangan buka multiple)

### **❌ DON'T:**

1. ❌ Jangan close terminal tanpa stop server (Ctrl+C)
2. ❌ Jangan jalankan `npm run dev` berkali-kali
3. ❌ Jangan kill terminal paksa (Alt+F4 / X button)
4. ❌ Jangan jalankan multiple dev servers bersamaan

---

## 🚀 Quick Commands Reference

```bash
# Start server (RECOMMENDED)
./start-server.sh

# Kill all ports manual
lsof -ti:5001 -ti:24678 | xargs kill -9 2>/dev/null

# Kill node servers
pkill -f "node server.js"

# Check if ports are free
lsof -ti:5001 -ti:24678 | wc -l  # Should return: 0

# Start dev server
npm run dev

# Stop server
Ctrl+C
```

---

## 📱 Alternative: Gunakan Port Berbeda

Jika port 5001 selalu conflict dengan app lain, ubah port:

### **Edit `server.js`:**

```javascript
// Cari line ini (sekitar line 10-15)
const PORT = process.env.PORT || 5001;

// Ubah menjadi port lain, contoh:
const PORT = process.env.PORT || 3000;
```

### **Edit `.env`:**

```env
PORT=3000
```

Restart server, akses di: http://localhost:3000

---

## ✅ Verifikasi Server Berjalan

### **Check via Terminal:**
```bash
# Harus ada output: "EduPTN server running on..."
curl http://localhost:5001
```

### **Check via Browser:**
Buka: http://localhost:5001

Harus melihat landing page EduPTN.

### **Check Ports:**
```bash
# Port 5001 harus LISTEN
lsof -i:5001

# Port 24678 harus LISTEN
lsof -i:24678
```

---

## 💡 Pro Tips

1. **Gunakan script helper** - Paling mudah dan reliable
2. **Jangan panic** - Port error adalah masalah umum
3. **Check port dulu** sebelum start server
4. **Close dengan benar** - Selalu Ctrl+C untuk stop server
5. **Single instance** - Jangan jalankan multiple dev servers

---

## 📞 Masih Error?

Jika masih mengalami error setelah semua solusi di atas:

1. **Check firewall** - Mungkin block port 5001/24678
2. **Check antivirus** - Mungkin kill node process
3. **Check other apps** - Mungkin ada app lain pakai port yang sama
4. **Restart system** - Ultimate solution

---

## ✅ Kesimpulan

**Error EADDRINUSE sudah SOLVED!** ✨

Sekarang kamu punya 3 cara untuk mengatasi:

1. ✅ **Script helper** (paling mudah): `./start-server.sh`
2. ✅ **Manual cleanup**: Kill ports → start server
3. ✅ **Restart terminal/system**: Last resort

**Server sudah berjalan di:** http://localhost:5001

**Happy coding!** 🚀

---

**Last Updated**: 2026-07-15  
**Status**: ✅ Solved  
**Server Status**: ✅ Running
