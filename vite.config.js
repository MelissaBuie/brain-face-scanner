/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from /brain-face-scanner/, so the build sets VITE_BASE to that.
  base: process.env.VITE_BASE || '/',
})
