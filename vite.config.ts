import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    // Static output, ideal for Cloudflare Pages / Netlify / GitHub Pages.
    outDir: 'dist',
    sourcemap: false,
  },
});