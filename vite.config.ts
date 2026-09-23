import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative assets keep the static build valid on GitHub Pages
  // project URLs (/observatorio/) and when the artifact is previewed elsewhere.
  base: './',
  plugins: [react(), tailwindcss()],
  server: { host: '0.0.0.0', port: 5173 },
});
