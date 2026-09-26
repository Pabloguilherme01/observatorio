import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import tseCandidates from './src/data/generated/tse2026-candidates.json' with { type: 'json' };
import { APP_VERSION } from './src/config/version.js';
import { observatorioData } from './src/data/observatorioData.js';
import { sourceRegistry } from './src/data/sourceRegistry.js';

const BASE_PATH = '/observatorio/';
const API_ROOT = '/api/v1/';
const PUBLIC_COMMIT_SHA = process.env.GITHUB_SHA ?? 'local-development';
const PUBLIC_BUILD_ENV = process.env.GITHUB_ACTIONS === 'true' ? 'github-actions' : 'local';

const getApiRequestPath = (value: string) => {
  const path = value.split('?')[0];
  return path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length - 1) : path;
};

const getObservatorioPayload = () => ({
  schemaVersion: 1,
  apiVersion: '1.0',
  edition: observatorioData.meta.edition,
  municipality: observatorioData.meta.municipality,
  datasetUpdatedAt: observatorioData.meta.updatedAt,
  buildGeneratedAt: new Date().toISOString(),
  data: observatorioData,
});

const getHealthPayload = () => {
  const capturedAt = tseCandidates.meta.downloadedAt ?? null;
  const capturedAtMs = capturedAt ? Date.parse(capturedAt) : NaN;
  const ageHours = Number.isFinite(capturedAtMs)
    ? Math.max(0, (Date.now() - capturedAtMs) / 3_600_000)
    : null;
  const maxAgeHours = 24;
  const tseFreshness = ageHours !== null && ageHours <= maxAgeHours ? 'fresh' : 'stale';

  return {
    schemaVersion: 2,
    status: tseFreshness === 'fresh' ? 'ok' : 'degraded',
    appVersion: APP_VERSION,
    edition: observatorioData.meta.edition,
    datasetUpdatedAt: observatorioData.meta.updatedAt,
    buildGeneratedAt: new Date().toISOString(),
    publicPath: BASE_PATH,
    publication: {
      commitSha: PUBLIC_COMMIT_SHA,
      commitShort: PUBLIC_COMMIT_SHA !== 'local-development' ? PUBLIC_COMMIT_SHA.slice(0, 12) : PUBLIC_COMMIT_SHA,
      environment: PUBLIC_BUILD_ENV,
      contract: 'publication-parity-v1',
    },
    freshness: {
      maxAgeHours,
      tseCandidates: {
        status: tseFreshness,
        capturedAt,
        ageHours: ageHours === null ? null : Number(ageHours.toFixed(2)),
        snapshotId: tseCandidates.meta.snapshotId,
        state: tseCandidates.meta.state,
        matchedRows: tseCandidates.meta.matchedRows,
        coverage: tseCandidates.coverage,
        universeScope: tseCandidates.meta.candidateUniverseScope,
      },
    },
  };
};

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
  servers: [{ url: BASE_PATH }],
  paths: {
    '/api/v1/observatorio.json': {
      get: { summary: 'Dataset consolidado da edição publicada', responses: { '200': { description: 'JSON do observatório' } } },
    },
    '/api/v1/openapi.json': {
      get: { summary: 'Especificação OpenAPI', responses: { '200': { description: 'OpenAPI JSON' } } },
    },
    '/api/v1/health.json': {
      get: { summary: 'Estado do build publicado e paridade de publicação', responses: { '200': { description: 'Metadados do build, dataset, snapshot e commit publicado' } } },
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
      const apiPath = getApiRequestPath(req.url ?? '');
      if (apiPath === API_ROOT + 'observatorio.json') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(getObservatorioPayload(), null, 2));
      }
      if (apiPath === API_ROOT + 'health.json') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(getHealthPayload(), null, 2));
      }
      if (apiPath === API_ROOT + 'sources.json') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(getSourcesPayload(), null, 2));
      }
      if (apiPath === API_ROOT + 'openapi.json') {
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

const DEV_HOST = process.env.VITE_DEV_HOST ?? '127.0.0.1';
const DEV_ALLOWED_HOSTS = process.env.VITE_DEV_ALLOWED_HOSTS
  ? process.env.VITE_DEV_ALLOWED_HOSTS.split(',').map(value => value.trim()).filter(Boolean)
  : ['localhost', '127.0.0.1'];

export default defineConfig({
  base: BASE_PATH,
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
        id: BASE_PATH,
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        categories: ['public-services', 'education'],
        prefer_related_applications: false,
        icons: [
          { src: BASE_PATH + 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: BASE_PATH + 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: BASE_PATH + 'pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      includeAssets: ['pwa-192.svg', 'pwa-512.svg', 'pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png', 'offline.html'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,json}'],
        navigateFallback: '/observatorio/offline.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/observatorio\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => ['script', 'style', 'image'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'observatorio-static-v13',
              expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 180, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'observatorio-fonts-v13',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 180, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'document' && request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'observatorio-documents-v13',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith(BASE_PATH + API_ROOT.slice(1)) || url.pathname.startsWith(API_ROOT),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'observatorio-api-v13',
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
  server: { host: DEV_HOST, port: 3000, allowedHosts: DEV_ALLOWED_HOSTS },
});
