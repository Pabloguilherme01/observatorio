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
  language: read('src/components/layout/LanguageModeToggle.tsx'),
  quiz: read('src/components/sections/QuickQuiz.tsx'),
  quizData: read('src/data/quiz/questionBank.ts'),
  research: read('src/components/sections/PoliticalResearch.tsx'),
  electoral: read('src/components/sections/Electoral360.tsx'),
  pkg: JSON.parse(read('package.json')),
  version: read('src/config/version.ts'),
  index: read('index.html'),
};

const errors = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);
const must = (condition, message) => condition ? pass(message) : fail(message);

must(files.app.includes('IntersectionObserver') && files.app.includes("rootMargin: '320px 0px'"), 'blocos secundários abaixo da dobra usam carregamento diferido por visibilidade');
must(files.app.includes('<DashboardMetrics />') && !files.app.includes('loadDashboardGroup'), 'dashboard e gráficos principais montam sem depender de IntersectionObserver');
must(files.app.includes('observatorio:navigate') && files.app.includes("window.location.hash"), 'deep links e navegação por evento permanecem centralizados no App');
must(files.app.includes('behavior: reduceMotion ? \'auto\' : \'smooth\''), 'rolagem central respeita redução de movimento');
must(files.app.includes('<LanguageModeProvider>') && files.app.includes('<AudienceHub />'), 'descoberta e modos de leitura continuam montados');
must(files.app.includes('DeferredEvidenceGroup') && files.app.includes('DeferredPublicDataGroup') && read('src/components/sections/DeferredEvidenceGroup.tsx').includes('ProjectTrustPanel'), 'grupo técnico consolidado e dados públicos permanecem montados');

must(files.experience.includes("window.dispatchEvent(new CustomEvent('observatorio:search'))") && files.experience.includes('reading-progress'), 'ExperienceShell mantém busca global e progresso de leitura com cleanup');
must(files.experience.includes('prefers-reduced-motion') && files.experience.includes('addEventListener'), 'ExperienceShell respeita redução de movimento e cleanup de listeners');
must(!files.experience.includes('className="quick-dock"'), 'dock flutuante redundante não é renderizado');
must(!files.experience.includes('ExperienceMode') && !files.experience.includes('MODE_KEY'), 'ExperienceShell não mantém modo de experiência paralelo');
must(!files.experience.includes('market') && !files.experience.includes('hype'), 'implementação não reintroduz modo Hype/Market');

must(files.header.includes('IntersectionObserver') && files.header.includes('observatorio:navigate'), 'cabeçalho acompanha seções carregadas tardiamente');
must(files.header.includes('mobile-tools-actions') && files.header.includes('desktop-theme-toggle'), 'controles secundários permanecem fora da linha principal mobile');
must(files.mobileNav.includes('observatorio:navigate') && files.mobileNav.includes("label: 'Explorar'") && files.mobileNav.includes("id === 'quiz'"), 'navegação inferior usa o evento central, mantém Explorar e ativa corretamente o Quiz');
must(read('src/config/navigation.ts').includes("id: 'saude'") && read('src/config/navigation.ts').includes("id: 'exportacao'"), 'menu Mais expõe saúde/saneamento e exportação sem criar novos destinos');
must(files.mobileNav.includes('useLanguageMode') && files.mobileNav.includes('destinationIsHiddenInSummary') && files.mobileNav.includes("setMode('simple')") && !files.mobileNav.includes('TECHNICAL_ONLY_DESTINATIONS') && files.app.includes('TECHNICAL_ONLY_DESTINATIONS') && files.app.includes('CONTEXTUAL_DESTINATIONS') && files.app.includes("setMode('technical')"), 'navegação preserva modos comuns e eleva apenas destinos realmente técnicos');

must(files.css.includes('--mobile-nav-height:64px') && files.css.includes('--mobile-nav-height:68px'), 'altura base e altura mobile da navegação inferior estão definidas explicitamente');
must(files.css.includes('env(safe-area-inset-bottom'), 'safe-area inferior está contemplada');
must(/min-height:\s*(44|46|48|52|54)px/.test(files.css), 'há alvos de toque móveis explicitamente dimensionados');
must(files.css.includes('overflow-x:hidden') && files.css.includes('overflow-x:clip'), 'contenção horizontal mobile está ativa');
must(files.css.includes('scroll-snap-type'), 'rails móveis suportam navegação por gesto');
must(/@media\s*\(max-width:\s*380px\)/.test(files.css) || /@media\s*\(max-width:\s*390px\)/.test(files.css), 'há ajuste dedicado para telas muito estreitas');
must(files.css.includes('.mobile-bottom-nav') && files.css.includes('.search-modal-panel'), 'CSS possui camadas móveis dedicadas para navegação e busca');

must(files.hero.includes('href="#descubra"') && files.hero.includes('href="#evidencias"'), 'hero mantém ações principais acessíveis no mobile');
must(files.language.includes("id: 'summary'") && files.language.includes("id: 'simple'") && files.language.includes("id: 'technical'") && files.language.includes('aria-pressed') && files.language.includes('cycleMode') && files.language.includes('Aprofundar leitura'), 'os três modos e a progressão explícita de leitura continuam disponíveis');
must(files.research.includes('Margem registrada') && files.research.includes('min-h-11'), 'pesquisas registradas mantêm informação documental e alvos de toque adequados');
must(files.electoral.includes('min-h-11') && files.electoral.includes('type="search"'), 'filtro eleitoral mantém interação mobile confortável');
must(files.quiz.includes('quiz-progress-track') && files.quizData.includes('QUIZ_TOTAL = 200') && files.quizData.includes('QUESTIONS_PER_LEVEL = 40') && files.quizData.includes('QUIZ_LEVELS'), 'quiz mantém 200 perguntas em cinco níveis e progresso visual');

must(files.pkg.scripts?.['audit:mobile'] === 'node scripts/audit-mobile.mjs', 'package.json registra esta auditoria mobile');
must(files.version.match(/APP_VERSION\s*=\s*['"]44\./), 'versão atual continua na linha 44 consolidada');

must(files.index.includes('maximum-scale=5') && files.index.includes('viewport-fit=cover'), 'viewport mobile preserva zoom e safe-area');
must(files.index.includes('apple-mobile-web-app-capable') && files.index.includes('apple-mobile-web-app-title'), 'metadados de instalação iOS estão presentes');
must(files.index.includes('id="root"') && files.index.includes('boot-fallback'), 'HTML inicial possui root e fallback de recuperação');

must(read('src/components/DataExportActions.tsx').includes('statusTimerRef') && read('src/components/DataExportActions.tsx').includes('clearTimeout') && read('src/components/DataExportActions.tsx').includes('flash('), 'exportação protege timers de status');

must(exists('src/components/sections/DeferredEvidenceGroup.tsx'), 'grupo técnico consolidado existe em arquivo próprio');
must(files.app.includes('<ProjectTrustPanel />') || read('src/components/sections/DeferredEvidenceGroup.tsx').includes('ProjectTrustPanel'), 'grupo técnico consolidado mantém sua camada editorial');

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria mobile contratual concluída');
}
