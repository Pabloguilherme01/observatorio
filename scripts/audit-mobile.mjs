import fs from 'node:fs';
import path from 'node:path';
import { readCssImportGraph } from './lib/readCssImportGraph.mjs';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));

const files = {
  main: read('src/main.tsx'),
  app: read('src/app/App.tsx'),
  experience: read('src/components/ExperienceShell.tsx'),
  hero: read('src/components/sections/PostElectionHero.tsx'),
  css: readCssImportGraph('src/assets/styles/globals.css', { root }),
  finalUi: readCssImportGraph('src/assets/styles/final-ui.css', { root }),
  mobileFinal: readCssImportGraph('src/assets/styles/mobile-final.css', { root }),
  guidedCss: readCssImportGraph('src/assets/styles/guided-mode.css', { root }),
  visualHardening: exists('src/assets/styles/visual-hardening.css') ? readCssImportGraph('src/assets/styles/visual-hardening.css', { root }) : '',
  header: read('src/components/layout/Header.tsx'),
  mobileNav: read('src/components/layout/MobileBottomNav.tsx'),
  language: read('src/components/layout/LanguageModeToggle.tsx'),
  readingModes: read('src/config/readingModes.ts'),
  languageContext: read('src/context/LanguageModeContext.tsx'),
  quiz: read('src/components/sections/QuickQuiz.tsx'),
  quizData: read('src/data/quiz/questionBank.ts'),
  research: read('src/components/sections/PoliticalResearch.tsx'),
  electoral: read('src/components/sections/Electoral360.tsx'),
  dashboard: read('src/components/sections/DashboardMetrics.tsx'),
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
must(files.app.includes('<DeferredEvidenceGroup />') && !files.app.includes('loadEvidenceGroup') && files.app.includes('DeferredPublicDataGroup') && read('src/components/sections/DeferredEvidenceGroup.tsx').includes('ProjectTrustPanel'), 'fontes/exportação montam diretamente e dados públicos secundários permanecem lazy');

must(files.experience.includes("window.dispatchEvent(new CustomEvent('observatorio:search'))") && files.experience.includes('reading-progress'), 'ExperienceShell mantém busca global e progresso de leitura com cleanup');
must(files.experience.includes('prefers-reduced-motion') && files.experience.includes('addEventListener'), 'ExperienceShell respeita redução de movimento e cleanup de listeners');
must(files.experience.includes('<ConnectivityStatus />'), 'estado de conectividade está montado no shell global');
must(files.css.includes('.connectivity-status{') && files.css.includes("top:calc(env(safe-area-inset-top,0px) + 64px)") && files.css.includes('@media(max-width:420px)'), 'status de conexão possui layout dedicado para mobile e telas estreitas');
must(read('src/components/system/ConnectivityStatus.tsx').includes('navigator.onLine') && read('src/components/system/ConnectivityStatus.tsx').includes('Verificar'), 'status offline oferece verificação manual sem bloquear a navegação');
must(!files.experience.includes('className="quick-dock"'), 'dock flutuante redundante não é renderizado');
must(!files.experience.includes('ExperienceMode') && !files.experience.includes('MODE_KEY'), 'ExperienceShell não mantém modo de experiência paralelo');
must(!files.experience.includes('market') && !files.experience.includes('hype'), 'implementação não reintroduz modo Hype/Market');

must(files.header.includes('IntersectionObserver') && files.header.includes('observatorio:navigate'), 'cabeçalho acompanha seções carregadas tardiamente');
must(files.header.includes('mobile-tools-actions') && files.header.includes('desktop-theme-toggle'), 'controles secundários permanecem fora da linha principal mobile');
must(files.mobileNav.includes('observatorio:navigate') && ['Início', 'Cidade', 'Serviços', 'Dados'].every(label => files.mobileNav.includes("label: '" + label + "'")), 'navegação inferior prioriza início, cidade, serviços e dados e atualiza a aba ativa por evento/hash');
must(files.mobileNav.includes('!primaryItems.some(primary => primary.id === item.id)') && files.mobileNav.includes('const moreItems = [guidedItem,'), 'áreas secundárias, incluindo o Quiz, ficam concentradas no menu Mais');
must(files.mobileNav.includes("createPortal") && files.mobileNav.includes("data-mobile-more-layer") && files.mobileNav.includes("closeMore") && files.mobileNav.includes("toggleMore"), 'menu Mais usa camada portal estável com estado centralizado');
must(files.mobileNav.includes('if (!moreOpen) return;') && files.mobileNav.includes("querySelector<HTMLButtonElement>('[role=\"menuitem\"]')?.focus()") && files.mobileNav.includes('window.cancelAnimationFrame(frame)'), 'menu Mais move foco somente após o portal renderizar e limpa RAF pendente');
must(files.mobileNav.includes("window.addEventListener('resize', onResize)") && files.mobileNav.includes("window.innerWidth >= 768"), 'menu Mais fecha ao sair do breakpoint mobile');
must(files.mobileFinal.includes('.mobile-bottom-more-layer{') && files.mobileFinal.includes('position:fixed') && files.mobileFinal.includes('.mobile-bottom-more-backdrop{'), 'menu Mais possui layer fixa e backdrop tocável fora da barra');
must(files.mobileFinal.includes("bottom:calc(var(--mobile-nav-height)") && files.mobileFinal.includes('max-height:calc(100dvh'), 'menu Mais respeita barra inferior, safe-area e altura útil da viewport');
must(files.experience.includes("event.key === '/'"), 'atalho / abre a busca global fora de campos de digitação');
must(files.experience.includes('shortcutMap') && files.experience.includes('navigateToSection(destination)') && files.experience.includes('navigationSequence'), 'atalhos G + tecla da configuração de navegação estão ativos globalmente');
must(files.experience.includes('target.isContentEditable'), 'atalhos não interceptam elementos editáveis');
must(read('src/config/navigation.ts').includes("id: 'saude'") && read('src/config/navigation.ts').includes("id: 'exportacao'"), 'menu Mais expõe saúde/saneamento e exportação sem criar novos destinos');
must(!files.mobileNav.includes('useLanguageMode') && !files.mobileNav.includes('setMode(') && files.app.includes('modeForDestination') && files.readingModes.includes('TECHNICAL_ONLY_DESTINATIONS') && files.readingModes.includes('SUMMARY_HIDDEN_DESTINATIONS') && files.languageContext.includes('fallbackDestinationForMode'), 'menu mobile e troca manual usam a mesma política central de visibilidade');
must(files.mobileNav.includes("'aprendizado-guiado'") && files.mobileNav.includes('Aprendizado guiado') && files.mobileNav.includes('aria-current'), 'menu Mais oferece retorno direto e estado ativo para a trilha guiada sem acoplar a barra ao contexto de leitura');

must(files.css.includes('--mobile-nav-height:64px') && files.css.includes('--mobile-nav-height:68px'), 'altura base e altura mobile da navegação inferior estão definidas explicitamente');
must(files.css.includes('env(safe-area-inset-bottom'), 'safe-area inferior está contemplada');
must(/min-height:\s*(44|46|48|52|54)px/.test(files.css), 'há alvos de toque móveis explicitamente dimensionados');
must(files.css.includes('overflow-x:hidden') && files.css.includes('overflow-x:clip'), 'contenção horizontal mobile está ativa');
must(files.css.includes('scroll-snap-type'), 'rails móveis suportam navegação por gesto');
must(/@media\s*\(max-width:\s*380px\)/.test(files.css) || /@media\s*\(max-width:\s*390px\)/.test(files.css), 'há ajuste dedicado para telas muito estreitas');
must(files.css.includes('.mobile-bottom-nav') && files.css.includes('.search-modal-panel'), 'CSS possui camadas móveis dedicadas para navegação e busca');
must(files.finalUi.includes('.deferred-section{') && files.finalUi.includes('content-visibility:visible!important') && !files.mobileFinal.includes('content-visibility:auto'), 'seções lazy montadas permanecem renderizáveis para gráficos e deep links');
must(files.finalUi.includes('.premium-info-card{') && files.finalUi.includes('.premium-info-grid{') && files.finalUi.includes('@media (max-width:767px)') && files.finalUi.includes('.premium-info-grid{grid-template-columns:1fr}'), 'cards premium possuem composição responsiva e colapsam para uma coluna no mobile');
must(files.hero.includes('hero-reference-card') && files.finalUi.includes('.hero-reference-card{'), 'referências técnicas do hero usam mini-cards em vez de texto solto');
must(exists('src/assets/styles/visual-hardening.css'), 'camada visual V45 possui arquivo próprio e auditável');
must(/min-width\s*:\s*0/.test(files.visualHardening) && /overflow-wrap\s*:\s*anywhere/.test(files.visualHardening) && /overflow-x\s*:\s*clip/.test(files.visualHardening), 'camada visual V45 contém contrato explícito contra overflow e encolhimento de layout');
must(files.visualHardening.includes('.hero-layout') && /grid-template-columns\s*:\s*minmax\(0,\s*1fr\)/.test(files.visualHardening) && files.visualHardening.includes('@media (max-width: 767px)'), 'hero possui composição responsiva sem coluna mínima rígida no mobile');
must(files.visualHardening.includes('.results-public-card') && files.visualHardening.includes('.audience-action-card') && files.visualHardening.includes('.audience-resource'), 'cards públicos compartilham regras de largura, texto e alinhamento');

must(files.hero.includes('href="#descubra"') && files.hero.includes('href="#fontes"'), 'hero mantém ações principais acessíveis sem forçar modo técnico');
must(files.language.includes("id: 'summary'") && files.language.includes("id: 'simple'") && files.language.includes("id: 'guided'") && files.language.includes("id: 'technical'") && files.language.includes('aria-pressed') && files.language.includes('cycleMode') && files.language.includes('Avançar para aprendizado guiado'), 'os quatro modos e a progressão explícita de leitura continuam disponíveis');
must(files.mobileFinal.includes('.language-toggle-v3 .language-toggle-options{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))'), 'CSS mobile base reconhece os quatro modos sem depender de override corretivo');
must(files.dashboard.includes("isGuided ? 'Confira natureza, data e fonte'") && files.dashboard.includes("isGuided ? 'Confira fórmula, período e base'"), 'cards do modo guiado usam ações pedagógicas específicas para observações e comparativos');
must(files.guidedCss.includes('@media(max-width:1023px)') && files.guidedCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))') && files.guidedCss.includes('@media(max-width:767px)'), 'modo guiado usa seletor 2×2 em tablet/mobile e trilha responsiva');
must(files.guidedCss.includes('#aprendizado-guiado') && files.guidedCss.includes('min-height:48px') && files.guidedCss.includes('.mobile-tools-mode .language-toggle-v3 .language-toggle-options') && files.guidedCss.includes('scroll-margin-bottom:calc(var(--mobile-nav-height,68px)'), 'trilha guiada mobile preserva toque confortável, seletor 2×2 e distância da navegação inferior');
must(files.language.includes('data-active-mode={mode}') && files.language.includes('language-toggle-signal'), 'seletor de leitura expõe assinatura visual do modo ativo');
must(files.finalUi.includes('--reading-radius:18px') && files.finalUi.includes('--reading-radius:17px') && files.finalUi.includes('--reading-radius:11px') && files.finalUi.includes('@media (max-width:359px)'), 'modos mantêm diferenças de densidade também em telas pequenas');
must(files.finalUi.includes('@media (min-width:768px) and (max-width:1199px)') && files.finalUi.includes('@media (min-width:1200px)'), 'ritmo responsivo dos modos cobre tablet, notebook e desktop');
must(files.research.includes('Margem registrada') && files.research.includes('min-h-11'), 'pesquisas registradas mantêm informação documental e alvos de toque adequados');
must(files.electoral.includes('min-h-11') && files.electoral.includes('type="search"'), 'filtro eleitoral mantém interação mobile confortável');
must(files.quiz.includes('quiz-progress-track') && files.quizData.includes('QUIZ_TOTAL = 200') && files.quizData.includes('QUESTIONS_PER_LEVEL = 40') && files.quizData.includes('QUIZ_LEVELS'), 'quiz mantém 200 perguntas em cinco níveis e progresso visual');

must(files.pkg.scripts?.['audit:mobile'] === 'node scripts/audit-mobile.mjs', 'package.json registra esta auditoria mobile');
const appVersion = files.version.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? '';
must(appVersion === files.pkg.version && /^\d+\.\d+\.\d+$/.test(appVersion), 'versão do app e package.json permanecem sincronizadas e seguem SemVer');

must(files.index.includes('maximum-scale=5') && files.index.includes('viewport-fit=cover'), 'viewport mobile preserva zoom e safe-area');
must(files.index.includes('apple-mobile-web-app-capable') && files.index.includes('apple-mobile-web-app-title'), 'metadados de instalação iOS estão presentes');
must(files.main.includes('PWA_INSTALL_DISMISSED_KEY') && files.main.includes('Agora não') && files.main.includes("window.addEventListener('appinstalled'"), 'prompt PWA possui dispensa por sessão e cleanup após instalação');
must(files.finalUi.includes('.pwa-install-shortcut{') && files.finalUi.includes('bottom:calc(var(--mobile-nav-height,68px) + env(safe-area-inset-bottom,0px) + 12px);') && files.finalUi.includes('.pwa-install-guide-backdrop{') && files.finalUi.includes('align-items:flex-end;') && files.finalUi.includes('width:min(100%,430px);'), 'prompt PWA atual mantém atalho acima da navegação e guia responsivo à safe-area');
must(files.css.includes('@media(max-width:420px)') && files.css.includes('grid-template-columns:1fr 1fr'), 'ações do prompt PWA permanecem utilizáveis em telas estreitas');
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
