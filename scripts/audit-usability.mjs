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
const readingModes = texts.find(item => item.file === 'src/config/readingModes.ts')?.content ?? '';
const languageContextSource = texts.find(item => item.file === 'src/context/LanguageModeContext.tsx')?.content ?? '';
if (
  app.includes('NavigationModeBridge') &&
  app.includes('modeForDestination') &&
  readingModes.includes('TECHNICAL_ONLY_DESTINATIONS') &&
  readingModes.includes('SUMMARY_HIDDEN_DESTINATIONS') &&
  languageContextSource.includes('fallbackDestinationForMode')
) pass('deep links, navegação e redução de modo compartilham a mesma política de visibilidade');
else fail('navegação por hash pode abrir uma seção escondida no modo de leitura atual');
const header = texts.find(item => item.file === 'src/components/layout/Header.tsx')?.content ?? '';
if (
  header.includes('aria-haspopup="menu"') &&
  header.includes("ArrowDown") &&
  header.includes("ArrowUp") &&
  header.includes("event.key === 'Home'") &&
  header.includes("event.key === 'End'") &&
  (header.includes("items[0]?.focus()") || header.includes("items.at(-1)") && header.includes("items[0]"))
) pass('menu desktop Mais possui navegação por teclado e foco previsível');
else fail('menu desktop Mais não possui navegação de teclado completa');
if (app.includes('onSameHashAnchor') && app.includes("window.location.hash !== '#' + target") && app.includes('navigateToHash(target)')) pass('navegação central trata também o clique repetido na mesma âncora');
else fail('navegação pode não reprocessar a mesma âncora para sincronizar modo e rolagem');

const civic = texts.find(item => item.file === 'src/components/sections/CivicActionHub.tsx')?.content ?? '';
for (const [needle, label] of [
  ['Consultar situação eleitoral', 'situação eleitoral'],
  ['Justificar ausência', 'justificativa eleitoral'],
  ['Emitir certidões eleitorais', 'certidões eleitorais'],
  ['Quitar débitos eleitorais', 'débitos eleitorais'],
  ['autoatendimento-eleitoral', 'Autoatendimento TSE'],
  ['justificativa-eleitoral', 'justificativa TSE'],
  ['servicos-eleitorais/certidoes', 'certidões TSE'],
  ['quitacao-de-multas', 'multas TSE'],
]) {
  if (!civic.includes(needle)) fail('Serviço público eleitoral ausente: ' + label);
}
if (civic.includes('Consultar situação eleitoral') && civic.includes('Emitir certidões eleitorais') && civic.includes('Quitar débitos eleitorais')) {
  pass('hub cívico oferece os principais serviços eleitorais oficiais');
}

const mountedSources = [
  app,
  texts.find(item => item.file === 'src/components/sections/DeferredCivicGroup.tsx')?.content ?? '',
  texts.find(item => item.file === 'src/components/sections/DeferredPublicDataGroup.tsx')?.content ?? '',
  texts.find(item => item.file === 'src/components/sections/DeferredEvidenceGroup.tsx')?.content ?? '',
  texts.find(item => item.file === 'src/components/sections/DeferredContextGroup.tsx')?.content ?? '',
].join('\n');

for (const [component, label] of [
  ['AudienceHub','descoberta'],
  ['QuickQuiz','retenção'],
  ['DataQualityPanel','qualidade'],
  ['EvidenceChain','evidências'],
  ['CivicActionHub','ação'],
  ['DataExportActions','exportação'],
]) {
  if (!mountedSources.includes('<' + component)) fail('Camada de ' + label + ' não está montada: ' + component);
}
pass('camadas de descoberta, retenção, qualidade, evidências, ação e exportação montadas');

const mobileNav = texts.find(item => item.file === 'src/components/layout/MobileBottomNav.tsx')?.content ?? '';
if (!mobileNav.includes('Navegação principal no celular')) fail('Navegação mobile rotulada ausente');
else pass('navegação mobile rotulada e integrada ao fluxo principal');
if (!mobileNav.includes("item.group === 'more' && item.id !== 'quiz'")) fail('Quiz duplicado no menu Mais da navegação mobile');
else pass('Quiz aparece uma única vez na navegação inferior mobile');

const experience = texts.find(item => item.file === 'src/components/ExperienceShell.tsx')?.content ?? '';
if (experience.includes('shortcutMap') && experience.includes('navigationSequence') && experience.includes("window.history.replaceState(null, '', '#' + destination)")) pass('atalhos configurados de navegação estão conectados ao roteamento central');
else fail('atalhos declarados na navegação não estão ativos no ExperienceShell');

const search = texts.find(item => item.file === 'src/components/layout/SearchModal.tsx')?.content ?? '';
if (!search.includes('Resposta rápida') || !search.includes('ArrowDown')) fail('Busca não oferece resposta rápida e navegação por teclado');
else pass('busca possui resposta rápida e navegação por teclado');
if (search.includes('observatorio:public-service-search') && civic.includes('Buscar serviço municipal') && civic.includes('visibleMunicipalServices')) pass('busca global entrega o serviço municipal já filtrado');
else fail('resultado de serviço público pode abrir uma lista genérica sem destacar o item procurado');
if (
  search.includes("const knownDestination =") &&
  search.includes("navigation.some(item => item.id === id)") &&
  search.includes("window.dispatchEvent(new CustomEvent('observatorio:navigate'")
) pass('busca preserva destinos lazy e aciona a navegação central');
else fail('busca pode perder destinos lazy antes da montagem do componente');

const appForLazy = texts.find(item => item.file === 'src/app/App.tsx')?.content ?? '';
if (
  appForLazy.includes('<DeferredEvidenceGroup />') &&
  !appForLazy.includes('loadEvidenceGroup') &&
  search.includes("'politica', 'qualidade'") &&
  search.includes("knownDestination ? id")
) pass('busca preserva destinos de fontes/exportação já montados e destinos técnicos lazy');
else fail('aliases da busca podem apontar para destinos sem montagem compatível');

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

if (!combined.includes('election-mode-actions') && !combined.includes('mode-election') && !combined.includes('electionMode')) pass('Modo Eleição cosmético removido do fluxo principal');
else fail('Modo Eleição removido de forma incompleta');

const languageToggle = texts.find(item => item.file === 'src/components/layout/LanguageModeToggle.tsx')?.content ?? '';
const languageContext = texts.find(item => item.file === 'src/context/LanguageModeContext.tsx')?.content ?? '';
if (
  languageToggle.includes('language-toggle-v3') &&
  languageToggle.includes('aria-pressed') &&
  languageToggle.includes("summary") &&
  languageToggle.includes("simple") &&
  languageToggle.includes("technical") &&
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
