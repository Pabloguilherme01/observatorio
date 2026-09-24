import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const errors = [];
const pass = message => console.log('PASS', message);
const must = (condition, message) => condition ? pass(message) : errors.push(message);

const app = read('src/app/App.tsx');
const search = read('src/components/layout/SearchModal.tsx');
const modeToggle = read('src/components/layout/LanguageModeToggle.tsx');
const quiz = read('src/components/sections/QuickQuiz.tsx');
const social = read('src/components/InstagramSyncHub.tsx');
const electoral360 = read('src/data/electoral360.ts');
const main = read('src/main.tsx');
const css = read('src/assets/styles/globals.css');
const pwaConfig = read('vite.config.ts');
const sync = read('.github/workflows/sync-tse-2026.yml');
const version = read('src/config/version.ts');
const index = read('index.html');
const audience = read('src/components/AudienceHub.tsx');
const dashboard = read('src/components/sections/DashboardMetrics.tsx');
const executive = read('src/components/sections/ExecutiveSummary.tsx');
const formatters = read('src/utils/formatters.ts');

must(modeToggle.includes("setMode('summary')") && modeToggle.includes("setMode('simple')") && modeToggle.includes("setMode('technical')"), '3 modos neutros de leitura disponíveis');
must(!modeToggle.includes("'market'") && !modeToggle.includes('Hype'), 'modo eleitoral agressivo não foi introduzido');
const quizPromptCount = (quiz.match(/\n      prompt:/g) || []).length;
const quizPromptLines = [...quiz.matchAll(/\n      prompt:\s*([\"'`])([\s\S]*?)\1,/g)].map(match => match[2]);
const uniqueQuizPrompts = new Set(quizPromptLines);
const quizDifficultyLines = [...quiz.matchAll(/difficulty:\s*['\"]([^'\"]+)['\"]/g)].map(match => match[1]);
const quizDifficultyCount = new Map(quizDifficultyLines.map(level => [level, quizDifficultyLines.filter(value => value === level).length]));
must(quizPromptCount === 100 && quizPromptLines.length === 100, 'quiz possui exatamente 100 perguntas');
must(uniqueQuizPrompts.size === 100, 'quiz possui 100 perguntas distintas');
must(['Fácil', 'Médio', 'Difícil', 'Avançado'].every(level => quizDifficultyCount.get(level) === 25), 'quiz possui 25 perguntas por nível');
must(quiz.includes('phasePassed') && quiz.includes('advancePhase') && quiz.includes('LEVELS[phase]'), 'quiz possui progressão obrigatória por fases');
must(quiz.includes('phaseTarget') && quiz.includes('quiz-phase-roadmap'), 'quiz possui meta e mapa visual de fases');
must(!quiz.includes('setDifficulty') && !quiz.includes('Nível do quiz'), 'quiz não permite troca manual de fase');
must(quiz.includes('quiz-progress-track') && quiz.includes('filteredQuestions.length'), 'quiz possui progresso visual');
must(read('src/components/layout/Footer.tsx').includes('https://www.instagram.com/pablo.builds.ia'), 'Instagram do autor está no rodapé');
must(!search.includes('autoFocus'), 'busca não usa autoFocus');
must(search.includes('min-width: 768px') && search.includes('focus()'), 'busca só força foco no desktop');
must(app.includes("window.location.hash") && app.includes("hashchange") && app.includes('observatorio:navigate'), 'links com UTM + âncora recebem navegação resiliente');
must(css.includes('overflow-wrap:anywhere') && css.includes('.mobile-safe-wrap'), 'contenção de overflow textual está ativa');
must(social.includes('pabloguilherme01.github.io/observatorio') && social.includes('Baixar Story') && social.includes('Baixar Feed'), 'estúdio social inclui marca d’água e downloads explícitos');
must(social.includes('1080') && social.includes('1920') && social.includes('1350'), 'estúdio social mantém formatos Story e Feed');
must(electoral360.includes('photoUrl: candidate.photoUrl ?? null') && electoral360.includes('instagramUrl: candidate.instagramUrl ?? null'), 'metadados de mídia do candidato são preservados quando validados');
must(pwaConfig.includes('VitePWA') && pwaConfig.includes("registerType: 'autoUpdate'"), 'PWA usa autoUpdate');
must(main.includes('beforeinstallprompt') && main.includes('PwaInstallPrompt'), 'PWA possui prompt de instalação quando o navegador oferece suporte');
must(index.includes('manifest.webmanifest') && index.includes('apple-mobile-web-app-capable'), 'metadados de instalação estão publicados');
must(css.includes('--obs-font-sans') && css.includes('font-synthesis:none'), 'tipografia usa stack estável e síntese desativada');
must(css.includes('.obs-card') && css.includes('.source-card') && css.includes('.search-empty-action'), 'cards, fontes e estado vazio da busca possuem tratamento visual dedicado');
must(css.includes('summary-public-facts') && css.includes('summary-public-fact-body'), 'Resumo público possui descobertas rápidas expansíveis');
must(search.includes('destinationLabel') && search.includes('history.replaceState(null, \'\', \'#\' + target)'), 'busca navega por hash sem scroll duplicado');
must(search.includes('search-empty-action') && !search.includes('document.getElementById(id)?.scrollIntoView'), 'seleção de busca não dispara scroll direto e infinito');
must(sync.includes("cron: '0 */4 * * *'"), 'sincronização TSE está programada a cada 4 horas');
const versionMatch = version.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
must(versionMatch?.[1] === '44.9.0', 'versão marcada como 44.9.0');
must((quiz.match(/quiz-phase-roadmap/g) || []).length === 1, 'quiz possui apenas um roadmap de fases');
must(formatters.includes('minimumFractionDigits: 2') && formatters.includes('maximumFractionDigits: 2'), 'valores monetários usam duas casas decimais');
must(!audience.includes('<SummaryTodayCard') && !audience.includes("import { SummaryTodayCard }"), 'Resumo não duplica o rail de indicadores na seção Explorar');
must(executive.includes('poll?.pollster') && executive.includes('poll?.method') && executive.includes('poll?.registrationNumber'), 'card de pesquisa exibe identificação e cenário');
must(files.app.includes('id="main-content"') && (files.app.match(/skip-link/g) || []).length <= 2, 'acessibilidade mantém um único caminho de salto funcional');
must(files.hero.includes('Modo Eleição') && files.hero.includes('Ativar Modo Eleição') && files.hero.includes('aria-pressed'), 'Modo Eleição possui alternador visível e acessível');
must(files.hero.includes('Fonte: IBGE') && files.hero.includes('Fonte: TSE'), 'cards hero exibem fonte diretamente');
must(dashboard.includes('Orçamento planejado por habitante') && files.dashboard.includes('totalBrl') && files.dashboard.includes('population2026'), 'dashboard calcula orçamento planejado por habitante');
must(files.dashboard.includes('LOA ÷ população') || files.dashboard.includes('LOA / população'), 'indicador per capita explicita fórmula');
must(files.hero.includes('transporte semiurbano') && files.hero.includes('Entorno-DF'), 'tarifa do hero identifica o contexto do transporte');
must(files.dashboard.includes('Crescimento populacional · 2022–2026') && files.dashboard.includes('Eleitorado · 2018–2026'), 'dashboard mantém tendências históricas');



if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria de engajamento concluída');
}
