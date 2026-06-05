# ✏️ Name Input Space Support - Fixed

## Problem
User tidak bisa menggunakan **spasi** saat mengetik di field "Nama Depan" atau "Nama Belakang". Ini menyebabkan nama yang panjang atau mengandung spasi tidak bisa diinput dengan benar.

Contoh masalah:
- "Muhammad Fajar" → tidak bisa ketik spasi
- "van der Berg" → tidak bisa ketik "van der"
- "de la Cruz" → tidak bisa ketik "de la"

## Root Cause

### Bad Logic (Before):
```javascript
// ❌ Nama Depan input
value={formData.name.split(" ")[0] || ""}
onChange={(e) => handleChange("name", e.target.value + " " + (formData.name.split(" ")[1] || ""))}

// ❌ Nama Belakang input
value={formData.name.split(" ")[1] || ""}
onChange={(e) => handleChange("name", (formData.name.split(" ")[0] || "") + " " + e.target.value)}
```

**Problems:**
1. Split by space `split(" ")` hanya mengambil 2 bagian (index 0 dan 1)
2. Nama dengan multiple spaces tidak bisa dihandle
3. Input spasi di tengah nama depan langsung jadi nama belakang
4. Logic terlalu kompleks dan error-prone

**Example Bug:**
- Ketik "Muhammad " → split menjadi ["Muhammad", ""]
- Lanjut ketik "Fajar" di nama depan → logic error karena sudah ada nama belakang
- Result: tidak bisa ketik spasi

## Solution Applied

### 1. Separate firstName and lastName Fields ✅

**Added to state:**
```javascript
const [formData, setFormData] = useState({
  name: user?.name || "",
  firstName: "",  // ✅ New separate field
  lastName: "",   // ✅ New separate field
  email: user?.email || "",
  // ... other fields
});
```

### 2. Smart Name Splitting on Load ✅

```javascript
useEffect(() => {
  // Load saved profile
  if (storedProfile) {
    const parsed = JSON.parse(storedProfile);
    
    // Split name into firstName and lastName if available
    if (parsed.name) {
      const nameParts = parsed.name.trim().split(/\s+/); // Split by any whitespace
      setFormData((prev) => ({
        ...prev,
        ...parsed,
        firstName: parsed.firstName || nameParts[0] || "",
        lastName: parsed.lastName || nameParts.slice(1).join(" ") || "" // Join rest with space
      }));
    }
  }
}, [user]);
```

**Smart Features:**
- Uses regex `/\s+/` to split by any amount of whitespace
- First part → firstName
- Everything else → lastName (joined with space)
- Preserves spaces in lastName
- Handles edge cases (single name, multiple spaces, etc.)

### 3. Independent Input Fields ✅

**New Clean Logic:**
```javascript
{/* Nama Depan */}
<input
  type="text"
  value={formData.firstName}
  onChange={(e) => handleChange("firstName", e.target.value)}
  placeholder="Nama Depan"
/>

{/* Nama Belakang */}
<input
  type="text"
  value={formData.lastName}
  onChange={(e) => handleChange("lastName", e.target.value)}
  placeholder="Nama Belakang"
/>
```

**Benefits:**
- ✅ Each field is independent
- ✅ Can use spaces freely
- ✅ No complex split logic on every keystroke
- ✅ Simple and maintainable

### 4. Combine on Save ✅

```javascript
const handleSubmit = async (e) => {
  // Combine firstName and lastName into full name
  const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
  
  console.log("💾 Saving profile...");
  console.log("   First Name:", formData.firstName);
  console.log("   Last Name:", formData.lastName);
  console.log("   Full Name:", fullName);
  
  const profileData = { 
    ...formData,
    name: fullName // Save combined name
  };
  
  localStorage.setItem("utbk_profile_extended", JSON.stringify(profileData));
  // ...
};
```

**How it works:**
1. User types freely in firstName and lastName (with spaces!)
2. On save, combine: `firstName + " " + lastName`
3. Trim whitespace from both ends
4. Save to localStorage as `name`
5. Compatible with existing code that expects `user.name`

### 5. Dynamic Header Display ✅

```javascript
<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
  {formData.firstName || formData.lastName 
    ? `${formData.firstName} ${formData.lastName}`.trim() 
    : formData.name || "Pengguna"}
</h2>
```

**Priority:**
1. If firstName or lastName exists → combine and display
2. Otherwise use formData.name (fallback)
3. Otherwise show "Pengguna" (default)

## Examples

### Example 1: Simple Name
**Input:**
- Nama Depan: `Muhammad`
- Nama Belakang: `Fajar`

**Saved as:**
- `name: "Muhammad Fajar"` ✅

### Example 2: Name with Space in First Name
**Input:**
- Nama Depan: `Muhammad Fajar` (with space!)
- Nama Belakang: `Wiguna`

**Saved as:**
- `name: "Muhammad Fajar Wiguna"` ✅

### Example 3: Name with Space in Last Name
**Input:**
- Nama Depan: `Juan`
- Nama Belakang: `de la Cruz` (with spaces!)

**Saved as:**
- `name: "Juan de la Cruz"` ✅

### Example 4: Complex European Name
**Input:**
- Nama Depan: `Vincent`
- Nama Belakang: `van Gogh` (with space!)

**Saved as:**
- `name: "Vincent van Gogh"` ✅

### Example 5: Loading Existing Name
**Stored:**
- `name: "Muhammad Fajar Wiguna"`

**Loaded as:**
- Nama Depan: `Muhammad`
- Nama Belakang: `Fajar Wiguna` ✅

## Testing

### Test 1: Type with Spaces
1. Buka Pengaturan Profil
2. Di "Nama Depan", ketik: `Muhammad Fajar` (dengan spasi)
3. **Expected**: Spasi berhasil diketik ✅
4. Di "Nama Belakang", ketik: `Al Wiguna` (dengan spasi)
5. **Expected**: Spasi berhasil diketik ✅

### Test 2: Save and Verify
1. Isi:
   - Nama Depan: `Muhammad Fajar`
   - Nama Belakang: `Wiguna`
2. Klik Simpan
3. Cek sidebar → Harus show: `Muhammad Fajar Wiguna` ✅
4. Cek console:
   ```
   💾 Saving profile...
      First Name: Muhammad Fajar
      Last Name: Wiguna
      Full Name: Muhammad Fajar Wiguna
   ```

### Test 3: Reload and Edit
1. Save nama dengan spasi
2. Refresh page (F5)
3. Buka Pengaturan Profil lagi
4. **Expected**: 
   - Nama Depan dan Belakang masih ada dengan spasi ✅
   - Bisa edit lagi tanpa masalah ✅

### Test 4: Edge Cases
**Single Name:**
- Nama Depan: `Madonna`
- Nama Belakang: (kosong)
- Saved as: `Madonna` ✅

**Only Last Name:**
- Nama Depan: (kosong)
- Nama Belakang: `Wiguna`
- Saved as: `Wiguna` ✅

**Multiple Spaces:**
- Nama Depan: `Muhammad   Fajar` (3 spasi)
- Saved as: `Muhammad   Fajar Wiguna` (preserves spacing) ✅

## Technical Details

### Data Structure

**In localStorage (`utbk_profile_extended`):**
```json
{
  "name": "Muhammad Fajar Wiguna",
  "firstName": "Muhammad Fajar",
  "lastName": "Wiguna",
  "email": "...",
  "avatar": "..."
}
```

**In localStorage (`utbk_user`):**
```json
{
  "name": "Muhammad Fajar Wiguna",
  "email": "...",
  "avatar": "..."
}
```

### Backward Compatibility ✅

- Old data without `firstName`/`lastName` → Auto-split on load
- New data with `firstName`/`lastName` → Used directly
- `name` field always maintained for compatibility
- Sidebar, header, modals still use `user.name`

### Regex Explanation

```javascript
const nameParts = parsed.name.trim().split(/\s+/);
```

- `trim()` - Remove leading/trailing whitespace
- `split(/\s+/)` - Split by one or more whitespace characters
  - Handles: spaces, tabs, newlines
  - `\s` = whitespace character
  - `+` = one or more
- `slice(1)` - Get everything after first part
- `join(" ")` - Rejoin with single space

**Example:**
```javascript
"Muhammad  Fajar   Wiguna".trim().split(/\s+/)
// Result: ["Muhammad", "Fajar", "Wiguna"]

// firstName = "Muhammad"
// lastName = ["Fajar", "Wiguna"].join(" ") = "Fajar Wiguna"
```

## Files Modified

1. **src/components/ProfileSettings.jsx**
   - Added `firstName` and `lastName` to state
   - Enhanced `useEffect` with smart name splitting
   - Updated input fields to use separate fields
   - Combined names on save
   - Updated header display logic

## Console Logs

### On Load:
```
✅ Syncing OAuth avatar: https://...
```

### On Save:
```
💾 Saving profile...
   First Name: Muhammad Fajar
   Last Name: Wiguna
   Full Name: Muhammad Fajar Wiguna
   Avatar: data:image/jpeg;base64...
   ✅ Profile extended saved
   ✅ User data updated in localStorage
   ✅ Profile updated successfully - No reload needed!
```

## Benefits

**Before:**
- ❌ Cannot use spaces in name fields
- ❌ Complex split logic on every keystroke
- ❌ Only supports 2-part names (first + last)
- ❌ Bug-prone and hard to maintain

**After:**
- ✅ Full space support in both fields
- ✅ Simple independent fields
- ✅ Supports any name structure
- ✅ Easy to understand and maintain
- ✅ Backward compatible with existing data

---

**Status**: ✅ FIXED  
**Last Updated**: June 2, 2026  
**Issue**: Tidak bisa menggunakan spasi di input nama  
**Solution**: Separate firstName and lastName fields, combine on save
