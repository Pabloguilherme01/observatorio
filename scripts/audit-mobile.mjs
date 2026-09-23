import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const files = {
  app: read('src/app/App.tsx'),
  hero: read('src/components/sections/HeroCountdown.tsx'),
  css: read('src/assets/styles/globals.css'),
  audience: read('src/components/AudienceHub.tsx'),
  share: read('src/components/ShareDataButton.tsx'),
  pkg: JSON.parse(read('package.json')),
  version: read('src/config/version.ts'),
};

const errors = [];
const pass = message => console.log('PASS', message);
const must = (condition, message) => condition ? pass(message) : errors.push(message);

must(files.app.includes('<AudienceHub />') && files.app.includes('<InstagramSyncHub />'), 'hubs de descoberta e Instagram estão montados no App');
must(files.hero.includes('href="#descubra"'), 'hero envia o primeiro CTA para descoberta');
must(files.css.includes('.topic-rail') && files.css.includes('.today-rail'), 'CSS possui trilhos de descoberta e números');
must(files.css.includes('.instagram-shell') && files.css.includes('.instagram-mobile-rail'), 'CSS possui camada Instagram e rail móvel');
must(files.css.includes('min-height: 44px') || files.css.includes('min-height:44px'), 'controles mobile preservam alvo de toque de 44px');
must(files.css.includes('env(safe-area-inset-bottom)'), 'barra móvel considera safe-area');
must(files.css.includes('@media (max-width: 380px)'), 'existe ajuste dedicado para telas muito pequenas');
must(files.css.includes('scroll-snap-type'), 'rails móveis usam snap para descoberta por gesto');
must(files.share.includes('navigator.share') && files.share.includes('wa.me'), 'compartilhamento nativo e WhatsApp estão disponíveis');
must(!files.css.includes('.mode-overview #mudancas-snapshot'), 'radar de mudanças não fica oculto na visão geral');
must(files.pkg.scripts?.['audit:mobile'] === 'node scripts/audit-mobile.mjs', 'package.json registra a auditoria mobile');
must(files.version.includes("APP_VERSION = '40.0.0'"), 'versão V40 sincronizada com a camada mobile');

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria mobile estática concluída');
}
