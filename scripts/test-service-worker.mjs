import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const sw = readFileSync('dist/sw.js', 'utf8');
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));

assert.match(sw, /createHandlerBoundToURL\(["']\/observatorio\/index\.html["']\)/);
assert.match(sw, /\.pathname\.startsWith\(["']\/observatorio\/api\/v1\/["']\)/);
assert.doesNotMatch(sw, /BASE_PATH\s*\+\s*API_ROOT/);
assert.ok(manifest.icons.some(icon => icon.src === '/observatorio/pwa-192.png' && icon.purpose.includes('maskable')));
assert.ok(manifest.icons.some(icon => icon.src === '/observatorio/pwa-512.png' && icon.purpose.includes('maskable')));
console.log('Production Service Worker and mobile manifest verified.');
