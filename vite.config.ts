import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 ESSENCIAL NA VERCEL
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
