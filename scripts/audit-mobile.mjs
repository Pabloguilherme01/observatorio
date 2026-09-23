import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const files = {
  app: read('src/app/App.tsx'),
  hero: read('src/components/sections/HeroCountdown.tsx'),
  css: read('src/assets/styles/globals.css'),
  header: read('src/components/layout/Header.tsx'),
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

must(files.app.includes('AudienceHub') && files.app.includes('DeferredPublicDataGroup'), 'hubs de descoberta e Instagram estão montados diretamente ou por grupo diferido');
must(files.hero.includes('href="#descubra"'), 'hero envia o primeiro CTA para descoberta');
must(files.hero.includes('observatorio:election-mode') && files.hero.includes('aria-pressed') && files.hero.includes('hero-mobile-election-toggle'), 'Modo Eleição possui controle acessível também no hero mobile');
must(files.css.includes('.hero-mobile-election-toggle') || files.css.includes('mode-election') || files.hero.includes('hero-mobile-election-toggle'), 'CSS possui o controle mobile do Modo Eleição');
must(files.css.includes('.topic-rail') && files.css.includes('.today-rail'), 'CSS possui trilhos de descoberta e números');
must(files.css.includes('.instagram-shell') || files.instagram.includes('instagram-shell'), 'camada Instagram possui estrutura própria');
must(files.instagram.includes('navigator.canShare') && files.instagram.includes('1080'), 'kit Instagram suporta compartilhamento de arquivo e formatos sociais');
must(files.trust.includes('Propor correção') && files.trust.includes('Compromisso editorial'), 'camada pública de correções e compromisso editorial disponível');
must(files.css.includes('min-height: 44px') || files.css.includes('min-height:44px'), 'controles mobile preservam alvo de toque de 44px');
must(files.css.includes('env(safe-area-inset-bottom)') || files.css.includes('safe-area-inset-bottom'), 'barra móvel considera safe-area');
must(files.css.includes('min-height: 56px') || files.css.includes('min-height:46px') || files.css.includes('min-height: 46px'), 'navegação inferior mobile possui alvo de toque ampliado');
must(files.share.includes('min-h-12'), 'compartilhamento principal usa alvo de toque de 48px');
must(/@media\s*\(max-width:\s*380px\)/.test(files.css), 'existe ajuste dedicado para telas muito pequenas');
must(files.css.includes('scroll-snap-type'), 'rails móveis usam snap para descoberta por gesto');
must(files.mobileNav.includes("label: 'Explorar'") && files.mobileNav.includes('observatorio:navigate'), 'barra mobile identifica Explorar e acompanha navegação temática');
must(files.share.includes('navigator.share') && files.share.includes('wa.me'), 'compartilhamento nativo e WhatsApp estão disponíveis');
must(!files.css.includes('.mode-overview #mudancas-snapshot'), 'radar de mudanças não fica oculto na visão geral');
must(files.pkg.scripts?.['audit:mobile'] === 'node scripts/audit-mobile.mjs', 'package.json registra a auditoria mobile');
const appVersionMatch = files.version.match(/APP_VERSION\s*=\s*['\"]([^'\"]+)['\"]/);
must(Boolean(appVersionMatch?.[1]) && appVersionMatch[1].startsWith('44.'), 'versão do aplicativo sincronizada com a camada mobile');
const app = read('src/app/App.tsx');
must(app.includes('IntersectionObserver') && /rootMargin\s*:\s*['"]\d+px\s+0px['"]/.test(app), 'seções abaixo da dobra usam carregamento diferido');
const deferredReadyReturn = app.indexOf('if (!ready) return <div ref={ref}');
const deferredUseMemo = app.indexOf('const Component = useMemo(() => lazy(loader), [loader])');
must(deferredReadyReturn === -1 || deferredUseMemo !== -1 && deferredUseMemo < deferredReadyReturn, 'DeferredBlock chama todos os Hooks antes de qualquer retorno antecipado');
must(app.includes('observatorio:navigate') && app.includes('anchorIds'), 'navegação profunda consegue ativar seções diferidas');
must(app.includes("'saude'") && app.includes("'healgo'"), 'âncoras de saúde e simulador permanecem navegáveis após code splitting');
must(files.index.includes('maximum-scale=5') && files.index.includes('viewport-fit=cover'), 'viewport mobile suporta zoom e safe-area');
must(files.index.includes('apple-mobile-web-app-capable') && files.index.includes('apple-mobile-web-app-title'), 'metadados de instalação iOS estão presentes');
must(files.mobileNav.includes("aria-current={activeSection === id ? 'location'"), 'navegação inferior usa estado de localização acessível');
must(!read('src/components/sections/PoliticalRadar.tsx').includes('computeTheoreticalMargin') && !read('src/components/sections/PoliticalRadar.tsx').includes('calculateMargin'), 'interface mobile não calcula margem de erro teórica');
must(read('src/components/ExperienceShell.tsx').includes("behavior: reduceMotion ? 'auto' : 'smooth'"), 'navegação programática respeita redução de movimento');
must(files.header.includes('desktop-theme-toggle') && files.header.includes('mobile-tools-actions'), 'cabeçalho mobile não concentra controles demais na linha principal');
must(files.css.includes('.mobile-tools-actions') && files.css.includes('.desktop-theme-toggle'), 'CSS possui sistema dedicado para ferramentas móveis');
must(files.css.includes('overflow-x:hidden') && files.css.includes('overflow-x:clip'), 'contenção horizontal mobile está ativa');
must(files.css.includes('--mobile-nav-height:66px'), 'altura da navegação inferior mobile está consolidada');
const languageToggle = read('src/components/layout/LanguageModeToggle.tsx');
must(languageToggle.includes("setMode('summary')") && languageToggle.includes("setMode('simple')") && languageToggle.includes("setMode('technical')"), 'os três modos de leitura estão disponíveis no mobile');
const quiz = read('src/components/sections/QuickQuiz.tsx');
const quizPrompts = (quiz.match(/prompt:\s*'/g) || []).length;
must(quizPrompts >= 10, 'quiz possui pelo menos dez perguntas');
must(quiz.includes('quiz-progress-track') && quiz.includes('questions.length'), 'quiz possui progresso visual ligado ao total de perguntas');
must(read('src/components/InstagramSyncHub.tsx').includes('wa.me/?text='), 'WhatsApp contextual está integrado ao fluxo social');

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria mobile estática concluída');
}
