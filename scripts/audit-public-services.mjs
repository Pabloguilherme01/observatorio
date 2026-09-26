import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src/components/sections/CivicActionHub.tsx');
const source = fs.readFileSync(file, 'utf8');

const required = [
  ['Medicamentos SUS', 'medicamentos_sus'],
  ['Estoque de medicamentos', 'estoque_medicamentos_farmacias'],
  ['Regulação municipal', 'lista_espera_regulacoes'],
  ['Despesas públicas', 'sgdespesas'],
  ['Licitações', 'sglicitacoes'],
  ['Contratos', 'sgcontratos'],
  ['Acompanhamento de obras', '/cidadao/informacao/obras'],
  ['Lista de espera em creches', '/lista-de-espera-em-creches/'],
  ['CRAS e assistência social', 'estrutura/secretaria-de-assistencia-social-cidadania-e-juventude'],
  ['CREAS', 'centro-de-referencia-especializado-de-assistencia-social-creas'],
  ['Defesa Civil', 'prefeitura-de-aguas-lindas-decreta-situacao-de-emergencia-apos-chuvas-intensas-e-inundacoes'],
  ['Água e esgoto — atendimento', 'saneago.com.br/site'],
  ['Conselho Tutelar', 'conselho-tutelar'],
  ['CAPS', 'caps-centro-de-atencao-psicossocial'],
  ['SAMU', 'samu-servico-de-atendimento-movel-de-urgencia'],
  ['Autoatendimento eleitoral', 'titulo-eleitoral/autoatendimento-eleitoral'],
  ['Candidaturas e contas', 'divulgacandcontas.tse.jus.br'],
  ['Resultados oficiais', 'resultados.tse.jus.br'],
  ['Portal Eleições 2026', 'tse.jus.br/eleicoes/eleicoes-2026'],
  ['Dados abertos do TSE', 'dadosabertos.tse.jus.br'],
];

async function checkLive(url) {
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': 'observatorio-public-services-audit/1.0' },
      signal: AbortSignal.timeout(12000),
    });
    return { status: response.status, location: response.headers.get('location') };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

const fail = [];
const pass = message => console.log('PASS', message);

for (const [label, pathFragment] of required) {
  if (!source.includes(label) || !source.includes(pathFragment)) fail.push(label);
  else pass(label + ' possui atalho direto');
}

const priorityBlock = source.slice(source.indexOf('const priorityPublicServices'), source.indexOf('const additionalPublicServices'));
const additionalBlock = source.slice(source.indexOf('const additionalPublicServices'), source.indexOf('export function CivicActionHub'));
const tseBlock = source.slice(source.indexOf('const tesser = ['), source.indexOf('const visiblePriority'));

const objectUrls = block => [...block.matchAll(/href:\s*'([^']+)'/g)].map(match => match[1]);
const tupleUrls = [...tseBlock.matchAll(/'(https:\/\/[^']+)'/g)].map(match => match[1]);
const serviceUrls = [...objectUrls(priorityBlock), ...objectUrls(additionalBlock), ...tupleUrls];
const urls = [...new Set(serviceUrls)];

const renderedLinks = [...source.matchAll(/<a\b[^>]*href="(?:https?:\/\/)[^"]+"[^>]*>/g)].map(match => match[0]);
const insecureLinks = renderedLinks.filter(link => /target="_blank"/.test(link) && !/rel="[^"]*noopener[^"]*"/.test(link));
if (insecureLinks.length) fail.push(`links públicos com target=_blank sem noopener: ${insecureLinks.length}`);
else pass('links públicos externos preservam noopener em target=_blank');

if (serviceUrls.length < 50) fail.push(`catálogo útil abaixo do esperado: ${serviceUrls.length} atalhos`);
else pass(`${serviceUrls.length} atalhos públicos úteis cadastrados (${urls.length} URLs únicas)`);

const additionalUrls = objectUrls(additionalBlock);
if (additionalUrls.length !== 28) fail.push(`catálogo técnico adicional esperado=28 atual=${additionalUrls.length}`);
else pass('28 serviços oficiais adicionais permanecem disponíveis no aprofundamento técnico');

if (!source.includes("const visiblePriority = technical ? priorityPublicServices.slice(0, 8) : priorityPublicServices.slice(0, 6);")) {
  fail.push('serviços prioritários podem voltar a duplicar no modo técnico');
} else {
  pass('modo técnico separa atalhos prioritários do catálogo expandido sem duplicação');
}

for (const staleMarker of ['const actions = [', 'function PublicServiceLink', 'function shareWhatsApp', 'immediatePublicContacts']) {
  if (source.includes(staleMarker)) fail.push('código morto reintroduzido: ' + staleMarker);
}
if (!fail.some(item => item.startsWith('código morto reintroduzido'))) pass('hub não mantém ações órfãs sem interface');

const allowedHosts = new Set([
  'acessoainformacao.aguaslindasdegoias.go.gov.br',
  'aguaslindasdegoias.go.gov.br',
  'www.tse.jus.br',
  'divulgacandcontas.tse.jus.br',
  'resultados.tse.jus.br',
  'dadosabertos.tse.jus.br',
  'portalsei.aguaslindasdegoias.go.gov.br',
  'www.saneago.com.br',
]);

for (const url of urls) {
  try {
    const parsed = new URL(url);
    if (!allowedHosts.has(parsed.hostname)) fail.push('host não oficial no serviço público: ' + url);
  } catch {
    fail.push('URL inválida: ' + url);
  }
}

if (process.env.AUDIT_PUBLIC_SERVICES_LIVE === 'true') {
  const liveResults = await Promise.all(urls.map(async url => [url, await checkLive(url)]));
  for (const [url, result] of liveResults) {
    if (result.error) {
      console.warn('WARN', url, 'não pôde ser verificado:', result.error);
      continue;
    }
    if ([404, 410].includes(result.status)) {
      fail.push(`endpoint público responde com ${result.status}: ${url}`);
    } else if ([401, 403, 429].includes(result.status)) {
      console.warn('WARN', url, `retornou ${result.status}; o portal pode restringir verificações automatizadas`);
    } else if (result.status >= 500) {
      console.warn('WARN', url, `retornou ${result.status}; fonte oficial permanece cadastrada, mas o endpoint está instável`);
    } else if (result.status >= 300 && result.status < 400 && !result.location) {
      console.warn('WARN', url, `retornou ${result.status} sem Location`);
    } else {
      pass(`${url} respondeu ${result.status}`);
    }
  }
}

if (fail.length) {
  console.error('FAIL', fail.length, 'regra(s)');
  for (const item of fail) console.error(' -', item);
  process.exitCode = 1;
} else {
  console.log('PASS auditoria de serviços públicos concluída');
}
