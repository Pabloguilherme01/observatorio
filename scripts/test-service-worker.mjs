import { existsSync, readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const sw = readFileSync('dist/sw.js', 'utf8');
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));
const viteConfig = readFileSync('vite.config.ts', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const cacheMajor = String(packageJson.version).split('.')[0];

assert.match(sw, /createHandlerBoundToURL\(["']\/observatorio\/index\.html["']\)/);
assert.match(sw, /\.pathname\.startsWith\(["']\/observatorio\/api\/v1\/["']\)/);
assert.doesNotMatch(sw, /BASE_PATH\s*\+\s*API_ROOT/);
for (const suffix of ['static', 'fonts', 'documents', 'results', 'api']) {
  assert.match(sw, new RegExp(`observatorio-${suffix}-v${cacheMajor}`));
}
assert.match(sw, /NetworkFirst/);
assert.match(sw, /NetworkOnly/);
assert.match(sw, /health\.json/);
assert.match(sw, /tse-results\.json/);
const healthRouteIndex = viteConfig.indexOf("url.pathname === '/observatorio/api/v1/health.json'");
const genericApiRouteIndex = viteConfig.indexOf("url.pathname.startsWith('/observatorio/api/v1/')");
assert.ok(healthRouteIndex >= 0 && genericApiRouteIndex >= 0 && healthRouteIndex < genericApiRouteIndex, 'healthcheck deve preceder a rota genérica da API');
assert.doesNotMatch(sw, /observatorio-(?:static|fonts|documents|api)-v13/);
assert.ok(manifest.icons.some(icon => icon.src === '/observatorio/pwa-192.png' && icon.purpose.includes('maskable')));
assert.ok(manifest.icons.some(icon => icon.src === '/observatorio/pwa-512.png' && icon.purpose.includes('maskable')));
for (const icon of manifest.icons) {
  const relativePath = String(icon.src).replace(/^\/observatorio\//, '').replace(/^\/+/, '');
  assert.ok(relativePath && !relativePath.includes('..'), `caminho de ícone inválido no manifest: ${icon.src}`);
  assert.ok(existsSync('dist/' + relativePath), `ícone declarado no manifest não existe no build: ${icon.src}`);
}

const precacheOccurrences = asset =>
  sw.split(`url:\"${asset}\"`).length - 1 + sw.split(`url:'${asset}'`).length - 1;
for (const asset of ['pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png', 'offline.html']) {
  assert.equal(precacheOccurrences(asset), 1, `${asset} deve aparecer uma única vez no precache`);
}
console.log('Production Service Worker and mobile manifest verified.');
