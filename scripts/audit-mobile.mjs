import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));

const files = {
  app: read('src/app/App.tsx'),
  experience: read('src/components/ExperienceShell.tsx'),
  hero: read('src/components/sections/HeroCountdown.tsx'),
  css: read('src/assets/styles/globals.css'),
  header: read('src/components/layout/Header.tsx'),
  mobileNav: read('src/components/layout/MobileBottomNav.tsx'),
  share: read('src/components/ShareDataButton.tsx'),
  instagram: read('src/components/InstagramSyncHub.tsx'),
  trustGroup: read('src/components/sections/DeferredTrustGroup.tsx'),
  language: read('src/components/layout/LanguageModeToggle.tsx'),
  quiz: read('src/components/sections/QuickQuiz.tsx'),
  radar: read('src/components/sections/PoliticalRadar.tsx'),
  electoral: read('src/components/sections/Electoral360.tsx'),
  pkg: JSON.parse(read('package.json')),
  version: read('src/config/version.ts'),
  index: read('index.html'),
};

const errors = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);
const must = (condition, message) => condition ? pass(message) : fail(message);

must(files.app.includes('IntersectionObserver') && files.app.includes("rootMargin: '320px 0px'"), 'blocos abaixo da dobra usam carregamento diferido por visibilidade');
must(files.app.includes('observatorio:navigate') && files.app.includes("window.location.hash"), 'deep links e navegação por evento permanecem centralizados no App');
must(files.app.includes('behavior: reduceMotion ? \'auto\' : \'smooth\''), 'rolagem central respeita redução de movimento');
must(files.app.includes('<LanguageModeProvider>') && files.app.includes('<AudienceHub />'), 'descoberta e modos de leitura continuam montados');
must(files.app.includes('DeferredTrustGroup') && files.app.includes('DeferredPublicDataGroup'), 'grupos diferidos de confiança e dados públicos permanecem presentes');

must(files.experience.includes('pendingGTimerRef') && files.experience.includes('focusTimerRef'), 'ExperienceShell mantém cleanup dos timers assíncronos');
must(files.experience.includes('readStorage') && files.experience.includes('writeStorage'), 'ExperienceShell protege acesso ao storage');
must(!files.experience.includes('className="quick-dock"'), 'dock flutuante redundante não é renderizado');
must(files.experience.includes("mode: 'overview'") || files.experience.includes("useState<ExperienceMode>('overview')"), 'modo inicial permanece Visão geral');
must(!files.experience.includes('market') && !files.experience.includes('hype'), 'implementação não reintroduz modo Hype/Market');

must(files.header.includes('IntersectionObserver') && files.header.includes('observatorio:navigate'), 'cabeçalho acompanha seções carregadas tardiamente');
must(files.header.includes('mobile-tools-actions') && files.header.includes('desktop-theme-toggle'), 'controles secundários permanecem fora da linha principal mobile');
must(files.mobileNav.includes('observatorio:navigate') && files.mobileNav.includes("label: 'Explorar'") && files.mobileNav.includes("if (id === 'quiz') return 'quiz';"), 'navegação inferior usa o evento central, mantém Explorar e ativa corretamente o Quiz');

must(files.css.includes('--mobile-nav-height:64px') && files.css.includes('--mobile-nav-height:68px'), 'altura base e altura mobile da navegação inferior estão definidas explicitamente');
must(files.css.includes('env(safe-area-inset-bottom'), 'safe-area inferior está contemplada');
must(/min-height:\s*(44|46|48|52|54)px/.test(files.css), 'há alvos de toque móveis explicitamente dimensionados');
must(files.css.includes('overflow-x:hidden') && files.css.includes('overflow-x:clip'), 'contenção horizontal mobile está ativa');
must(files.css.includes('scroll-snap-type'), 'rails móveis suportam navegação por gesto');
must(/@media\s*\(max-width:\s*380px\)/.test(files.css) || /@media\s*\(max-width:\s*390px\)/.test(files.css), 'há ajuste dedicado para telas muito estreitas');
must(files.css.includes('.mobile-bottom-nav') && files.css.includes('.search-modal-panel'), 'CSS possui camadas móveis dedicadas para navegação e busca');

must(files.hero.includes('hero-mobile-election-toggle') && files.hero.includes('aria-pressed'), 'Modo Eleição possui controle acessível no mobile');
must(files.language.includes("id: 'summary'") && files.language.includes("id: 'simple'") && files.language.includes("id: 'technical'") && files.language.includes('aria-pressed'), 'os três modos de leitura continuam disponíveis');
must(files.radar.includes('Margem registrada') && files.radar.includes('min-h-11'), 'radar político mantém informação registrada e alvos de toque adequados');
must(files.electoral.includes('min-h-11') && files.electoral.includes('type="search"'), 'filtro eleitoral mantém interação mobile confortável');
must(files.share.includes('navigator.share') && files.share.includes('wa.me'), 'compartilhamento nativo e WhatsApp continuam disponíveis');
must(files.instagram.includes('navigator.canShare') && files.instagram.includes('wa.me/?text='), 'estúdio social mantém compartilhamento de arquivo e WhatsApp');
must(files.quiz.includes('quiz-progress-track') && files.quiz.includes('QUIZ_TOTAL = 200') && files.quiz.includes('QUESTIONS_PER_LEVEL = 40') && files.quiz.includes('QUIZ_LEVELS'), 'quiz mantém 200 perguntas em cinco níveis e progresso visual');

must(files.pkg.scripts?.['audit:mobile'] === 'node scripts/audit-mobile.mjs', 'package.json registra esta auditoria mobile');
must(files.version.match(/APP_VERSION\s*=\s*['"]44\./), 'versão atual continua na linha 44 consolidada');

must(files.index.includes('maximum-scale=5') && files.index.includes('viewport-fit=cover'), 'viewport mobile preserva zoom e safe-area');
must(files.index.includes('apple-mobile-web-app-capable') && files.index.includes('apple-mobile-web-app-title'), 'metadados de instalação iOS estão presentes');
must(files.index.includes('id="root"') && files.index.includes('boot-fallback'), 'HTML inicial possui root e fallback de recuperação');

for (const [file, label] of [
  ['src/components/ShareDataButton.tsx', 'compartilhamento'],
  ['src/components/DataExportActions.tsx', 'exportação'],
  ['src/components/InstagramSyncHub.tsx', 'estúdio social'],
]) {
  must(read(file).includes('statusTimerRef') && read(file).includes('clearTimeout'), label + ' protege timers de status');
}

must(exists('src/components/sections/DeferredTrustGroup.tsx'), 'grupo de confiança existe em arquivo próprio');
must(files.trustGroup.includes('ProjectTrustPanel') || files.trustGroup.includes('DataCorrection'), 'grupo de confiança mantém sua camada editorial');

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria mobile contratual concluída');
}
