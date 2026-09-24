import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);
const warn = message => warnings.push(message);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(tsx|ts|css|html)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const sourceFiles = [...walk(path.join(root, 'src')), path.join(root, 'index.html')].filter(fs.existsSync);
const texts = sourceFiles.map(file => ({ file: path.relative(root, file).replaceAll('\\', '/'), content: fs.readFileSync(file, 'utf8') }));
const combined = texts.map(item => item.content).join('\n');
const ids = new Set();
const internalRefs = new Map();
const externalLinks = [];

for (const { file, content } of texts) {
  for (const match of content.matchAll(/id=["']([^"']+)["']/g)) ids.add(match[1]);
  for (const match of content.matchAll(/href=["']#([^"']+)["']/g)) internalRefs.set(match[1], file);
  for (const match of content.matchAll(/getElementById\(["']([^"']+)["']\)/g)) internalRefs.set(match[1], file);
  if (!file.startsWith('src/data/')) {
    for (const match of content.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>/g)) externalLinks.push({ file, url: match[1], context: match[0] });
  }
}

const broken = [...internalRefs.entries()].filter(([id]) => !ids.has(id));
if (broken.length) broken.forEach(([id, file]) => fail('Âncora interna sem alvo: #' + id + ' em ' + file));
else pass('âncoras internas estáticas possuem alvo');

for (const link of externalLinks) {
  if (!link.url.startsWith('https://')) warn('Link externo sem HTTPS: ' + link.url);
  if (/target=["']_blank["']/.test(link.context) && !/rel=["'][^"']*noopener/.test(link.context)) fail('Link target=_blank sem rel=noopener: ' + link.url);
}
pass(externalLinks.length + ' links externos encontrados para auditoria estrutural');

const navFile = texts.find(item => item.file === 'src/config/navigation.ts')?.content ?? '';
const navigationIds = [...navFile.matchAll(/id:\s*'([^']+)'/g)].map(match => match[1]);
const missingNavigationIds = navigationIds.filter(id => !ids.has(id));
if (missingNavigationIds.length) missingNavigationIds.forEach(id => fail('Item de navegação sem seção correspondente: #' + id));
else pass(navigationIds.length + ' itens de navegação possuem seção correspondente');

for (const [id, label] of [['descubra','descoberta inicial'],['mudancas-snapshot','histórico de mudanças'],['fontes','verificação de fontes'],['acao','ação cívica oficial'],['quiz','retenção/aprendizado'],['exportacao','exportação']]) {
  if (!ids.has(id)) fail('Jornada pública sem etapa: ' + label + ' (#' + id + ')');
}
pass('jornada pública cobre descobrir → conferir mudanças → verificar fontes → agir → revisar compreensão → exportar');

const app = texts.find(item => item.file === 'src/app/App.tsx')?.content ?? '';
const mountedSources = [
  app,
  texts.find(item => item.file === 'src/components/sections/DeferredCivicGroup.tsx')?.content ?? '',
  texts.find(item => item.file === 'src/components/sections/DeferredPublicDataGroup.tsx')?.content ?? '',
  texts.find(item => item.file === 'src/components/sections/DeferredEvidenceGroup.tsx')?.content ?? '',
  texts.find(item => item.file === 'src/components/sections/DeferredTrustGroup.tsx')?.content ?? '',
].join('\n');

for (const [component, label] of [
  ['AudienceHub','descoberta'],
  ['QuickQuiz','retenção'],
  ['DataQualityPanel','qualidade'],
  ['EvidenceChain','evidências'],
  ['CivicActionHub','ação'],
  ['DataExportActions','exportação'],
  ['InstagramSyncHub','compartilhamento'],
]) {
  if (!mountedSources.includes('<' + component)) fail('Camada de ' + label + ' não está montada: ' + component);
}
pass('camadas de descoberta, retenção, qualidade, evidências, ação, exportação e compartilhamento montadas');

const mobileNav = texts.find(item => item.file === 'src/components/layout/MobileBottomNav.tsx')?.content ?? '';
if (!mobileNav.includes('Navegação principal no celular')) fail('Navegação mobile rotulada ausente');
else pass('navegação mobile rotulada e integrada ao fluxo principal');

const search = texts.find(item => item.file === 'src/components/layout/SearchModal.tsx')?.content ?? '';
if (!search.includes('Resposta rápida') || !search.includes('ArrowDown')) fail('Busca não oferece resposta rápida e navegação por teclado');
else pass('busca possui resposta rápida e navegação por teclado');

const css = texts.find(item => item.file === 'src/assets/styles/globals.css')?.content ?? '';
for (const [needle, label] of [[':focus-visible','foco visível'],['prefers-reduced-motion','redução de movimento'],['safe-area-inset-bottom','safe-area mobile'],['scroll-snap-type','rails mobile'],['@media (max-width:390px)','telas muito pequenas'],['min-height:44px','alvo de toque mobile'],['--mobile-touch:44px','alvo de toque mobile']]) {
  if (!css.includes(needle)) fail('Camada visual/acessível ausente: ' + label);
}
pass('camadas visuais e mobile essenciais presentes');

if (externalLinks.filter(link => /github|tse\.jus\.br|divulgacandcontas\.tse\.jus\.br/.test(link.url)).length >= 3) pass('links institucionais críticos encontrados em HTTPS');

const actionLabels = [...combined.matchAll(/>([^<>]{2,80})<\/button>/g)].map(match => match[1].replace(/\s+/g, ' ').trim());
const ambiguous = actionLabels.filter(label => /^(abrir|ver|saiba mais|clique aqui)\b/i.test(label));
if (ambiguous.length > 8) warn(ambiguous.length + ' rótulos de botão potencialmente genéricos');
else pass('rótulos de ações principais são suficientemente descritivos');

if (combined.includes('election-mode-actions') && combined.includes('mode-election')) pass('Modo Eleição é reversível e separado da leitura padrão');
else fail('Modo Eleição perdeu a separação da leitura padrão');

const languageToggle = texts.find(item => item.file === 'src/components/layout/LanguageModeToggle.tsx')?.content ?? '';
const languageContext = texts.find(item => item.file === 'src/context/LanguageModeContext.tsx')?.content ?? '';
if (
  languageToggle.includes('language-toggle-v3') &&
  languageToggle.includes('aria-pressed') &&
  languageToggle.includes("id === 'summary'") &&
  languageToggle.includes("id === 'simple'") &&
  languageToggle.includes("id === 'technical'") &&
  languageContext.includes("value === 'technical'") &&
  languageContext.includes("value === 'summary'")
) pass('contrato de linguagem Resumo/Simples/Técnico presente');
else fail('distinção de linguagem simples vs técnica incompleta');

const mobileSafety = [
  '@media (max-width:390px)',
  'overflow-wrap:anywhere',
];
if (mobileSafety.every(value => combined.includes(value) || css.includes(value))) pass('proteções de experiência mobile presentes');
else warn('algumas proteções mobile podem estar ausentes');

console.log(JSON.stringify({ valid: errors.length === 0, filesScanned: sourceFiles.length, ids: ids.size, internalRefs: internalRefs.size, externalLinks: externalLinks.length, warnings, errors }, null, 2));
if (errors.length) process.exitCode = 1;
