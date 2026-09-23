import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { APP_VERSION } from './src/config/version';
import { observatorioData } from './src/data/observatorioData';
import { sourceRegistry } from './src/data/sourceRegistry';

const publicApiPlugin = (): Plugin => ({
  name: 'observatorio-public-api',
  generateBundle() {
    const payload = {
      schemaVersion: 1,
      apiVersion: '1.0',
      edition: observatorioData.meta.edition,
      municipality: observatorioData.meta.municipality,
      datasetUpdatedAt: observatorioData.meta.updatedAt,
      buildGeneratedAt: new Date().toISOString(),
      data: observatorioData,
    };
    this.emitFile({
      type: 'asset',
      fileName: 'api/v1/observatorio.json',
      source: JSON.stringify(payload, null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v1/health.json',
      source: JSON.stringify({
        schemaVersion: 1,
        status: 'ok',
        appVersion: APP_VERSION,
        edition: observatorioData.meta.edition,
        datasetUpdatedAt: observatorioData.meta.updatedAt,
        buildGeneratedAt: new Date().toISOString(),
        publicPath: '/observatorio/',
      }, null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v1/sources.json',
      source: JSON.stringify({
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        sources: sourceRegistry.map(({ id, label, institution, url, resourceUrl, updateFrequency, referenceDate, publishedAt, nature }) => ({
          id, label, institution, url, resourceUrl, updateFrequency, referenceDate, publishedAt, nature,
        })),
      }, null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v1/openapi.json',
      source: JSON.stringify({
        openapi: '3.0.3',
        info: {
          title: 'Observatório Águas Lindas — API pública',
          version: APP_VERSION,
          description: 'Snapshot público estático gerado a cada build a partir da mesma fonte usada pela interface. A versão publicada é identificada pelo contrato de saúde.',
        },
        servers: [{ url: '/observatorio' }],
        paths: {
          '/api/v1/observatorio.json': {
            get: { summary: 'Dataset consolidado da edição publicada', responses: { '200': { description: 'JSON do observatório' } } },
          },
          '/api/v1/openapi.json': {
            get: { summary: 'Especificação OpenAPI', responses: { '200': { description: 'OpenAPI JSON' } } },
          },
          '/api/v1/health.json': {
            get: { summary: 'Estado do build publicado', responses: { '200': { description: 'Metadados do build e dataset' } } },
          },
          '/api/v1/sources.json': {
            get: { summary: 'Registro de fontes do observatório', responses: { '200': { description: 'Fontes e metadados de referência' } } },
          },
        },
      }, null, 2),
    });
  },
});

export default defineConfig({
  base: '/observatorio/',
  plugins: [
    publicApiPlugin(),
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
        clientsClaim: true,
        skipWaiting: true,

      },
    }),
  ],
  server: { host: '0.0.0.0', port: 5173 },
});
