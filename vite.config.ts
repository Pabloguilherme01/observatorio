import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { APP_VERSION } from './src/config/version';

export default defineConfig({
  base: '/observatorio/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Observatório Águas Lindas 2026',
        short_name: 'Obs 2026',
        description: 'Observatório público de dados eleitorais e municipais de Águas Lindas de Goiás.',
        id: `observatorio-aguas-lindas-2026-${APP_VERSION}`,
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/observatorio/',
        scope: '/observatorio/',
        icons: [
          { src: '/observatorio/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/observatorio/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      includeAssets: ['pwa-192.svg', 'pwa-512.svg', 'offline.html'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => ['script', 'style', 'image', 'font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: `observatorio-static-assets-${APP_VERSION}`,
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: `observatorio-pages-${APP_VERSION}`,
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: { host: '0.0.0.0', port: 5173 },
});
