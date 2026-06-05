import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Expose RAILWAY_API_URL ke frontend sebagai import.meta.env.VITE_RAILWAY_API_URL
    define: {
      'import.meta.env.VITE_RAILWAY_API_URL': JSON.stringify(
        env.RAILWAY_API_URL || 'https://utbk-backend-production.up.railway.app/api/v1'
      ),
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
