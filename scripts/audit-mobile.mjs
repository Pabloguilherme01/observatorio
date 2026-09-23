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
  instagram: read('src/components/InstagramSyncHub.tsx'),
  trust: read('src/components/ProjectTrustPanel.tsx'),
  pkg: JSON.parse(read('package.json')),
  version: read('src/config/version.ts'),
  index: read('index.html'),
  mobileNav: read('src/components/layout/MobileBottomNav.tsx'),
};

const errors = [];
const pass = message => console.log('PASS', message);
const must = (condition, message) => condition ? pass(message) : errors.push(message);

must(files.app.includes('AudienceHub') && files.app.includes('InstagramSyncHub'), 'hubs de descoberta e Instagram estão montados no App');
must(files.hero.includes('href="#descubra"'), 'hero envia o primeiro CTA para descoberta');
must(files.css.includes('.topic-rail') && files.css.includes('.today-rail'), 'CSS possui trilhos de descoberta e números');
must(files.css.includes('.instagram-shell') && files.css.includes('.instagram-mobile-rail'), 'CSS possui camada Instagram e rail móvel');
must(files.instagram.includes('navigator.canShare') && files.instagram.includes('1080'), 'kit Instagram suporta compartilhamento de arquivo e formatos sociais');
must(files.trust.includes('Propor correção') && files.trust.includes('Compromisso editorial'), 'camada pública de correções e compromisso editorial disponível');
must(files.css.includes('min-height: 44px') || files.css.includes('min-height:44px'), 'controles mobile preservam alvo de toque de 44px');
must(files.css.includes('env(safe-area-inset-bottom)'), 'barra móvel considera safe-area');
must(files.css.includes('min-height: 56px'), 'navegação inferior mobile possui alvo de toque ampliado');
must(files.share.includes('min-h-12'), 'compartilhamento principal usa alvo de toque de 48px');
must(/@media\s*\(max-width:\s*380px\)/.test(files.css), 'existe ajuste dedicado para telas muito pequenas');
must(files.css.includes('scroll-snap-type'), 'rails móveis usam snap para descoberta por gesto');
must(files.mobileNav.includes("label: 'Explorar'") && files.mobileNav.includes('observatorio:navigate'), 'barra mobile identifica Explorar e acompanha navegação temática');
must(files.share.includes('navigator.share') && files.share.includes('wa.me'), 'compartilhamento nativo e WhatsApp estão disponíveis');
must(!files.css.includes('.mode-overview #mudancas-snapshot'), 'radar de mudanças não fica oculto na visão geral');
must(files.pkg.scripts?.['audit:mobile'] === 'node scripts/audit-mobile.mjs', 'package.json registra a auditoria mobile');
must(files.version.includes("APP_VERSION = '44.0.0'"), 'versão V44 sincronizada com a camada mobile');
must(files.index.includes('maximum-scale=5') && files.index.includes('viewport-fit=cover'), 'viewport mobile suporta zoom e safe-area');
must(files.index.includes('apple-mobile-web-app-capable'), 'metadados de instalação iOS estão presentes');

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria mobile estática concluída');
}

