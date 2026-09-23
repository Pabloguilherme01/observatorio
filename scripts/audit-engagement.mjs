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

must(modeToggle.includes("setMode('summary')") && modeToggle.includes("setMode('simple')") && modeToggle.includes("setMode('technical')"), '3 modos neutros de leitura disponíveis');
must(!modeToggle.includes("'market'") && !modeToggle.includes('Hype'), 'modo eleitoral agressivo não foi introduzido');
must((quiz.match(/prompt:\s*'/g) || []).length >= 10, 'quiz possui pelo menos 10 perguntas');
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
must(search.includes('destinationLabel') && search.includes('history.replaceState(null, \'\', \'#\' + id)'), 'busca navega por hash sem scroll duplicado');
must(search.includes('search-empty-action') && !search.includes('document.getElementById(id)?.scrollIntoView'), 'seleção de busca não dispara scroll direto e infinito');
must(sync.includes("cron: '0 */4 * * *'"), 'sincronização TSE está programada a cada 4 horas');
const versionMatch = version.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
must(versionMatch?.[1] === '44.7.0', 'versão marcada como 44.7.0');

if (errors.length) {
  console.error('FAIL ' + errors.length + ' regra(s)');
  errors.forEach(error => console.error(' - ' + error));
  process.exitCode = 1;
} else {
  pass('auditoria de engajamento concluída');
}
