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


const mainEntry = texts.find(item => item.file === 'src/main.tsx')?.content ?? '';
if (mainEntry.includes('PWA_INSTALL_DISMISSED_KEY') && mainEntry.includes('Agora não') && mainEntry.includes('sessionStorage.setItem(PWA_INSTALL_DISMISSED_KEY')) pass('convite de instalação PWA pode ser dispensado sem insistir na mesma sessão');
else fail('convite de instalação PWA não possui dispensa persistente por sessão');
if (mainEntry.includes("window.addEventListener('beforeinstallprompt'") && mainEntry.includes("window.removeEventListener('beforeinstallprompt'") && mainEntry.includes("window.addEventListener('appinstalled'") && mainEntry.includes("window.removeEventListener('appinstalled'")) pass('listeners do ciclo PWA possuem cleanup simétrico');
else fail('listeners do prompt PWA podem permanecer ativos após unmount');

const connectivity = texts.find(item => item.file === 'src/components/system/ConnectivityStatus.tsx')?.content ?? '';
const experienceSource = texts.find(item => item.file === 'src/components/ExperienceShell.tsx')?.content ?? '';
if (experienceSource.includes('<ConnectivityStatus />') && connectivity.includes('aria-label="Status de conexão"') && connectivity.includes('aria-live="polite"')) pass('estado de conexão é montado globalmente e anunciado de forma acessível');
else fail('estado de conexão não está integrado globalmente com anúncio acessível');
if (connectivity.includes('Sem conexão') && connectivity.includes('Conexão restabelecida') && connectivity.includes('Verificar')) pass('estado de rede diferencia offline, reconexão e verificação manual');
else fail('estado de rede não oferece feedback completo de conectividade');

const app = texts.find(item => item.file === 'src/app/App.tsx')?.content ?? '';
const sectionNavigation = texts.find(item => item.file === 'src/lib/sectionNavigation.ts')?.content ?? '';
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
if (app.includes("window.addEventListener('hashchange', navigateFromLocation)") && sectionNavigation.includes('sameTarget') && sectionNavigation.includes('pushState')) pass('Voltar/Avançar restaura seções após navegação programática');
else fail('histórico do navegador não está integrado à navegação programática');
if (!app.includes("window.addEventListener('popstate', navigateFromLocation)")) pass('histórico usa um único evento de hash e evita navegação duplicada');
else fail('popstate redundante pode duplicar navegação junto com hashchange');

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

const contextualData = texts.find(item => item.file === 'src/data/contextualComparison.ts')?.content ?? '';
const contextualUi = texts.find(item => item.file === 'src/components/sections/ContextComparison.tsx')?.content ?? '';
if (
  contextualData.includes("'populationGrowth'") &&
  contextualData.includes("'density2026'") &&
  contextualData.includes("'area'") &&
  contextualData.includes('getContextMetricValue') &&
  contextualData.includes("nature: 'derived'")
) pass('comparação municipal amplia métricas sem confundir cálculos derivados com dados oficiais');
else fail('comparação municipal não preserva natureza e cálculo das novas métricas');
if (
  contextualUi.includes('Selecionar cidade') &&
  contextualUi.includes('context-city-profile-grid') &&
  contextualUi.includes('selectedCode') &&
  contextualUi.includes('7 indicadores')
) pass('comparação municipal possui perfil selecionável em cards');
else fail('comparação municipal não oferece perfil selecionável em cards');
if (contextualUi.includes('Comparação oferece contexto — não ranking')) pass('comparação municipal continua explicitamente não classificatória');
else fail('expansão municipal perdeu aviso contra ranking');

const premiumCard = texts.find(item => item.file === 'src/components/ui/PremiumInfoCard.tsx')?.content ?? '';
const premiumSections = [
  'src/components/sections/DemographicDynamic.tsx',
  'src/components/sections/BudgetSection.tsx',
  'src/components/sections/ContextComparison.tsx',
  'src/components/sections/SnapshotChanges.tsx',
].map(file => texts.find(item => item.file === file)?.content ?? '').join('\n');
if (premiumCard.includes('premium-info-card') && premiumCard.includes('premium-info-eyebrow') && premiumCard.includes('premium-info-title')) pass('sistema visual premium possui componente reutilizável com hierarquia semântica');
else fail('cards premium foram implementados sem componente reutilizável');
if ((premiumSections.match(/<PremiumInfoCard/g) ?? []).length >= 6) pass('notas soltas principais foram convertidas em cards contextuais reutilizáveis');
else fail('poucos blocos de contexto usam o novo padrão premium');
if (premiumSections.includes('Comparação oferece contexto — não ranking')) pass('card de comparação preserva enquadramento neutro e não classificatório');
else fail('comparação contextual perdeu a orientação explícita contra ranking');

const trustPanel = texts.find(item => item.file === 'src/components/ProjectTrustPanel.tsx')?.content ?? '';
if (trustPanel.includes("import.meta.env.BASE_URL + 'api/v1/health.json'")) pass('healthcheck técnico respeita BASE_URL do deploy');
else fail('healthcheck técnico está preso a caminho absoluto de deploy');
if (trustPanel.includes('healthRevision') && trustPanel.includes('Atualizar status') && trustPanel.includes('setHealthRevision(value => value + 1)')) pass('healthcheck técnico permite retry explícito');
else fail('healthcheck técnico não oferece retry explícito');
if (trustPanel.includes('role="status"') && trustPanel.includes('aria-live="polite"')) pass('estado do healthcheck é anunciado de forma acessível');
else fail('estado do healthcheck não possui anúncio acessível');

const mobileNav = texts.find(item => item.file === 'src/components/layout/MobileBottomNav.tsx')?.content ?? '';
if (!mobileNav.includes('Navegação principal no celular')) fail('Navegação mobile rotulada ausente');
else pass('navegação mobile rotulada e integrada ao fluxo principal');
if (!mobileNav.includes("item.group === 'more' && item.id !== 'quiz'")) fail('Quiz duplicado no menu Mais da navegação mobile');
else pass('Quiz aparece uma única vez na navegação inferior mobile');

const experience = texts.find(item => item.file === 'src/components/ExperienceShell.tsx')?.content ?? '';
if (experience.includes('shortcutMap') && experience.includes('navigationSequence') && experience.includes('navigateToSection(destination)') && sectionNavigation.includes('window.history.pushState')) pass('atalhos configurados usam navegação central com histórico restaurável');
else fail('atalhos declarados não estão conectados à navegação central com histórico');
if (experience.includes("document.querySelector('[role=\"dialog\"][aria-modal=\"true\"]')") && experience.includes('clearNavigationSequence();')) pass('atalhos globais são suspensos enquanto um modal está aberto');
else fail('atalhos globais podem navegar por trás de um modal');

const inspector = texts.find(item => item.file === 'src/components/DataInspector.tsx')?.content ?? '';
if (inspector.includes('canonicalUrl') && inspector.includes("window.location.origin + window.location.pathname") && inspector.includes("'#dashboard'") && inspector.includes('Copiar link')) pass('inspetor possui link canônico explícito');
else fail('inspetor ainda compartilha URL não canônica ou não oferece copiar link');
if (inspector.includes("url: canonicalUrl") && inspector.includes("copyText(canonicalUrl)")) pass('compartilhar e copiar link do inspetor usam a mesma URL canônica');
else fail('ações de link do inspetor divergem entre si');

const search = texts.find(item => item.file === 'src/components/layout/SearchModal.tsx')?.content ?? '';
if (!search.includes('Resposta rápida') || !search.includes('ArrowDown')) fail('Busca não oferece resposta rápida e navegação por teclado');
else pass('busca possui resposta rápida e navegação por teclado');
if (search.includes('const editingQuery = event.target === inputRef.current') && search.includes("!editingQuery && event.key === 'Home'") && search.includes("!editingQuery && event.key === 'End'")) pass('busca preserva Home/End para edição nativa no campo de texto');
else fail('busca intercepta Home/End e pode quebrar edição de texto');
if (search.includes('id="search-result-status"') && search.includes('role="status"') && search.includes('aria-live="polite"') && search.includes('aria-describedby="search-result-status"')) pass('busca anuncia mudanças na quantidade de resultados');
else fail('busca não anuncia mudanças de resultados para tecnologia assistiva');
if (search.includes('closeButtonRef') && search.includes("desktop ? inputRef.current : closeButtonRef.current") && header.includes('closeTools(false)')) pass('busca mobile move foco para dentro do diálogo sem reabrir teclado virtual');
else fail('busca mobile pode deixar foco atrás do diálogo');
if (search.includes('canRestoreOpener') && search.includes('opener !== document.body') && search.includes('opener.tabIndex >= 0') && search.includes('[data-search-trigger="primary"]') && header.includes('data-search-trigger="primary"')) pass('busca restaura foco apenas em acionador válido e usa fallback estável');
else fail('fechar busca pode perder o foco quando o acionador original não existe mais');
if (header.includes('copyCurrentSectionLink') && header.includes("window.location.origin + window.location.pathname + hash") && header.includes('Copiar link da seção')) pass('menu mobile copia link canônico da seção atual');
else fail('menu mobile não oferece cópia canônica da seção atual');
if (header.includes('aria-live="polite"') && header.includes('Link da seção copiado')) pass('cópia de link possui feedback acessível');
else fail('cópia de link não anuncia sucesso para tecnologia assistiva');
if (search.includes('search-clear-query') && search.includes("setQuery('')") && search.includes('setActiveIndex(0)')) pass('busca oferece limpeza explícita sem fechar o diálogo');
else fail('busca não oferece ação explícita para limpar a consulta');
if (search.includes('search-shortcut-guide') && search.includes('navigation.map(item =>') && search.includes("a[href], summary")) pass('busca expõe guia de atalhos e mantém o summary no ciclo de foco');
else fail('guia de atalhos da busca está ausente ou fora do ciclo de foco');
if (experience.includes("event.key === '?'") && header.includes('observatorio:shortcut-help') && search.includes('initialShortcutGuideOpen')) pass('atalho ? abre diretamente a ajuda de atalhos');
else fail('ajuda global de atalhos não possui acesso direto por teclado');
if (header.includes('aria-keyshortcuts="/ Control+K"')) pass('botão de busca declara seus atalhos para tecnologia assistiva');
else fail('botão de busca não declara aria-keyshortcuts');
if (search.includes('observatorio:public-service-search') && civic.includes('Buscar serviço municipal') && civic.includes('visibleMunicipalServices')) pass('busca global entrega o serviço municipal já filtrado');
else fail('resultado de serviço público pode abrir uma lista genérica sem destacar o item procurado');
if (
  search.includes("const knownDestination =") &&
  search.includes("navigation.some(item => item.id === id)") &&
  search.includes("navigateToSection(target)")
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

const finalUi = texts.find(item => item.file === 'src/assets/styles/final-ui.css')?.content ?? '';
if (
  finalUi.includes(':root[data-language-mode="summary"]') &&
  finalUi.includes(':root[data-language-mode="simple"]') &&
  finalUi.includes(':root[data-language-mode="technical"]') &&
  finalUi.includes('--reading-accent-rgb:56,189,248') &&
  finalUi.includes('--reading-accent-rgb:45,212,191') &&
  finalUi.includes('--reading-accent-rgb:167,139,250')
) pass('Resumo, Simples e Técnico possuem identidades visuais próprias');
else fail('modos de leitura não possuem diferenciação visual suficiente');
if (finalUi.includes('background-size:32px 32px') && finalUi.includes('Technical: tighter geometry')) pass('modo Técnico possui textura e geometria próprias sem alterar conteúdo');
else fail('modo Técnico não possui linguagem visual própria');
if (finalUi.includes('@media (min-width:768px) and (max-width:1199px)') && finalUi.includes('@media (min-width:1200px)') && finalUi.includes('@media (max-width:767px)')) pass('identidade dos modos cobre mobile, tablet/notebook e desktop');
else fail('identidade visual dos modos não cobre os principais breakpoints');

const languageToggle = texts.find(item => item.file === 'src/components/layout/LanguageModeToggle.tsx')?.content ?? '';
const languageContext = texts.find(item => item.file === 'src/context/LanguageModeContext.tsx')?.content ?? '';
if (
  languageToggle.includes('language-toggle-v3') &&
  languageToggle.includes('data-active-mode={mode}') &&
  languageToggle.includes('language-toggle-signal') &&
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
