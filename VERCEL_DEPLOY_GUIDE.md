# 🚀 Panduan Deploy ke Vercel dengan Google OAuth

**Target:** Deploy aplikasi EduPTN ke Vercel dengan Google OAuth yang berfungsi sempurna

---

## ✅ Pre-Requisites

Sebelum deploy, pastikan Anda punya:

- [ ] Akun [Vercel](https://vercel.com)
- [ ] Akun [Supabase](https://supabase.com) (sudah dibuat)
- [ ] Google Cloud Console OAuth credentials
- [ ] Project sudah di-push ke GitHub

---

## 📋 Step-by-Step Deployment

### Step 1: Setup Google OAuth di Supabase

1. **Login ke Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Pilih project Anda

2. **Enable Google Provider**
   - Click **Authentication** → **Providers**
   - Scroll ke **Google**
   - Toggle **Enable** menjadi ON

3. **Input Google Credentials**
   ```
   Google Client ID: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   Google Client Secret: YOUR_GOOGLE_CLIENT_SECRET
   ```

4. **Copy Callback URL**
   - Supabase akan memberikan callback URL seperti:
   ```
   https://ysveoqfelzwdldhzkkws.supabase.co/auth/v1/callback
   ```
   - **PENTING:** Simpan URL ini, akan dipakai di step berikutnya

---

### Step 2: Update Google Cloud Console

1. **Login ke Google Cloud Console**
   - Go to: https://console.cloud.google.com/apis/credentials

2. **Pilih OAuth 2.0 Client ID Anda**
   - Klik pada credential yang Anda gunakan

3. **Tambahkan Authorized Redirect URIs**
   
   Tambahkan 3 URLs berikut:
   ```
   https://ysveoqfelzwdldhzkkws.supabase.co/auth/v1/callback
   https://your-app.vercel.app
   http://localhost:5001
   ```
   
   **Note:** Ganti `your-app.vercel.app` dengan domain Vercel Anda nanti

4. **Save**
   - Klik **SAVE** di bawah

---

### Step 3: Push Code ke GitHub

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "feat: add Supabase OAuth and Vercel config"

# Add remote (buat repo baru di GitHub dulu)
git remote add origin https://github.com/YOUR_USERNAME/eduptn-utbk-prep.git

# Push
git push -u origin main
```

---

### Step 4: Deploy ke Vercel

1. **Login ke Vercel**
   - Go to: https://vercel.com
   - Click **Add New** → **Project**

2. **Import GitHub Repository**
   - Click **Import Git Repository**
   - Pilih `eduptn-utbk-prep`
   - Click **Import**

3. **Configure Project**
   
   Vercel akan auto-detect Vite. Pastikan settings ini:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   
   Click **Environment Variables** dan tambahkan:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://ysveoqfelzwdldhzkkws.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (your anon key) |
   | `VITE_RAILWAY_API_URL` | `https://utbk-backend-production.up.railway.app/api/v1` |
   | `GEMINI_API_KEY` | `AIzaSyBmce...` (your Gemini key) |

   **PENTING:** Pastikan semua variabel di-set untuk **Production**, **Preview**, dan **Development**

5. **Deploy**
   - Click **Deploy**
   - Tunggu 2-3 menit

---

### Step 5: Update Redirect URIs dengan Domain Vercel

Setelah deployment selesai, Vercel akan memberikan URL seperti:
```
https://eduptn-utbk-prep.vercel.app
```

1. **Copy domain Vercel Anda**

2. **Update Google Cloud Console**
   - Kembali ke: https://console.cloud.google.com/apis/credentials
   - Edit OAuth Client
   - **Ganti** `https://your-app.vercel.app` dengan domain Vercel yang sebenarnya
   - Tambahkan juga wildcard untuk preview deployments:
     ```
     https://eduptn-utbk-prep.vercel.app
     https://eduptn-utbk-prep-*.vercel.app
     ```
   - Click **SAVE**

3. **Update Supabase Site URL**
   - Go to Supabase Dashboard
   - Click **Authentication** → **URL Configuration**
   - Set **Site URL**: `https://eduptn-utbk-prep.vercel.app`
   - Add **Redirect URLs**:
     ```
     https://eduptn-utbk-prep.vercel.app
     https://eduptn-utbk-prep.vercel.app/*
     https://eduptn-utbk-prep-*.vercel.app
     http://localhost:5001
     ```
   - Click **Save**

---

### Step 6: Test OAuth Login

1. **Visit your Vercel URL**
   ```
   https://eduptn-utbk-prep.vercel.app
   ```

2. **Click "Masuk" atau "Daftar"**

3. **Click "Lanjutkan dengan Google"**

4. **Pilih akun Google Anda**

5. **Verify redirect ke Dashboard**
   - Setelah OAuth sukses, harus redirect ke dashboard
   - Check bahwa:
     - ✅ Nama user tampil di sidebar
     - ✅ Avatar tampil (jika ada)
     - ✅ Email tampil
     - ✅ Tidak ada error di console (F12)

---

## 🧪 Testing Checklist

Setelah deployment, test ini:

### Basic Functionality:
- [ ] Landing page loads
- [ ] Click "Masuk" → Auth page muncul
- [ ] Login dengan email/password works
- [ ] Register akun baru works

### Google OAuth:
- [ ] Click "Lanjutkan dengan Google"
- [ ] Google popup/redirect muncul
- [ ] Pilih akun Google
- [ ] Redirect kembali ke aplikasi
- [ ] Login sukses, masuk ke dashboard
- [ ] User name tampil di sidebar
- [ ] Avatar tampil (jika ada dari Google)

### Navigation:
- [ ] Semua menu di sidebar berfungsi
- [ ] Dashboard View loads
- [ ] Tryout View loads
- [ ] Admin Dashboard (jika login sebagai admin)

### Logout:
- [ ] Click "Logout"
- [ ] Modal konfirmasi muncul
- [ ] Confirm logout
- [ ] Redirect ke landing page
- [ ] Login lagi works

---

## 🐛 Troubleshooting

### Issue 1: "redirect_uri_mismatch"

**Error:**
```
Error 400: redirect_uri_mismatch
```

**Solution:**
1. Check URL yang error
2. Copy exact URL dari error message
3. Add ke Google Cloud Console → OAuth Client → Authorized redirect URIs
4. Pastikan EXACT match (termasuk http/https, trailing slash, dll)

---

### Issue 2: "Access blocked: This app's request is invalid"

**Error:**
```
Access blocked: This app's request is invalid
```

**Solution:**
1. Go to Google Cloud Console → APIs & Services
2. Enable **Google+ API**
3. Enable **People API**
4. Wait 5-10 minutes
5. Try again

---

### Issue 3: OAuth popup tertutup tapi tidak login

**Symptoms:**
- Google popup muncul
- User pilih akun
- Popup tertutup
- Tapi tidak login/redirect

**Solution:**
1. Check browser console (F12) untuk errors
2. Verify Supabase Site URL di dashboard
3. Verify callback URL di Google Console
4. Clear cookies dan try again
5. Try incognito mode

---

### Issue 4: "Session expired" atau "Invalid token"

**Symptoms:**
- Login sukses tapi langsung logout
- Error "Session expired"

**Solution:**
1. Check `VITE_SUPABASE_ANON_KEY` di Vercel environment variables
2. Pastikan key yang benar (bukan service_role key)
3. Redeploy setelah update env vars:
   ```bash
   vercel --prod
   ```

---

### Issue 5: Environment variables tidak loaded

**Symptoms:**
- `undefined` di console logs
- OAuth tidak jalan
- Supabase errors

**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify semua variables ada:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAILWAY_API_URL`
   - `GEMINI_API_KEY`
3. Pastikan di-set untuk:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Redeploy:
   - Click **Deployments** tab
   - Click **Redeploy** pada latest deployment

---

## 📱 Mobile Testing

Setelah deploy, test di mobile:

1. **Open di browser mobile**
   ```
   https://eduptn-utbk-prep.vercel.app
   ```

2. **Test OAuth**
   - Click "Lanjutkan dengan Google"
   - Should open Google account picker
   - Select account
   - Should redirect back and login

3. **Test Navigation**
   - Hamburger menu works
   - All pages accessible
   - Logout works

---

## 🔒 Security Checklist

Before going public:

- [ ] Environment variables tidak exposed di client code
- [ ] HTTPS enabled (Vercel auto)
- [ ] Supabase RLS (Row Level Security) enabled
- [ ] Google OAuth consent screen configured
- [ ] No sensitive data in console logs
- [ ] API keys tidak di-commit ke Git

---

## 🎯 Performance Optimization

After deployment:

1. **Run Lighthouse Audit**
   - Open DevTools (F12)
   - Go to Lighthouse tab
   - Run audit
   - Target score: > 85

2. **Check Bundle Size**
   ```bash
   npm run build
   # Check dist/assets/ sizes
   ```

3. **Enable Vercel Analytics** (optional)
   - Go to Vercel Dashboard → Project → Analytics
   - Enable Real Experience Score

---

## 🔄 Continuous Deployment

**Automatic deploys on git push:**

1. Every push to `main` branch → deploys to production
2. Every PR → creates preview deployment
3. Check deployment status at:
   ```
   https://vercel.com/dashboard
   ```

**Manual redeploy:**
```bash
vercel --prod
```

---

## 📊 Monitoring

**Check deployment logs:**

1. Go to Vercel Dashboard
2. Click your project
3. Click **Deployments**
4. Click latest deployment
5. View **Build Logs** and **Function Logs**

**Check runtime errors:**

1. Open browser console (F12)
2. Network tab → check API calls
3. Console tab → check errors

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Vercel build succeeds (no errors)
2. ✅ Landing page loads on production URL
3. ✅ Google OAuth login works
4. ✅ User can access dashboard after login
5. ✅ Navigation works (all menu items)
6. ✅ Mobile responsive
7. ✅ No console errors
8. ✅ Logout works
9. ✅ Can login again after logout

---

## 🎉 Done!

Aplikasi Anda sekarang live di Vercel dengan Google OAuth yang berfungsi!

**Next steps:**
- Share URL dengan teman untuk test
- Add custom domain (optional)
- Setup analytics
- Monitor performance

---

## 🆘 Need More Help?

If still having issues:

1. **Check Vercel Logs**
   - Vercel Dashboard → Deployments → Build Logs

2. **Check Browser Console**
   - F12 → Console tab
   - Look for red errors

3. **Check Supabase Logs**
   - Supabase Dashboard → Logs → API Logs

4. **Verify All Settings**
   - Google Cloud Console redirect URIs
   - Supabase Site URL & Redirect URLs
   - Vercel environment variables

5. **Test Locally First**
   ```bash
   npm run dev
   # Test OAuth on localhost
   ```

---

**Good luck with your deployment! 🚀**

