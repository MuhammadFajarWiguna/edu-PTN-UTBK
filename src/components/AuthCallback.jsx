import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * AuthCallback Component
 * Handles OAuth callback from Google/LinkedIn via Supabase
 * This page is shown after user authenticates with OAuth provider
 */
export default function AuthCallback({ onAuthSuccess }) {
  const [status, setStatus] = useState("processing"); // processing | success | error
  const [message, setMessage] = useState("Memproses login Anda...");

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the session from the URL hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session) {
        const user = session.user;

        // Construct user object compatible with your app
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata.full_name || user.user_metadata.name || user.email.split('@')[0],
          firstName: user.user_metadata.given_name || '',
          lastName: user.user_metadata.family_name || '',
          avatar: user.user_metadata.avatar_url || user.user_metadata.picture,
          role: 'SISWA', // Default role
          provider: user.app_metadata.provider, // google, linkedin, etc.
        };

        // Save to localStorage
        localStorage.setItem('utbk_user', JSON.stringify(userData));
        localStorage.setItem('utbk_token', session.access_token);

        console.log('🔐 OAuth Success via Supabase!');
        console.log('   User:', userData.name);
        console.log('   Email:', userData.email);
        console.log('   Provider:', userData.provider);

        setStatus("success");
        setMessage(`Selamat datang, ${userData.name}!`);

        // Wait a moment to show success message
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(userData);
          } else {
            // Fallback: reload page which will trigger App.jsx to detect logged in user
            window.location.href = '/';
          }
        }, 1500);
      } else {
        throw new Error('Tidak ada sesi ditemukan');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus("error");
      setMessage(error.message || 'Login gagal. Silakan coba lagi.');

      // Redirect to auth page after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#080C14]">
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          {status === "processing" && (
            <div className="rounded-full bg-teal-100 p-6 dark:bg-teal-900/20">
              <Loader2 className="h-12 w-12 animate-spin text-teal-600 dark:text-teal-400" />
            </div>
          )}
          {status === "success" && (
            <div className="rounded-full bg-emerald-100 p-6 dark:bg-emerald-900/20">
              <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
          {status === "error" && (
            <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          )}
        </div>

        {/* Message */}
        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          {status === "processing" && "Memproses Login"}
          {status === "success" && "Login Berhasil!"}
          {status === "error" && "Login Gagal"}
        </h1>
        
        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
          {message}
        </p>

        {status === "error" && (
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-teal-500 transition-colors"
          >
            Kembali ke Halaman Login
          </button>
        )}

        {/* Loading dots */}
        {status === "processing" && (
          <div className="mt-8 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-teal-600 animate-bounce dark:bg-teal-400"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
