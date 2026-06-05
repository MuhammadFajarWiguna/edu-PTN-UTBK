# 🔐 Logout Modal Avatar Display - Fixed

## Problem
Foto profil di **Logout Confirmation Modal** tidak menampilkan foto yang sudah diupload/sync dari OAuth. Modal hanya menampilkan initial (huruf pertama nama).

## Root Cause
1. `LogoutConfirmModal.jsx` hanya render initial, tidak cek apakah `user.avatar` ada
2. User state di App.jsx tidak di-refresh sebelum modal dibuka
3. Tidak ada listener untuk refresh avatar saat data berubah

## Solution Applied

### 1. Enhanced LogoutConfirmModal Avatar Display
**File**: `src/components/LogoutConfirmModal.jsx`

Added photo display with fallback to initials:
```jsx
{/* Avatar - show photo if available, otherwise initial */}
{user?.avatar ? (
  <img
    src={user.avatar}
    alt={subjectName || "User"}
    className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm"
    onError={(e) => {
      // Fallback ke initials jika gambar error
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
    }}
  />
) : null}
<div
  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow ${
    isAdminForcingOther ? "bg-blue-500" : isAdmin ? "bg-amber-500" : "bg-teal-600"
  }`}
  style={{ display: user?.avatar ? 'none' : 'flex' }}
>
  {subjectName?.charAt(0)?.toUpperCase() || "U"}
</div>
```

**Features**:
- Shows photo if `user.avatar` exists
- Fallback to initials if photo fails to load
- Maintains color coding (teal for siswa, amber for admin)
- Smooth transition between photo and initial

### 2. Refresh User Data Before Logout Modal
**File**: `src/App.jsx` - `requestLogout` function

```jsx
const requestLogout = () => {
  // Refresh user data dari localStorage sebelum show modal
  // Ini memastikan avatar terbaru ditampilkan di modal
  try {
    const storedUser = localStorage.getItem("utbk_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Update user state dengan data terbaru
    }
  } catch (error) {
    console.error("Error loading user for logout modal:", error);
  }
  
  setShowLogoutModal(true);
  setMobileMenuOpen(false);
};
```

**Why This Works**:
- When user clicks logout button, `requestLogout` runs first
- Before showing modal, it reads latest user data from localStorage
- This catches any avatar updates that were saved but not yet in state
- Modal then receives fresh user data with updated avatar

### 3. Auto-Refresh on Window Focus
**File**: `src/App.jsx` - `useEffect` hook

```jsx
// Refresh user data when window regains focus
// This ensures avatar is always up-to-date
const handleFocus = () => {
  try {
    const storedUser = localStorage.getItem("utbk_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser((prevUser) => {
        // Only update if there's a change to avoid unnecessary re-renders
        if (JSON.stringify(prevUser) !== JSON.stringify(parsedUser)) {
          console.log("🔄 User data refreshed from localStorage");
          return parsedUser;
        }
        return prevUser;
      });
    }
  } catch (error) {
    console.error("Error refreshing user data:", error);
  }
};

window.addEventListener('focus', handleFocus);
```

**Use Cases**:
- User uploads photo in Profile Settings
- User switches to another tab/app
- User comes back to the app
- Avatar automatically refreshes from localStorage
- No manual refresh needed

## Flow Diagram

```
User Upload Photo
    ↓
ProfileSettings saves to localStorage['utbk_user']
    ↓
Page reloads (or window focus event triggers)
    ↓
App.jsx reads from localStorage
    ↓
User state updated with new avatar
    ↓
User clicks Logout button
    ↓
requestLogout() refreshes user from localStorage (extra safety)
    ↓
Modal opens with fresh user data
    ↓
LogoutConfirmModal checks user.avatar
    ↓
If avatar exists → Show photo ✅
If not → Show initial ✅
```

## Testing

### Test 1: OAuth Avatar in Logout Modal
1. Login dengan Google (yang punya foto profil)
2. Klik tombol Logout
3. **Expected**: Modal menampilkan foto profil Google, bukan initial

### Test 2: Custom Upload Avatar in Logout Modal
1. Login
2. Buka Pengaturan Profil
3. Upload custom photo
4. Simpan
5. Setelah reload, klik Logout
6. **Expected**: Modal menampilkan custom photo yang baru diupload

### Test 3: Avatar Update Reflection
1. Upload foto di tab pertama
2. Simpan (page reload)
3. Buka tab kedua (sama URL)
4. Di tab kedua, klik Logout
5. **Expected**: Modal show foto yang diupload di tab pertama

### Test 4: Fallback to Initial
1. Remove all avatar (X button di ProfileSettings)
2. Simpan
3. Klik Logout
4. **Expected**: Modal show initial (huruf pertama), bukan broken image

### Test 5: Window Focus Refresh
1. Upload foto
2. Simpan
3. Switch ke aplikasi lain (Chrome loses focus)
4. Switch balik ke browser
5. Cek console - harus ada log "🔄 User data refreshed from localStorage"
6. Sidebar dan semua komponen show avatar terbaru

## Files Modified

1. **src/components/LogoutConfirmModal.jsx**
   - Added avatar image display with fallback
   - Maintains color coding for different roles
   - Error handling for broken images

2. **src/App.jsx**
   - Enhanced `requestLogout()` to refresh user before modal
   - Added window focus listener to auto-refresh avatar
   - Prevents unnecessary re-renders with state comparison

## Console Logs

### User Refresh on Focus:
```
🔄 User data refreshed from localStorage
```

## Related Documentation
- `PHOTO_UPLOAD_AVATAR_SYNC_FIX.md` - Main avatar sync implementation
- `TESTING_INSTRUCTIONS.md` - Complete testing guide

---

**Status**: ✅ FIXED  
**Last Updated**: June 2, 2026  
**Issue**: Logout modal tidak menampilkan foto profil yang sudah diupdate  
**Solution**: Enhanced modal to show photo + auto-refresh user state
