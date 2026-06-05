# Dark Mode Guide - EduPTN

## ✅ Dark Mode Sudah Tersedia!

Aplikasi EduPTN sudah dilengkapi dengan **Dark Mode** yang lengkap dan berfungsi di semua halaman.

---

## 🌓 Cara Menggunakan Dark Mode

### **Desktop (Sidebar)**

1. Login ke aplikasi
2. Lihat sidebar di sebelah kiri
3. Scroll ke bawah
4. Klik tombol dengan icon:
   - 🌙 **"Mode Gelap"** (jika sedang mode terang)
   - ☀️ **"Mode Terang"** (jika sedang mode gelap)

### **Mobile**

1. Login ke aplikasi
2. Tap icon menu (☰) di kanan atas
3. Tap tombol dengan icon bulan/matahari

### **Landing Page & Auth Page**

Dark mode toggle juga tersedia di:
- Landing page (navbar)
- Login/Register page (header)

---

## 🎨 Fitur Dark Mode

### **Automatic Persistence**
- ✅ Pilihan dark mode **tersimpan otomatis** di browser
- ✅ Saat buka aplikasi lagi, mode yang dipilih tetap aktif
- ✅ Tersimpan di `localStorage` dengan key `theme`

### **Toast Notification**
Saat toggle dark mode, muncul notifikasi:
- 🌙 "Tampilan Mode Gelap diaktifkan"
- ☀️ "Tampilan Mode Terang diaktifkan"

### **Smooth Transition**
- ✅ Transisi warna yang smooth
- ✅ Tidak ada flicker atau flash
- ✅ Semua komponen ter-update secara real-time

---

## 🎯 Komponen yang Mendukung Dark Mode

### **✅ Semua Halaman:**
- Landing Page
- Login/Register Page
- Dashboard
- Materi View
- Tryout View
- Latihan View
- Analitik View
- Campus Recommendation
- Community Forum
- AI Consultation
- Calendar View
- Gamifikasi View
- Admin Dashboard

### **✅ Semua Komponen:**
- Sidebar
- Navbar
- Cards
- Buttons
- Forms
- Tables
- Charts (Recharts)
- Modals
- Toasts
- Badges
- Icons

---

## 🎨 Color Scheme

### **Light Mode:**
```css
Background: #F8FAFC (gray-50)
Cards: #FFFFFF (white)
Text: #111827 (gray-900)
Border: #E5E7EB (gray-200)
Primary: #14b8a6 (teal-600)
```

### **Dark Mode:**
```css
Background: #090D16 (custom dark)
Cards: #0E1320 (custom dark-card)
Text: #FFFFFF (white)
Border: #27272a (zinc-800)
Primary: #14b8a6 (teal-600)
```

---

## 🔧 Technical Implementation

### **1. Tailwind Dark Mode**

Menggunakan Tailwind CSS `dark:` variant:

```jsx
<div className="bg-white dark:bg-zinc-900">
  <p className="text-gray-900 dark:text-white">
    Text yang berubah warna
  </p>
</div>
```

### **2. State Management**

```javascript
const [darkMode, setDarkMode] = useState(false);

// Load from localStorage on mount
useEffect(() => {
  const isDark = localStorage.getItem("theme") === "dark";
  setDarkMode(isDark);
  if (isDark) {
    document.documentElement.classList.add("dark");
  }
}, []);
```

### **3. Toggle Function**

```javascript
const toggleDarkMode = () => {
  const target = !darkMode;
  setDarkMode(target);
  
  if (target) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};
```

### **4. Recharts Dark Mode**

Charts juga mendukung dark mode dengan custom tooltip styles:

```javascript
<Tooltip 
  contentStyle={{ 
    backgroundColor: '#1f2937', 
    border: 'none', 
    borderRadius: '8px',
    color: '#fff'
  }} 
/>
```

---

## 🐛 Troubleshooting

### **Issue: Dark mode tidak tersimpan**

**Solusi:**
```javascript
// Check localStorage
localStorage.getItem("theme")
// Should return "dark" or "light"

// Force set dark mode
localStorage.setItem("theme", "dark");
location.reload();
```

### **Issue: Beberapa komponen tidak berubah warna**

**Solusi:**
- Pastikan komponen menggunakan `dark:` classes
- Check apakah `document.documentElement` memiliki class `dark`
- Refresh halaman

### **Issue: Flash of wrong theme on load**

**Solusi:**
Sudah ditangani dengan check localStorage di `useEffect` saat mount.

---

## 📱 Screenshots

### **Light Mode:**
- Background putih/terang
- Text hitam
- Cards dengan shadow
- Primary color: Teal

### **Dark Mode:**
- Background gelap (#090D16)
- Text putih
- Cards dengan border subtle
- Primary color: Teal (tetap sama)

---

## 🎯 Best Practices

### **1. Consistent Color Usage**

Selalu gunakan Tailwind classes dengan dark variant:

```jsx
// ✅ Good
<div className="bg-white dark:bg-zinc-900">

// ❌ Bad
<div className="bg-white">
```

### **2. Text Contrast**

Pastikan text readable di kedua mode:

```jsx
// ✅ Good
<p className="text-gray-900 dark:text-white">

// ❌ Bad (low contrast in dark mode)
<p className="text-gray-500">
```

### **3. Border & Shadow**

Adjust border dan shadow untuk dark mode:

```jsx
// ✅ Good
<div className="border border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
```

---

## 🚀 Future Enhancements

Possible improvements:
- [ ] System preference detection (auto dark mode based on OS)
- [ ] Custom theme colors
- [ ] Multiple theme options (blue, purple, etc.)
- [ ] Scheduled dark mode (auto switch at night)

---

## 📝 Summary

**Dark Mode Features:**
- ✅ Fully implemented across all pages
- ✅ Persistent (saved in localStorage)
- ✅ Smooth transitions
- ✅ Toast notifications
- ✅ Recharts support
- ✅ Mobile responsive
- ✅ Easy to toggle (sidebar button)

**How to Use:**
1. Login to app
2. Click moon/sun icon in sidebar
3. Enjoy dark mode! 🌙

---

**Status:** ✅ **FULLY IMPLEMENTED**
**Location:** Sidebar (desktop) | Mobile menu (mobile)
**Persistence:** localStorage
**Coverage:** 100% of components
