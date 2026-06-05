# Railway API Integration - Troubleshooting Guide

## Problem: User Role Not Syncing from Railway

### Symptoms:
- Error: `403 Forbidden` when accessing `/api/v1/tryout`
- Error message: `Akses ditolak. Diperlukan role: SISWA`
- User `abu@gmail.com` is ADMIN in Railway/Supabase but shows as SISWA in frontend

### Root Cause:
1. **Stale localStorage data** - Old user data cached before role was changed in Railway
2. **Token not refreshing** - Old token doesn't reflect new role
3. **Fallback to mock data** - If Railway fails, system uses localStorage with old role

---

## Solution Steps

### Step 1: Clear Browser Data (REQUIRED)

**Option A - Clear All Data:**
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Option B - Clear Specific Keys:**
```javascript
// Open browser console (F12) and run:
localStorage.removeItem('utbk_token');
localStorage.removeItem('utbk_user');
location.reload();
```

### Step 2: Re-login with Railway Account

1. After clearing data, you'll be logged out
2. Go to login page
3. Login with Railway credentials:
   - Email: `abu@gmail.com`
   - Password: (your Railway password)
4. System will call `/auth/login` → `/auth/me` to get fresh role
5. Check console for: `[Railway] Login berhasil, user role: ADMIN`

### Step 3: Verify Role in Console

After login, check browser console:
```javascript
// Should show ADMIN role
JSON.parse(localStorage.getItem('utbk_user'))
```

Expected output:
```json
{
  "id": "...",
  "email": "abu@gmail.com",
  "name": "ABU",
  "role": "ADMIN",
  ...
}
```

---

## Code Changes Made

### 1. Enhanced Login Flow (`src/utils/api.js`)

```javascript
login: async (email, password) => {
  // 1. Call /auth/login to get token
  const data = await authApi.login(email, password);
  const token = data.token;
  
  // 2. Save token temporarily
  saveSession(userFromLogin, token);
  
  // 3. Call /auth/me to get FULL user data with role
  const meData = await authApi.me();
  const fullUser = normalizeUser(meData);
  
  // 4. Save complete user data with correct role
  saveSession(fullUser, token);
  
  return { user: fullUser, token };
}
```

### 2. Force Refresh User Data (`src/utils/api.js`)

```javascript
getCurrentUser: async () => {
  const token = localStorage.getItem("utbk_token");
  
  // Always fetch from Railway API for real tokens
  if (token && !token.startsWith("mock-jwt")) {
    const data = await authApi.me();
    const user = data.user || data;
    saveSession(user, token); // Update cache
    return user;
  }
  
  // Fallback to cache only for mock tokens
  return JSON.parse(localStorage.getItem("utbk_user"));
}
```

### 3. Added Refresh Function

```javascript
refreshUserFromRailway: async () => {
  const token = localStorage.getItem("utbk_token");
  if (!token || token.startsWith("mock-jwt")) {
    return null;
  }
  
  const data = await authApi.me();
  const user = data.user || data;
  saveSession(user, token);
  console.log("[Railway] User data refreshed:", user);
  return user;
}
```

---

## Debugging Checklist

### ✅ Check Railway API Connection

```bash
# Test Railway API health
curl https://utbk-backend-production.up.railway.app/health

# Expected: {"status":"ok"}
```

### ✅ Check Token in Browser

```javascript
// Open console (F12)
localStorage.getItem('utbk_token')

// Should NOT start with "mock-jwt-"
// Should be a real JWT token from Railway
```

### ✅ Check User Role

```javascript
// Open console (F12)
const user = JSON.parse(localStorage.getItem('utbk_user'));
console.log('User role:', user.role);

// Should show: "ADMIN" for abu@gmail.com
```

### ✅ Check Network Requests

1. Open DevTools → Network tab
2. Login with abu@gmail.com
3. Look for requests to:
   - `POST /api/v1/auth/login` → Should return 200
   - `GET /api/v1/auth/me` → Should return 200 with role: "ADMIN"

### ✅ Check Console Logs

After login, console should show:
```
[Railway] Attempting login for: abu@gmail.com
LOGIN RESPONSE: {token: "...", user: {...}}
[Railway] Login berhasil, user role: ADMIN
```

---

## Common Issues & Fixes

### Issue 1: Still Shows SISWA After Re-login

**Cause:** Browser cache not cleared properly

**Fix:**
```javascript
// Hard clear
localStorage.clear();
sessionStorage.clear();
// Close all tabs
// Reopen browser
// Login again
```

### Issue 2: 403 Forbidden on Tryout Endpoint

**Cause:** Railway API expects SISWA role for `/api/v1/tryout` endpoint

**Fix:** According to Railway docs, tryout endpoints require SISWA role. Admin should use admin-specific endpoints or the role check needs to be updated in Railway backend.

**Workaround:** Admin can view tryouts through admin dashboard endpoints instead.

### Issue 3: Token Expired

**Cause:** JWT token expired (usually 24 hours)

**Fix:**
```javascript
// Logout and login again
apiService.logout();
// Then login with fresh credentials
```

### Issue 4: Railway API Down

**Cause:** Railway service offline or restarting

**Fix:**
- Check Railway dashboard
- Wait for service to restart
- System will show error instead of falling back to mock data

---

## Testing Admin Features

### 1. Test Admin Dashboard Access

```javascript
// After login as admin, check sidebar
// Should see: "Dashboard Admin 🛡️" with pulse animation
```

### 2. Test Admin Endpoints

```javascript
// In console:
const response = await fetch('https://utbk-backend-production.up.railway.app/api/v1/dashboard/admin', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('utbk_token')}`
  }
});
const data = await response.json();
console.log('Admin dashboard data:', data);
```

### 3. Test CRUD Operations

Once logged in as ADMIN:
- ✅ Create soal (POST /api/v1/soal)
- ✅ Update soal (PUT /api/v1/soal/:id)
- ✅ Delete soal (DELETE /api/v1/soal/:id)
- ✅ View all users (GET /api/v1/dashboard/admin)
- ✅ Change user role (PATCH /api/v1/auth/role)

---

## Next Steps

1. **Clear browser data** (localStorage)
2. **Re-login** with abu@gmail.com
3. **Verify role** in console
4. **Test admin features**
5. If still issues, check Railway backend logs

---

## Contact

If issues persist after following all steps:
1. Check Railway backend is running
2. Verify abu@gmail.com has ADMIN role in Supabase database
3. Check Railway logs for authentication errors
4. Ensure SUPABASE_SERVICE_KEY is correctly configured in Railway

---

**Status:** ✅ Integration code updated
**Action Required:** User must clear localStorage and re-login
