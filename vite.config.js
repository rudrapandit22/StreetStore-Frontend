import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    port: 5173,
    strictPort: false, // try next port if 5173 is busy
    proxy: {
      "/api": {
        target: "https://streetstore.onrender.com",
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

