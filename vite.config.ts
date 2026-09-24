import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { APP_VERSION } from './src/config/version';
import { observatorioData } from './src/data/observatorioData';
import { sourceRegistry } from './src/data/sourceRegistry';

const getObservatorioPayload = () => ({
  schemaVersion: 1,
  apiVersion: '1.0',
  edition: observatorioData.meta.edition,
  municipality: observatorioData.meta.municipality,
  datasetUpdatedAt: observatorioData.meta.updatedAt,
  buildGeneratedAt: new Date().toISOString(),
  data: observatorioData,
});

const getHealthPayload = () => ({
  schemaVersion: 1,
  status: 'ok',
  appVersion: APP_VERSION,
  edition: observatorioData.meta.edition,
  datasetUpdatedAt: observatorioData.meta.updatedAt,
  buildGeneratedAt: new Date().toISOString(),
  publicPath: '/',
});

const getSourcesPayload = () => ({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sources: sourceRegistry.map(({ id, label, institution, url, resourceUrl, updateFrequency, referenceDate, publishedAt, nature }) => ({
    id, label, institution, url, resourceUrl, updateFrequency, referenceDate, publishedAt, nature,
  })),
});

const getOpenApiPayload = () => ({
  openapi: '3.0.3',
  info: {
    title: 'Observatório Águas Lindas — API pública',
    version: APP_VERSION,
    description: 'Snapshot público estático gerado a cada build a partir da mesma fonte usada pela interface.',
  },
  servers: [{ url: '/' }],
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
});

const publicApiPlugin = (): Plugin => ({
  name: 'observatorio-public-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/v1/observatorio.json') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(getObservatorioPayload(), null, 2));
      }
      if (req.url === '/api/v1/health.json') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(getHealthPayload(), null, 2));
      }
      if (req.url === '/api/v1/sources.json') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(getSourcesPayload(), null, 2));
      }
      if (req.url === '/api/v1/openapi.json') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(getOpenApiPayload(), null, 2));
      }
      next();
    });
  },
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'api/v1/observatorio.json',
      source: JSON.stringify(getObservatorioPayload(), null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v1/health.json',
      source: JSON.stringify(getHealthPayload(), null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v1/sources.json',
      source: JSON.stringify(getSourcesPayload(), null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v1/openapi.json',
      source: JSON.stringify(getOpenApiPayload(), null, 2),
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
        short_name: 'Observatório 2026',
        description: 'Dados públicos eleitorais e municipais de Águas Lindas de Goiás, com fontes rastreáveis.',
        lang: 'pt-BR',
        dir: 'ltr',
        id: '/observatorio/',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/observatorio/',
        scope: '/observatorio/',
        categories: ['public-services', 'education'],
        prefer_related_applications: false,
        icons: [
          { src: '/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      includeAssets: ['pwa-192.svg', 'pwa-512.svg', 'offline.html'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,json}'],
        navigateFallback: '/observatorio/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => ['script', 'style', 'image'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'observatorio-static-v8',
              expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 180, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'observatorio-fonts-v7',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 180, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'document' && request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'observatorio-documents-v8',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'observatorio-api-v8',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 7, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        cacheId: 'observatorio-aguas-lindas',
      },
    }),
  ],
  server: { host: '0.0.0.0', port: 3000, allowedHosts: true },
});
