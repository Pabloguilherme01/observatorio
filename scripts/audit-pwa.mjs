import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const errors = [];
const pass = msg => console.log('PASS', msg);
const must = (condition, msg) => condition ? pass(msg) : errors.push(msg);

const vite = read('vite.config.ts');
const index = read('index.html');
const manifest = read('public/manifest.webmanifest');
const offline = read('public/offline.html');
const main = read('src/main.tsx');
const icon192 = read('public/pwa-192.svg');
const icon512 = read('public/pwa-512.svg');

must(vite.includes("VitePWA("), 'vite-plugin-pwa está configurado');
must(vite.includes("registerType: 'autoUpdate'"), 'service worker usa atualização automática');
must(vite.includes("id: '/observatorio/'"), 'manifest possui id estável');
must(vite.includes("start_url: '/observatorio/'") && vite.includes("scope: '/observatorio/'"), 'start_url e scope respeitam GitHub Pages');
must(vite.includes("StaleWhileRevalidate"), 'assets estáticos usam atualização sem bloquear a UI');
must(vite.includes("NetworkFirst"), 'documentos e API usam estratégia NetworkFirst');
must(vite.includes("observatorio-api-v1"), 'API pública possui cache dedicado');
must(vite.includes("navigateFallback: '/observatorio/index.html'"), 'fallback de navegação está alinhado com o base path');
must(vite.includes("navigateFallbackDenylist"), 'API não cai no fallback HTML');
must(index.includes('rel="manifest"'), 'index.html referencia o manifest');
must(index.includes('apple-touch-icon'), 'ícone de instalação Apple está declarado');
must(manifest.includes('"id": "/observatorio/"'), 'manifest físico possui id estável');
must(manifest.includes('"start_url": "/observatorio/"') && manifest.includes('"scope": "/observatorio/"'), 'manifest físico possui origem correta');
must(manifest.includes('pwa-192.svg') && manifest.includes('pwa-512.svg'), 'manifest físico declara os dois ícones');
must(/viewBox="0 0 192 192"/.test(icon192), 'ícone 192 possui viewBox compatível');
must(/viewBox="0 0 512 512"/.test(icon512), 'ícone 512 possui viewBox compatível');
must(offline.includes('Você está offline'), 'fallback offline existe e é legível');
must(main.includes('onNeedRefresh') && main.includes('updateSW(true)'), 'usuário pode aplicar atualização da PWA sem limpar cache manualmente');

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria PWA concluída');
}
