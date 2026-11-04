import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' + single file: o dist/index.html abre direto com duplo clique (file://),
// sem servidor e sem internet — essencial para o dia da banca.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 4000
  }
})
