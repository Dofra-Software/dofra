import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  // El objeto 3D (three.js) se carga en un chunk diferido de ~220 kB gzip; no bloquea la carga inicial.
  build: { chunkSizeWarningLimit: 900 },
})
