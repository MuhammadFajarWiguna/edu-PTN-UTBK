# 🔐 Google OAuth Fix untuk Vercel Deployment

**Problem:** Google OAuth tidak berfungsi setelah deploy ke Vercel  
**Solution:** Konfigurasi serverless functions & environment variables  

---

## ⚠️ Masalah yang Umum Terjadi

Saat deploy ke Vercel, Google OAuth gagal karena:

1. ❌ **Server.js tidak berjalan di Vercel** - Vercel adalah platform serverless
2. ❌ **Session middleware tidak bekerja** - Setiap request bisa ke instance berbeda
3. ❌ **Callback URL salah** - Masih menggunakan localhost
4. ❌ **Environment variables tidak dikonfigurasi**
5. ❌ **Google Cloud Console redirect URIs belum ditambahkan**

---

## ✅ Solusi Lengkap

### Strategi:

**Karena Vercel tidak support Express server dengan session**, kita akan menggunakan dua pendekatan:

**Pilihan 1: Frontend-Only OAuth (Recommended untuk Vercel)**
- Gunakan Supabase Auth yang sudah terintegrasi dengan Google OAuth
- Atau gunakan Google OAuth dengan implicit flow (frontend only)

**Pilihan 2: Deploy Express Server di Railway/Render**
- Deploy `server.js` ke Railway atau Render
- Vercel hanya hosting frontend (static files)
- OAuth flow melalui backend di Railway

---

## 🚀 Solusi 1: Menggunakan Supabase Auth (Recommended)

Supabase sudah menyediakan OAuth integration yang sempurna untuk Vercel.

### Step 1: Enable Google OAuth di Supabase

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Go to **Authentication** → **Providers**
4. Enable **Google**
5. Masukkan:
   ```
   Google Client ID: YOUR_GOOGLE_CLIENT_ID
   Google Client Secret: YOUR_GOOGLE_CLIENT_SECRET
   ```
6. Copy **Callback URL** dari Supabase (contoh: `https://xxx.supabase.co/auth/v1/callback`)

### Step 2: Konfigurasi Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Pilih OAuth 2.0 Client ID Anda
3. Tambahkan **Authorized redirect URIs**:
   ```
   https://ysveoqfelzwdldhzkkws.supabase.co/auth/v1/callback
   https://your-app.vercel.app
   http://localhost:5001/auth/google/callback
   ```
4. Klik **Save**

### Step 3: Update AuthPage.jsx

Ganti button Google OAuth dengan Supabase Auth:

```javascript
// Di AuthPage.jsx

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Google OAuth button handler
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    console.error('OAuth error:', error);
    setError('Login dengan Google gagal: ' + error.message);
  }
};

// Di button:
<button onClick={handleGoogleLogin}>
  Lanjutkan dengan Google
</button>
```

### Step 4: Buat Callback Handler

Create file: `src/pages/AuthCallback.jsx`

```javascript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const user = session?.user;
        
        if (user) {
          // Save to localStorage
          const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata.full_name || user.email.split('@')[0],
            avatar: user.user_metadata.avatar_url,
            role: 'SISWA',
            provider: 'google'
          };
          
          localStorage.setItem('utbk_user', JSON.stringify(userData));
          localStorage.setItem('utbk_token', session.access_token);
          
          // Redirect to dashboard
          navigate('/dashboard');
        }
      }
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Memproses login...</p>
      </div>
    </div>
  );
}
```

### Step 5: Environment Variables di Vercel

Di Vercel Dashboard → Settings → Environment Variables:

```bash
VITE_SUPABASE_URL=https://ysveoqfelzwdldhzkkws.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 6: Update Site URL di Supabase

Di Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://your-app.vercel.app
Redirect URLs:
  - https://your-app.vercel.app
  - https://your-app.vercel.app/auth/callback
  - https://your-app-*.vercel.app  (untuk preview deployments)
  - http://localhost:5001
```

---

## 🛠️ Solusi 2: Deploy Backend ke Railway (Hybrid Approach)

Jika Anda ingin tetap menggunakan Express server dengan Passport.js:

### Step 1: Deploy Server.js ke Railway

1. Create new project di [Railway](https://railway.app)
2. Connect GitHub repository
3. Set root directory ke `/` (project root)
4. Set start command: `node server.js`
5. Add environment variables:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=https://your-railway-app.up.railway.app/auth/google/callback
   SESSION_SECRET=your_super_secret_key_here
   SUPABASE_URL=https://ysveoqfelzwdldhzkkws.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   NODE_ENV=production
   ```

### Step 2: Update Google Cloud Console

Tambahkan Railway callback URL:

```
Authorized redirect URIs:
  - https://your-railway-app.up.railway.app/auth/google/callback
  - https://your-app.vercel.app
  - http://localhost:5001/auth/google/callback
```

### Step 3: Update server.js

Tambahkan CORS untuk Vercel domain:

```javascript
import cors from 'cors';

// Add CORS middleware
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'https://your-app-*.vercel.app',
    'http://localhost:5001'
  ],
  credentials: true
}));

// Update Google callback redirect
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
  (req, res) => {
    const user = req.user;
    const token = Buffer.from(JSON.stringify({
      id: user.id,
      email: user.email,
      timestamp: Date.now()
    })).toString('base64');

    // Redirect ke Vercel frontend
    const frontendUrl = process.env.FRONTEND_URL || 'https://your-app.vercel.app';
    const redirectUrl = `${frontendUrl}/?google_auth=success&user=${encodeURIComponent(JSON.stringify(user))}&token=${token}`;
    res.redirect(redirectUrl);
  }
);
```

### Step 4: Update AuthPage.jsx

Point ke Railway backend:

```javascript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-railway-app.up.railway.app';

// Google OAuth button
<button
  type="button"
  onClick={() => (window.location.href = `${BACKEND_URL}/auth/google`)}
  className="..."
>
  Lanjutkan dengan Google
</button>
```

### Step 5: Environment Variables di Vercel

```bash
VITE_BACKEND_URL=https://your-railway-app.up.railway.app
VITE_SUPABASE_URL=https://ysveoqfelzwdldhzkkws.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🔍 Debugging OAuth Issues

### Check 1: Console Errors

Open browser console (F12) dan cek errors:

```javascript
// Should see:
"🔐 Google OAuth Success!"
"User: Your Name"
"Email: your@email.com"

// If error:
"Error parsing Google auth data"
"Login dengan Google gagal"
```

### Check 2: Network Tab

1. Open Network tab (F12 → Network)
2. Click "Continue with Google"
3. Check requests:
   ```
   GET /auth/google → Should redirect to Google
   GET /auth/google/callback → Should return 302 redirect
   GET /?google_auth=success&user=... → Should have user data
   ```

### Check 3: Railway/Backend Logs

If using Railway:
1. Go to Railway dashboard
2. Open your deployment
3. Check logs:
   ```
   [Google OAuth] User authenticated: user@email.com
   ```

### Check 4: Google Cloud Console

1. Go to APIs & Services → Credentials
2. Click your OAuth client
3. Verify redirect URIs match exactly:
   ```
   ✅ https://ysveoqfelzwdldhzkkws.supabase.co/auth/v1/callback
   ✅ https://your-app.vercel.app
   ❌ http://your-app.vercel.app (HTTP won't work)
   ```

### Common Errors & Solutions:

| Error | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Add exact URL to Google Console |
| `Access blocked` | Enable Google+ API in Google Cloud |
| `Invalid token` | Check SUPABASE_ANON_KEY in env vars |
| `CORS error` | Add Vercel domain to backend CORS |
| `Session undefined` | Use Supabase Auth instead of Express session |
| `404 /auth/google` | Backend not deployed or wrong URL |

---

## ✅ Testing Checklist

### Local Testing (Before Deploy):

- [ ] `npm run dev` works
- [ ] Click "Continue with Google"
- [ ] Google popup appears
- [ ] After auth, redirects to dashboard
- [ ] User data saved to localStorage
- [ ] Check console for success message

### Vercel Testing (After Deploy):

- [ ] Deploy to Vercel succeeds
- [ ] Visit production URL
- [ ] Click "Continue with Google"
- [ ] Google popup appears (not error page)
- [ ] After auth, redirects back to Vercel URL
- [ ] Login successful
- [ ] User can access dashboard
- [ ] Avatar shows up (if provided by Google)
- [ ] No console errors

---

## 📝 Recommended: Supabase Auth

**Why Supabase Auth is better for Vercel:**

✅ **Serverless-friendly** - No need for Express server  
✅ **Built-in session management** - Works across serverless functions  
✅ **Automatic token refresh** - Handles expired tokens  
✅ **Multi-provider support** - Google, GitHub, LinkedIn, etc.  
✅ **RLS integration** - Row Level Security built-in  
✅ **Free tier** - 50,000 active users  

---

## 🚀 Quick Setup (Supabase Auth)

1. **Update AuthPage.jsx** - Use Supabase signInWithOAuth
2. **Create AuthCallback page** - Handle OAuth redirect
3. **Update Google Console** - Add Supabase callback URL
4. **Deploy to Vercel** - Set environment variables
5. **Test** - Login with Google

**Time: ~15 minutes**

---

## 🔗 Useful Links

- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Railway Deploy Guide](https://docs.railway.app/deploy/deployments)

---

## 📧 Need Help?

If OAuth still not working:

1. Check Vercel deployment logs
2. Check browser console errors
3. Verify all redirect URIs in Google Console
4. Ensure environment variables are set in Vercel
5. Test with incognito mode (clear cookies)

---

**Recommendation:** Gunakan **Solusi 1 (Supabase Auth)** untuk deployment paling mudah dan reliable di Vercel.

