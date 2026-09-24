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
must(quiz.includes('QUIZ_TOTAL = 200') && quiz.includes('QUESTIONS_PER_LEVEL = 40') && quiz.includes('QUIZ_LEVELS'), 'quiz possui contrato explícito de 200 perguntas em 5 níveis');
must(quiz.includes('QUESTION_BANK.length !== QUIZ_TOTAL') && quiz.includes('QUESTION_BANK.filter(q => q.difficulty === level)'), 'quiz valida o total e a distribuição por nível em runtime');
must(['Fácil', 'Médio', 'Difícil', 'Avançado', 'Expert'].every(level => quiz.includes(`difficulty:'${level}'`)), 'quiz possui os 5 níveis de dificuldade');
must(quiz.includes('unlockedPhase') && quiz.includes('setUnlockedPhase') && quiz.includes('nextIndex'), 'quiz possui progressão obrigatória por fases');
must(quiz.includes('QUIZ_TOTAL') && quiz.includes('QUESTIONS_PER_LEVEL') && quiz.includes('quiz-phase-grid'), 'quiz possui meta e mapa visual de fases');
must(quiz.includes('disabled={locked}') && quiz.includes('aria-disabled={locked}'), 'quiz bloqueia fases ainda não liberadas');
must(quiz.includes('quiz-progress-track') && quiz.includes('questions.length'), 'quiz possui progresso visual');
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
must(css.includes('summary-public-facts') && css.includes('summary-public-fact'), 'Resumo público possui cartões de contexto rápido');
must(search.includes('destinationLabel') && search.includes('history.replaceState(null, \'\', \'#\' + target)'), 'busca navega por hash sem scroll duplicado');
must(search.includes('search-empty-action') && !search.includes('document.getElementById(id)?.scrollIntoView'), 'seleção de busca não dispara scroll direto e infinito');
must(sync.includes("cron: '0 */4 * * *'"), 'sincronização TSE está programada a cada 4 horas');
const versionMatch = version.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
must(versionMatch?.[1] === '44.9.1', 'versão marcada como 44.9.1');
must((quiz.match(/quiz-phase-grid/g) || []).length === 1 && quiz.includes('Bloqueada'), 'quiz possui apenas um roadmap visual de fases');
must(formatters.includes('minimumFractionDigits: 2') && formatters.includes('maximumFractionDigits: 2'), 'valores monetários usam duas casas decimais');
must(!audience.includes('<SummaryTodayCard') && !audience.includes("import { SummaryTodayCard }"), 'Resumo não duplica o rail de indicadores na seção Explorar');
must(executive.includes('poll?.pollster') && executive.includes('poll?.method') && executive.includes('poll?.registrationNumber'), 'card de pesquisa exibe identificação e cenário');
must(app.includes('id="main-content"') && (app.match(/skip-link/g) || []).length <= 2, 'acessibilidade mantém um único caminho de salto funcional');
must((read('src/components/sections/HeroCountdown.tsx')).includes('Modo Eleição') && (read('src/components/sections/HeroCountdown.tsx')).includes('Ativar Modo Eleição') && (read('src/components/sections/HeroCountdown.tsx')).includes('aria-pressed'), 'Modo Eleição possui alternador visível e acessível');
must((read('src/components/sections/HeroCountdown.tsx')).includes('Fonte: IBGE') && (read('src/components/sections/HeroCountdown.tsx')).includes('Fonte: TSE'), 'cards hero exibem fonte diretamente');
must(dashboard.includes('Orçamento planejado por habitante') && dashboard.includes('totalBrl') && dashboard.includes('population2026'), 'dashboard calcula orçamento planejado por habitante');
must(dashboard.includes('LOA ÷ população') || dashboard.includes('LOA / população'), 'indicador per capita explicita fórmula');
must(read('src/components/sections/HeroCountdown.tsx').includes('tarifa semiurbana') && read('src/components/sections/HeroCountdown.tsx').includes('Entorno-DF'), 'tarifa do hero identifica o contexto do transporte');
must(dashboard.includes('Crescimento populacional · 2022–2026') && dashboard.includes('Eleitorado · 2018–2026'), 'dashboard mantém tendências históricas');
const transport = read('src/components/TransportCalculator.tsx');
const transportLib = read('src/lib/transport.ts');
must(transport.includes('Dias por semana'), 'simulador permite informar dias de trabalho por semana');
must(transportLib.includes('4.4') || transportLib.includes('daysPerWeek'), 'cálculo do transporte suporta conversão semanal para mensal');
must(transport.includes('minimumWageBrl'), 'simulador usa salário mínimo do dataset como referência');
must(transport.includes('bilhetagem') && transport.includes('terminal'), 'simulador contextualiza integração de transporte');
const electoralProfile = read('src/components/sections/ElectoralProfile.tsx');
must(electoralProfile.includes('4.063') && electoralProfile.includes('2024') && electoralProfile.includes('DF'), 'perfil eleitoral registra migração de títulos do DF com ano e quantidade');
must(index.includes('og:image') && index.includes('twitter:card') && index.includes('canonical'), 'SEO e compartilhamento social possuem metadados completos');
const candidateData = JSON.parse(read('src/data/generated/tse2026-candidates.json'));
const candidateNames = candidateData.matched.map(candidate => candidate.name);
const candidateIds = candidateData.matched.map(candidate => candidate.sqCandidate);
must(candidateData.matched.length === 7, 'recorte público de candidatos possui 7 nomes mapeados');
must(new Set(candidateIds).size === candidateIds.length, 'candidatos não possuem SQ_CANDIDATO duplicado');
must(['KEKE DA VULKANIC','RIBEIRO DO TÚLLIO','FELIPE GALDINO'].every(name => candidateNames.includes(name)), 'candidatos locais adicionados ao recorte');
must(candidateData.matched.every(candidate => candidate.status === 'DEFERIDO'), 'status cadastral publicado está atualizado para DEFERIDO');
must(candidateData.matched.every(candidate => candidate.localEvidence && Array.isArray(candidate.evidenceSourceUrls) && candidate.evidenceSourceUrls.length > 0), 'cada candidato possui evidência documental de vínculo local');
must(!candidateData.meta.selection.includes('watchlist_only') || candidateData.matched.length === candidateData.watchlist.length, 'seleção do recorte não fica menor que a watchlist publicada');



if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria de engajamento concluída');
}

const transportSource = read('src/components/TransportCalculator.tsx');
const transportDomain = read('src/lib/transport.ts');
must(transportSource.includes('observatorio:transport-preferences:v1') && transportSource.includes('JSON.parse'), 'simulador persiste preferências com cache local opcional');
must(transportDomain.includes('Number.isFinite') && transportDomain.includes('clamp('), 'simulador valida números finitos e limites lógicos');
must(read('src/components/ProjectTrustPanel.tsx').includes('dadosabertos.tse.jus.br') && read('src/components/ProjectTrustPanel.tsx').includes('Nota de neutralidade'), 'painel oferece validação oficial e nota de neutralidade');
must(read('src/components/sections/ExecutiveSummary.tsx').includes('Fonte pública') && read('src/components/sections/ExecutiveSummary.tsx').includes('Derivado'), 'resumo exibe badges de proveniência');
must(read('public/404.html').includes('href="./"') && read('public/404.html').includes('Eleições Gerais 2026'), '404 é compatível com a base do GitHub Pages');
