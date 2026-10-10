import fs from 'node:fs';

import path from 'node:path';

import { readCssImportGraph } from './lib/readCssImportGraph.mjs';

const root = process.cwd();

const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const errors = [];

const pass = message => console.log('PASS', message);

const must = (condition, message) => condition ? pass(message) : errors.push(message);

const app = read('src/app/App.tsx');

const search = read('src/components/layout/SearchModal.tsx');

const dialogFocus = read('src/hooks/useDialogFocus.ts');

const modeToggle = read('src/components/layout/LanguageModeToggle.tsx');

const quiz = read('src/components/sections/QuickQuiz.tsx');

const quizData = read('src/data/quiz/questionBank.ts');

const main = read('src/main.tsx');

const css = readCssImportGraph('src/assets/styles/globals.css', { root });

const pwaConfig = read('vite.config.ts');

const packageJson = JSON.parse(read('package.json'));

const version = read('src/config/version.ts');

const index = read('index.html');

const audience = read('src/components/AudienceHub.tsx');

const dashboard = read('src/components/sections/DashboardMetrics.tsx');

const executive = read('src/components/sections/ExecutiveSummary.tsx');

const executiveModel = read('src/components/sections/summary/executiveSummaryModel.ts');

const executiveSurface = executive + '\n' + executiveModel;

const formatters = read('src/utils/formatters.ts');

const dashboardChart = read('src/components/sections/HistoricalTrendChart.tsx');

const experienceShell = read('src/components/ExperienceShell.tsx');

const sentry = read('src/lib/sentry.ts');

const leaderboard = read('src/lib/quizLeaderboard.ts');

const readingModes = read('src/config/readingModes.ts');

const hero = read('src/components/sections/MunicipalHero.tsx');

const trust = read('src/components/ProjectTrustPanel.tsx');

const civic = read('src/components/sections/CivicActionHub.tsx');

const guided = read('src/components/sections/GuidedLearningPanel.tsx');

const guidedCss = readCssImportGraph('src/assets/styles/guided-mode.css', { root });

must(modeToggle.includes("id: 'summary'") && modeToggle.includes("id: 'simple'") && modeToggle.includes("id: 'guided'") && modeToggle.includes("id: 'technical'") && modeToggle.includes('aria-pressed'), '4 modos neutros de leitura disponíveis');

must(app.includes('modeForDestination') && readingModes.includes('return current;') && readingModes.includes("'guided'"), 'navegação preserva o modo atual quando o destino não exige elevação de leitura');

must(guidedCss.includes('[data-language-mode="guided"] .technical-detail') && guidedCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))'), 'modo guiado preserva separação técnica e responsividade mobile');

must(search.includes("Resumo principal") && search.includes("'resumo'"), 'busca expõe a seção de resumo sem confundir destino com modo de leitura');

const quizPromptCount = (quizData.match(/prompt:/g) || []).length;

const quizPromptLines = [...quizData.matchAll(/prompt:\s*([\"'`])([\s\S]*?)\1,/g)].map(match => match[2]);

const uniqueQuizPrompts = new Set(quizPromptLines);

const quizDifficultyLines = [...quizData.matchAll(/difficulty:\s*['\"]([^'\"]+)['\"]/g)].map(match => match[1]);

const quizDifficultyCount = new Map(quizDifficultyLines.map(level => [level, quizDifficultyLines.filter(value => value === level).length]));

must(quizData.includes('QUIZ_TOTAL = 200') && quizData.includes('QUESTIONS_PER_LEVEL = 40') && quizData.includes('QUIZ_LEVELS'), 'quiz possui contrato explícito de 200 perguntas em 5 níveis');

must(quiz.includes('readQuizBestScores') && !quiz.includes('readQuizHighScores') && !quiz.includes('recordQuizHighScore') && leaderboard.includes('BEST_KEY'), 'quiz mantém apenas melhor marca pessoal persistida');

must(!experienceShell.includes('framer-motion') && !experienceShell.includes('rotateY') && !experienceShell.includes('AnimatePresence'), 'navegação não depende de page-flip decorativo');

must(!packageJson.dependencies?.['framer-motion'] && !packageJson.devDependencies?.['framer-motion'], 'framer-motion foi removido por não possuir uso ativo');

must(dashboardChart.includes("from 'recharts'") && dashboardChart.includes('<LineChart') && dashboardChart.includes('d.populationSeries') && dashboardChart.includes("point.kind==='census'"), 'dashboard possui série de população publicada, distinguindo Censo e estimativa');

must(sentry.includes("import('@sentry/react')") && sentry.includes('browserTracingIntegration') && sentry.includes('tracesSampleRate') && !sentry.match(/^import \* as Sentry/m), 'Sentry é carregado condicionalmente e mantém captura configurável');

must(quiz.includes('QUESTION_BANK.length !== QUIZ_TOTAL') && quiz.includes('QUESTION_BANK.filter(q => q.difficulty === level)'), 'quiz valida o total e a distribuição por nível em runtime');

must(['Começar', 'Entender', 'Comparar', 'Conferir', 'Aplicar'].every(level => quizData.includes(JSON.stringify(level))), 'quiz possui os 5 níveis de dificuldade');

must(quiz.includes('unlockedPhase') && quiz.includes('setUnlockedPhase') && quiz.includes('nextIndex'), 'quiz possui progressão obrigatória por fases');

must(quiz.includes('QUIZ_TOTAL') && quiz.includes('QUESTIONS_PER_LEVEL') && quiz.includes('quiz-phase-grid'), 'quiz possui meta e mapa visual de fases');

must(quiz.includes('disabled={locked}') && quiz.includes('aria-disabled={locked}'), 'quiz bloqueia fases ainda não liberadas');

must(quiz.includes('quiz-progress-track') && quiz.includes('questions.length'), 'quiz possui progresso visual');

must(!search.includes('autoFocus'), 'busca não usa autoFocus');

must(search.includes('const getInitialFocus') && search.includes('closeButtonRef') && dialogFocus.includes('getInitialFocus?.()') && dialogFocus.includes('target?.focus()'), 'busca foca o campo no desktop e um controle seguro no mobile');

must(app.includes("window.location.hash") && app.includes("hashchange") && app.includes('observatorio:navigate'), 'links com UTM + âncora recebem navegação resiliente');

must(css.includes('overflow-wrap:anywhere') && css.includes('.mobile-safe-wrap'), 'contenção de overflow textual está ativa');

must(pwaConfig.includes('VitePWA') && pwaConfig.includes("registerType: 'autoUpdate'"), 'PWA usa autoUpdate');

must(main.includes('beforeinstallprompt') && main.includes('PwaInstallPrompt'), 'PWA possui prompt de instalação quando o navegador oferece suporte');

must(index.includes('manifest.webmanifest') && index.includes('apple-mobile-web-app-capable'), 'metadados de instalação estão publicados');

must(css.includes('--obs-font-sans') && css.includes('font-synthesis:none'), 'tipografia usa stack estável e síntese desativada');

must(css.includes('.obs-card') && css.includes('.source-card') && css.includes('.search-empty-action'), 'cards, fontes e estado vazio da busca possuem tratamento visual dedicado');

must(css.includes('summary-public-facts') && css.includes('summary-public-fact'), 'Resumo público possui cartões de contexto rápido');

must(
  search.includes('const target =')
    && search.includes('navigateToSection(target)')
    && search.includes("from '../../lib/sectionNavigation'")
    && !search.includes('document.getElementById(id)?.scrollIntoView'),
  'busca navega por hash pelo controlador central sem scroll duplicado'
);

must(search.includes('search-empty-action') && !search.includes('document.getElementById(id)?.scrollIntoView'), 'seleção de busca não dispara scroll direto e infinito');

const versionMatch = version.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);

must(versionMatch?.[1] === packageJson.version, `versão marcada como ${packageJson.version}`);

must(quiz.includes('className="quiz-phase-grid"') && quiz.includes('Fase {index + 1}') && quiz.includes('Bloqueada'), 'quiz possui roadmap visual de fases');

must(formatters.includes('minimumFractionDigits: 2') && formatters.includes('maximumFractionDigits: 2'), 'valores monetários usam duas casas decimais');

must(!audience.includes('<SummaryTodayCard') && !audience.includes("import { SummaryTodayCard }"), 'Resumo não duplica o rail de indicadores na seção Explorar');

must(audience.includes("id: 'acao'") && audience.includes('Encontrar um serviço') && audience.includes('navigateToCleanSection(id)'), 'Home oferece atalho direto para serviços públicos');

must(!audience.includes("document.getElementById(id)?.scrollIntoView"), 'Home delega o scroll de navegação ao controlador central');

must(
  audience.includes('navigateToCleanSection') &&
  executive.includes('navigateToCleanSection') &&
  !audience.includes('window.history.replaceState') &&
  !executive.includes('window.history.replaceState'),
  'Resumo e Explorar usam navegação central com limpeza de URL'
);

must(app.includes('id="main-content"') && (app.match(/skip-link/g) || []).length <= 2, 'acessibilidade mantém um único caminho de salto funcional');

must(!(read('src/components/sections/MunicipalHero.tsx')).includes('Modo Eleição') && !(read('src/components/sections/MunicipalHero.tsx')).includes('electionMode'), 'Modo Eleição cosmético permanece removido');

must((read('src/components/sections/MunicipalHero.tsx')).includes('hero-reference-card') && (read('src/components/sections/MunicipalHero.tsx')).includes('<small>População</small><strong>IBGE</strong>') && (read('src/components/sections/MunicipalHero.tsx')).includes('<small>Orçamento</small><strong>LOA municipal</strong>'), 'cards hero exibem fonte diretamente');

must(executiveSurface.includes('Orçamento planejado por habitante') && executiveSurface.includes('budget-per-capita-') && executiveSurface.includes('item.value'), 'Resumo usa orçamento planejado por habitante do registro estruturado');

must(
  executiveSurface.includes('budget-per-capita-') &&
  executiveSurface.includes('formatIndicatorStatus(item.status)') &&
  executiveSurface.includes('note:item.note'),
  'indicador per capita explicita fórmula e natureza'
);

must(read('src/components/sections/MunicipalHero.tsx').includes('<small>Transporte</small>') && read('src/components/sections/MunicipalHero.tsx').includes('Tarifa semiurbana · Entorno-DF'), 'tarifa do hero identifica o contexto do transporte');

const transport = read('src/components/TransportCalculator.tsx');

const transportLib = read('src/lib/transport.ts');

must(transport.includes('Dias por semana'), 'simulador permite informar dias de trabalho por semana');

must(transportLib.includes('4.4') || transportLib.includes('daysPerWeek'), 'cálculo do transporte suporta conversão semanal para mensal');

const publicDataSource = read('src/data/observatorioData.ts');

const publicBudget = read('src/components/sections/BudgetSection.tsx');

const publicSanitation = read('src/components/sections/SanitationHealthSection.tsx');

must(
  publicDataSource.includes('minimumWageYear') &&
  transport.includes('minimumWageYear') &&
  transport.includes('salaryIsDefault'),
  'simulador distingue renda padrão de valor ajustado com ano estruturado'
);

must(
  publicBudget.includes('fiscalReferenceYear') &&
  publicBudget.includes('dashboard-meta-chip') &&
  publicBudget.includes('formatDate'),
  'orçamento deriva ano-base e exibe metadados estruturados'
);

must(
  publicSanitation.includes('sanitationReferenceYear') &&
  publicSanitation.includes('adequateSewerageYear') &&
  publicSanitation.includes('formatDate'),
  'saneamento deriva anos e referências dos indicadores'
);

const executiveSummary = executiveSurface;

must(
  executiveSummary.includes('d.populationSeries') &&
  executiveSummary.includes('budget-per-capita-') &&
  executiveSummary.includes('public-sewer-service-') &&
  executiveSummary.includes('indicatorReference(item,source)') &&
  !executiveSummary.includes('find(point => point.year === 2026)') &&
  !executiveSummary.includes("'Cálculo · LOA 2026 ÷ IBGE 2026'"),
  'resumo executivo deriva anos e metadados do dataset estruturado'
);

must(transport.includes('minimumWageBrl'), 'simulador usa salário mínimo do dataset como referência');

must(transport.includes('bilhetagem') && transport.includes('terminal'), 'simulador contextualiza integração de transporte');

must(index.includes('og:image') && index.includes('twitter:card') && index.includes('canonical'), 'SEO e compartilhamento social possuem metadados completos');

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria de engajamento concluída');
}

const transportSource = read('src/components/TransportCalculator.tsx');

const transportScenario = read('src/hooks/useTransportScenario.ts');

const transportSurface = transportSource + '\n' + transportScenario;

const transportDomain = read('src/lib/transport.ts');

must(transportSurface.includes('observatorio:transport-preferences:v1') && transportSurface.includes('JSON.parse'), 'simulador persiste preferências com cache local opcional');

must(transportDomain.includes('Number.isFinite') && transportDomain.includes('clamp('), 'simulador valida números finitos e limites lógicos');

must(executiveSurface.includes('formatIndicatorStatus(item.status)') && executiveSurface.includes('fact.badge'), 'resumo exibe badges de proveniência');

must(read('public/404.html').includes('data-obs-spa-fallback') && read('public/404.html').includes('encodeURIComponent') && read('public/404.html').includes("relative.indexOf('api/')") && read('index.html').includes('obsSpaRestored'), 'fallback SPA preserva rota virtual sem capturar APIs ou assets');
