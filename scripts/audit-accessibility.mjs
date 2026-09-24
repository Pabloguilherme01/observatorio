import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const css = read('src/assets/styles/globals.css');
const index = read('index.html');
const app = read('src/app/App.tsx');
const hero = read('src/components/sections/HeroCountdown.tsx');
const dashboard = read('src/components/sections/DashboardMetrics.tsx');
const dashboardChart = read('src/components/sections/HistoricalTrendChart.tsx');
const comparison = read('src/components/sections/ContextComparison.tsx');
const context = read('src/context/LanguageModeContext.tsx');
const theme = read('src/context/ThemeContext.tsx');

const errors = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);
const must = (condition, message) => condition ? pass(message) : fail(message);

function luminance(hex) {
  const raw = hex.replace('#', '');
  const rgb = [0, 2, 4].map(index => parseInt(raw.slice(index, index + 2), 16) / 255);
  const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(foreground, background) {
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

must(/lang=["']pt-BR["']/.test(index), 'documento declara idioma pt-BR');
must(index.includes('og:image') && index.includes('twitter:image'), 'preview social possui imagem');
must(index.includes('application-name') && index.includes('apple-mobile-web-app-title'), 'metadados de nome para instalação mobile estão presentes');
must(theme.includes('meta[name="theme-color"]') && theme.includes('#f5f7fa') && theme.includes('#0b1117'), 'theme-color acompanha o tema da aplicação');
must(css.includes(':focus-visible'), 'foco de teclado possui estilo visível');
must(css.includes('prefers-reduced-motion'), 'redução de movimento está contemplada');
must(css.includes('min-height: 44px') || css.includes('min-height:44px'), 'controles móveis usam alvo de toque confortável');
must(/@media\s*\(max-width:\s*390px\)/.test(css), 'há ajuste dedicado para telas muito estreitas');
must(hero.includes('aria-pressed') && hero.includes('hero-mobile-election-toggle'), 'alternância de linguagem informa estado ao leitor de tela');
must(hero.includes('observatorio:election-mode') && hero.includes('aria-label'), 'Modo Eleição expõe estado e ação de forma acessível');
must(comparison.includes('role=\"tablist\"') && comparison.includes('aria-selected'), 'abas de contexto têm semântica acessível');
must((dashboard.includes('role=\"img\"') && dashboard.includes('aria-label')) || (dashboardChart.includes('role=\"img\"') && dashboardChart.includes('aria-label')), 'gráficos principais possuem alternativa textual');
must(app.includes('<LanguageModeProvider>'), 'modo de linguagem está integrado na aplicação');
must(context.includes('localStorage'), 'preferência de linguagem é persistida sem depender de servidor');

const darkPairs = [
  ['#e6edf3', '#0b1117', 4.5],
  ['#94a3b8', '#0b1117', 4.5],
  ['#7d8da3', '#0b1117', 4.5],
  ['#718096', '#0b1117', 4.5],
  ['#8cc8f2', '#0b1117', 3],
];
for (const [fg, bg, minimum] of darkPairs) {
  const ratio = contrast(fg, bg);
  must(ratio >= minimum, 'contraste ' + fg + ' sobre ' + bg + ' >= ' + minimum + ':1 (' + ratio.toFixed(2) + ':1)');
}

if (!errors.length) {
  pass('auditoria de acessibilidade concluída');
} else {
  console.error('FAIL ' + errors.length + ' regra(s)');
  for (const error of errors) console.error(' -', error);
  process.exitCode = 1;
}