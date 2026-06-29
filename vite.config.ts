import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Static output, ideal for Cloudflare Pages / Netlify / GitHub Pages.
    outDir: 'dist',
    sourcemap: false,
  },
});
