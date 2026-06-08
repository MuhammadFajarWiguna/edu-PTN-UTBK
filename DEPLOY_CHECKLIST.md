# ✅ Checklist Deploy ke Vercel

Gunakan checklist ini untuk memastikan semua langkah sudah dilakukan.

---

## 📋 Pre-Deployment (Sebelum Deploy)

### Supabase Setup:
- [ ] Login ke Supabase Dashboard
- [ ] Go to Authentication → Providers
- [ ] Enable Google Provider
- [ ] Input Google Client ID & Secret
- [ ] Copy Supabase Callback URL

### Google Cloud Console:
- [ ] Login ke Google Cloud Console
- [ ] Go to APIs & Credentials
- [ ] Pilih OAuth 2.0 Client ID
- [ ] Add Supabase callback URL ke Authorized Redirect URIs:
  ```
  https://ysveoqfelzwdldhzkkws.supabase.co/auth/v1/callback
  ```
- [ ] Add localhost untuk testing:
  ```
  http://localhost:5001
  ```
- [ ] Save changes

### GitHub:
- [ ] All changes committed
- [ ] Pushed to GitHub repository:
  ```bash
  git add .
  git commit -m "fix: migrate to Supabase OAuth"
  git push origin main
  ```

---

## 🚀 Deployment (Deploy ke Vercel)

### Vercel Setup:
- [ ] Login ke Vercel
- [ ] Click "Add New" → "Project"
- [ ] Import GitHub repository
- [ ] Framework Preset: **Vite**
- [ ] Build Command: **npm run build**
- [ ] Output Directory: **dist**

### Environment Variables:
Add these variables di Vercel:

- [ ] `VITE_SUPABASE_URL`
  ```
  https://ysveoqfelzwdldhzkkws.supabase.co
  ```

- [ ] `VITE_SUPABASE_ANON_KEY`
  ```
  eyJhbGci... (your key)
  ```

- [ ] `VITE_RAILWAY_API_URL`
  ```
  https://utbk-backend-production.up.railway.app/api/v1
  ```

- [ ] `GEMINI_API_KEY`
  ```
  AIzaSyBmce... (your key)
  ```

**IMPORTANT:** Set untuk Production, Preview, DAN Development!

### Deploy:
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Copy Vercel URL (e.g., `https://eduptn-utbk-prep.vercel.app`)

---

## 🔧 Post-Deployment (Setelah Deploy)

### Update Google Console:
- [ ] Go back to Google Cloud Console
- [ ] Edit OAuth 2.0 Client
- [ ] Add Vercel URLs ke Authorized Redirect URIs:
  ```
  https://eduptn-utbk-prep.vercel.app
  https://eduptn-utbk-prep-*.vercel.app
  ```
- [ ] Save changes

### Update Supabase:
- [ ] Go to Supabase Dashboard
- [ ] Click Authentication → URL Configuration
- [ ] Set Site URL:
  ```
  https://eduptn-utbk-prep.vercel.app
  ```
- [ ] Add Redirect URLs:
  ```
  https://eduptn-utbk-prep.vercel.app
  https://eduptn-utbk-prep.vercel.app/*
  https://eduptn-utbk-prep-*.vercel.app
  ```
- [ ] Save changes

---

## 🧪 Testing (Verifikasi)

### Basic Tests:
- [ ] Visit Vercel URL
- [ ] Landing page loads
- [ ] Click "Masuk"
- [ ] Auth page loads

### Google OAuth:
- [ ] Click "Lanjutkan dengan Google"
- [ ] Google popup/redirect muncul
- [ ] Pilih akun Google
- [ ] OAuth succeeds
- [ ] Redirects back to app
- [ ] Login berhasil
- [ ] Dashboard muncul
- [ ] User name tampil di sidebar
- [ ] Avatar tampil (if available)
- [ ] No errors di console (F12)

### Navigation:
- [ ] All sidebar menu items work
- [ ] Dashboard View loads
- [ ] Materi View loads
- [ ] Tryout View loads
- [ ] Latihan View loads
- [ ] Admin Dashboard (if admin)

### Logout:
- [ ] Click "Logout" button
- [ ] Confirmation modal muncul
- [ ] Confirm logout
- [ ] Redirects to landing
- [ ] Can login again

### Mobile:
- [ ] Open on mobile device
- [ ] Responsive design works
- [ ] Mobile menu works
- [ ] OAuth works on mobile
- [ ] All pages accessible

---

## 🐛 Troubleshooting

### If OAuth not working:

- [ ] Check console for errors (F12)
- [ ] Verify Supabase callback URL in Google Console (exact match)
- [ ] Verify Vercel URL in Google Console
- [ ] Verify Site URL in Supabase matches Vercel URL
- [ ] Check environment variables in Vercel
- [ ] Try incognito mode (clear cookies)
- [ ] Wait 5-10 minutes (Google/Supabase propagation)
- [ ] Redeploy on Vercel

### If build fails:

- [ ] Check Vercel build logs
- [ ] Verify all dependencies installed
- [ ] Test build locally: `npm run build`
- [ ] Check for syntax errors
- [ ] Verify import statements

### If environment variables not working:

- [ ] Verify variables set for Production, Preview, AND Development
- [ ] Check variable names (must start with `VITE_`)
- [ ] Redeploy after setting variables
- [ ] Check variables in Vercel Settings → Environment Variables

---

## ✅ Final Verification

All checks passed? Your app is ready! ✅

- [ ] ✅ Build successful
- [ ] ✅ OAuth working
- [ ] ✅ All pages accessible
- [ ] ✅ Mobile responsive
- [ ] ✅ No console errors
- [ ] ✅ Logout works

---

## 📝 Notes

**Important URLs:**
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Google Console: https://console.cloud.google.com/apis/credentials

**Documentation:**
- Full guide: `VERCEL_DEPLOY_GUIDE.md`
- OAuth fix: `GOOGLE_OAUTH_FIX.md`
- Summary: `OAUTH_FIX_SUMMARY.md`

---

## 🎉 Done!

Your app is now live on Vercel with working Google OAuth!

**Share your app:**
```
https://eduptn-utbk-prep.vercel.app
```

**Good luck! 🚀**

