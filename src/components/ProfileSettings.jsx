import React, { useState, useEffect, useRef } from "react";
import {
  User, Globe, Link2, Instagram, Linkedin, Facebook,
  Youtube, Twitter, Save, Loader2, CheckCircle, AlertCircle,
  Camera, Mail, MapPin, Calendar, Upload, X, Image as ImageIcon
} from "lucide-react";

/**
 * ProfileSettings — Professional profile management dengan social media links dan photo upload
 * Sinkronisasi dengan Google/LinkedIn OAuth avatar
 */
export default function ProfileSettings({ user, onSave, darkMode }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    firstName: "",
    lastName: "",
    email: user?.email || "",
    avatar: user?.avatar || "", // Sync dari Google/LinkedIn
    headline: "",
    bio: "",
    language: "id",
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    tiktok: "",
    twitter: "",
    youtube: ""
  });

  useEffect(() => {
    // Priority: Always use current user data first, then check localStorage
    let currentName = user?.name || "";
    let currentEmail = user?.email || "";
    let currentAvatar = user?.avatar || "";
    
    // Load saved profile extended data from localStorage
    const storedProfile = localStorage.getItem("utbk_profile_extended");
    const storedUser = localStorage.getItem("utbk_user");
    
    // Get avatar from stored user if not in current user
    if (!currentAvatar && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.avatar) {
          currentAvatar = parsedUser.avatar;
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
      }
    }
    
    // IMPORTANT: Always use current logged-in user's name/email first
    // This ensures when switching accounts, the new account's data is shown
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        
        // Only use saved profile data if current user matches saved user
        // This prevents showing old user's data when switching accounts
        const savedUserEmail = parsed.email;
        const isSameUser = savedUserEmail === currentEmail;
        
        if (isSameUser) {
          console.log("✅ Loading saved profile for same user");
          setFormData((prev) => ({ ...prev, ...parsed }));
          
          // Set avatar preview from saved custom upload (prioritized)
          if (parsed.avatar && parsed.avatar.startsWith('data:')) {
            setAvatarPreview(parsed.avatar);
            currentAvatar = parsed.avatar; // Use custom upload
          }
        } else {
          console.log("⚠️ Different user detected - using OAuth data instead of saved profile");
        }
      } catch (error) {
        console.error("Error loading saved profile:", error);
      }
    }
    
    // Always update with current user's name and email (from OAuth)
    if (currentName) {
      const nameParts = currentName.trim().split(/\s+/);
      setFormData((prev) => ({
        ...prev,
        name: currentName,
        email: currentEmail,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || ""
      }));
    }

    // Sync avatar from OAuth if available and no custom upload
    if (currentAvatar) {
      console.log("✅ Syncing avatar:", currentAvatar.substring(0, 50) + "...");
      setFormData((prev) => ({ ...prev, avatar: currentAvatar }));
      if (!currentAvatar.startsWith('data:')) {
        setAvatarPreview(currentAvatar);
      }
    } else {
      console.log("⚠️ No avatar found");
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccessMsg("");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("File harus berupa gambar (JPG, PNG, GIF)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatarPreview(base64String);
      setUploadedAvatar(base64String);
      setFormData((prev) => ({ ...prev, avatar: base64String }));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setUploadedAvatar(null);
    setFormData((prev) => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // Combine firstName and lastName into full name
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      
      console.log("💾 Saving profile...");
      console.log("   First Name:", formData.firstName);
      console.log("   Last Name:", formData.lastName);
      console.log("   Full Name:", fullName);
      console.log("   Avatar:", formData.avatar ? formData.avatar.substring(0, 50) + "..." : "none");
      
      // Save profile extended data to localStorage
      const profileData = { 
        ...formData,
        name: fullName // Save combined name
      };
      localStorage.setItem("utbk_profile_extended", JSON.stringify(profileData));
      console.log("   ✅ Profile extended saved");
      
      // Update main user data in localStorage
      const currentUser = JSON.parse(localStorage.getItem("utbk_user") || "{}");
      const updatedUser = {
        ...currentUser,
        name: fullName,
        email: formData.email || currentUser.email,
        avatar: formData.avatar || currentUser.avatar
      };
      localStorage.setItem("utbk_user", JSON.stringify(updatedUser));
      console.log("   ✅ User data updated in localStorage");

      // TODO: Save to Railway API
      // await apiService.updateProfile(formData);

      setSuccessMsg("✅ Profil berhasil diperbarui!");
      
      // Call onSave callback to update parent component (App.jsx)
      // This will update the sidebar and all components WITHOUT page reload
      if (onSave) {
        onSave(updatedUser);
      }

      console.log("   ✅ Profile updated successfully - No reload needed!");
      
      // Keep success message visible (user can see it, won't auto-hide)
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      setError("Gagal menyimpan profil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get display avatar (uploaded > OAuth > initials)
  const getDisplayAvatar = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) return user.avatar;
    return null;
  };

  const displayAvatar = getDisplayAvatar();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header dengan Photo Upload */}
      <div className="rounded-2xl border border-gray-200 bg-linear-to-br from-white to-gray-50/30 p-6 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {/* Avatar display */}
            {displayAvatar ? (
              <div className="relative">
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-teal-500/20"
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-linear-to-br from-teal-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-teal-500/20">
                {formData.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            
            {/* Camera/Upload button */}
            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 rounded-full bg-teal-600 p-2 text-white shadow-lg hover:bg-teal-500 transition-all group-hover:scale-110"
              title="Upload foto profil"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formData.firstName || formData.lastName 
                ? `${formData.firstName} ${formData.lastName}`.trim() 
                : formData.name || "Pengguna"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">{formData.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{user?.role || "SISWA"}</p>
              {user?.provider && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                  via {user.provider === 'google' ? 'Google' : user.provider === 'linkedin' ? 'LinkedIn' : user.provider}
                </span>
              )}
            </div>
          </div>
          
          {/* Upload info */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Klik ikon kamera untuk upload
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              Maks 5MB • JPG, PNG, GIF
            </p>
          </div>
        </div>
        
        {/* Mobile upload info */}
        <div className="md:hidden mt-3 text-center">
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Klik ikon kamera untuk upload foto • Maks 5MB
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profil Publik */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-teal-600" />
            Profil Publik
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
            Tambahkan informasi tentang diri Anda
          </p>

          <div className="space-y-4">
            {/* Nama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  Nama Depan
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                  placeholder="Nama Depan"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                  placeholder="Nama Belakang"
                />
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Headline <span className="text-xs text-gray-400">(Maks 60 karakter)</span>
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleChange("headline", e.target.value.slice(0, 60))}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                placeholder='Contoh: "Pejuang PTN 2026 | Target UI Teknik"'
              />
              <p className="text-xs text-gray-400 mt-1">
                Tambahkan headline profesional, seperti "Instruktur di Udemy" atau "Arsitek".
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Biografi
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all resize-none"
                placeholder="Ceritakan tentang diri Anda, tujuan, dan pencapaian..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Tautan dan kontak eksplisit tidak diizinkan di bagian ini.
              </p>
            </div>

            {/* Bahasa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Bahasa
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tautan Sosial Media */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-teal-600" />
            Tautan
          </h3>

          <div className="space-y-4">
            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Situs web (https://...)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                placeholder="https://website-anda.com"
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                facebook.com/
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => handleChange("facebook", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                placeholder="Nama pengguna"
              />
              <p className="text-xs text-gray-400 mt-1">
                Tambahkan nama pengguna Facebook Anda (misalnya johnsmith).
              </p>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                instagram.com/
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                placeholder="Nama pengguna"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-700" />
                linkedin.com/
              </label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                placeholder="URL Profil Publik"
              />
              <p className="text-xs text-gray-400 mt-1">
                Masukkan URL profil publik LinkedIn Anda (misalnya in/johnsmith, perusahaan/udemy).
              </p>
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                tiktok.com/
              </label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => handleChange("tiktok", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                placeholder="@Username"
              />
            </div>

            {/* Twitter/X */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Twitter className="h-4 w-4 text-sky-500" />
                x.com/
              </label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => handleChange("twitter", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                placeholder="Nama pengguna"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-600" />
                youtube.com/
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => handleChange("youtube", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white transition-all"
                placeholder="Channel URL"
              />
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{successMsg}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Profil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
