import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // pdf.js worker needs to be available
    include: ['pdfjs-dist'],
  },
})
