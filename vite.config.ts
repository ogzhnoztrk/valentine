import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base keeps GitHub project pages and user pages on the same build.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
