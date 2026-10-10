import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { municipalIntegrity } from './src/lib/municipalIntegrity.js';
import { indicatorReference } from './src/lib/indicatorReference.js';
import { APP_VERSION } from './src/config/version.js';
import { observatorioData } from './src/data/observatorioData.js';
import { sourceRegistry } from './src/data/sourceRegistry.js';

const BASE_PATH = '/observatorio/';
const API_ROOT = '/api/v2/';
const PUBLIC_COMMIT_SHA = process.env.OBSERVATORIO_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local-development';
const PUBLIC_BUILD_ENV = process.env.GITHUB_ACTIONS === 'true' ? 'github-actions' : 'local';
const RUNTIME_CACHE_VERSION = APP_VERSION.split('.')[0];

const getApiRequestPath = (value: string) => {
  const path = value.split('?')[0];
  return path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length - 1) : path;
};

const getObservatorioPayload = () => ({
  schemaVersion: 2,
  apiVersion: '2.0',
  edition: observatorioData.meta.edition,
  municipality: observatorioData.meta.municipality,
  datasetUpdatedAt: observatorioData.meta.updatedAt,
  buildGeneratedAt: new Date().toISOString(),
  data: observatorioData,
});

const getHealthPayload = () => ({
  schemaVersion: 2, apiVersion: '2.0',
  status: municipalIntegrity(observatorioData).valid ? 'ok' : 'degraded',
  integrity: municipalIntegrity(observatorioData),
  appVersion: APP_VERSION, edition: observatorioData.meta.edition,
  datasetUpdatedAt: observatorioData.meta.updatedAt, buildGeneratedAt: new Date().toISOString(), publicPath: BASE_PATH,
  publication: { commitSha: PUBLIC_COMMIT_SHA, commitShort: PUBLIC_COMMIT_SHA === 'local-development' ? PUBLIC_COMMIT_SHA : PUBLIC_COMMIT_SHA.slice(0,12), environment: PUBLIC_BUILD_ENV, contract: 'municipal-publication-v2' },
  references: observatorioData.indicators.map(item => ({ id:item.id, ...indicatorReference(item, sourceRegistry.find(source => source.id === item.sourceId)), freshness:'not-assessed' })),
});

const getSourcesPayload = () => ({
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  sources: sourceRegistry.map(({ id, label, institution, url, resourceUrl, updateFrequency, referenceDate, publishedAt, lastCheckedAt, nature, note }) => ({
    id,
    label,
    institution,
    url,
    resourceUrl: resourceUrl ?? null,
    updateFrequency: updateFrequency ?? null,
    referenceDate: referenceDate ?? null,
    publishedAt: publishedAt ?? null,
    lastCheckedAt,
    nature,
    note: note ?? null,
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
    '/api/v2/observatorio.json': {
      get: { summary: 'Dataset consolidado da edição publicada', responses: { '200': { description: 'JSON do observatório' } } },
    },
    '/api/v2/openapi.json': {
      get: { summary: 'Especificação OpenAPI', responses: { '200': { description: 'OpenAPI JSON' } } },
    },
    '/api/v2/health.json': {
      get: { summary: 'Estado do build publicado e paridade de publicação', responses: { '200': { description: 'Metadados do build, dataset, snapshot e commit publicado' } } },
    },
    '/api/v2/sources.json': {
      get: { summary: 'Registro de fontes do observatório', responses: { '200': { description: 'Fontes e metadados de referência' } } },
    },
  },
});

const publicApiPlugin = (): Plugin => ({
  name: 'observatorio-public-api',
  configurePreviewServer(server) {
    server.middlewares.use((req,res,next) => {
      if (getApiRequestPath(req.url ?? '').startsWith('/api/v1/')) { res.statusCode = 404; res.end('API v1 retired; see API v2 migration documentation.'); return; }
      next();
    });
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const apiPath = getApiRequestPath(req.url ?? '');
      if (apiPath.startsWith('/api/v1/')) { res.statusCode = 404; res.end('API v1 retired; see API v2 migration documentation.'); return; }
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
      fileName: 'api/v2/observatorio.json',
      source: JSON.stringify(getObservatorioPayload(), null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v2/health.json',
      source: JSON.stringify(getHealthPayload(), null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v2/sources.json',
      source: JSON.stringify(getSourcesPayload(), null, 2),
    });
    this.emitFile({
      type: 'asset',
      fileName: 'api/v2/openapi.json',
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
        name: 'Observatório Águas Lindas',
        short_name: 'Observatório',
        description: 'Dados municipais e serviços públicos de Águas Lindas de Goiás, com fontes rastreáveis.',
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
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,json}'],
        globIgnores: ['api/v2/health.json'],
        importScripts: ['cache-cleanup.js'],
        navigateFallback: '/observatorio/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/observatorio\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => ['script', 'style', 'image'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: `observatorio-static-v${RUNTIME_CACHE_VERSION}`,
              expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 180, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: `observatorio-fonts-v${RUNTIME_CACHE_VERSION}`,
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 180, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'document' && request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: `observatorio-documents-v${RUNTIME_CACHE_VERSION}`,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname === '/observatorio/api/v2/health.json' || url.pathname === '/api/v2/health.json',
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => (url.pathname.startsWith('/observatorio/api/v2/') || url.pathname.startsWith('/api/v2/'))
              && !url.pathname.endsWith('/health.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: `observatorio-api-v${RUNTIME_CACHE_VERSION}`,
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
