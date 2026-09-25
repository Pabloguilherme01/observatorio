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
  if (!source.includes(label) || !source.includes(pathFragment)) {
    fail.push(label);
  } else {
    pass(label + ' possui atalho direto');
  }
}

const actionsBlock = source.slice(source.indexOf('const actions = ['), source.indexOf('function shareWhatsApp'));
const priorityBlock = source.slice(source.indexOf('const priorityPublicServices'), source.indexOf('const actions = ['));
const urls = [...new Set([
  ...[...priorityBlock.matchAll(/href:\s*'([^']+)'/g)].map(match => match[1]),
  ...[...actionsBlock.matchAll(/href:\s*'([^']+)'/g)].map(match => match[1]),
])];
const renderedLinks = [...source.matchAll(/<a\b[^>]*href=\"(?:https?:\/\/)[^\"]+\"[^>]*>/g)].map(match => match[0]);
const insecureLinks = renderedLinks.filter(link => /target=\"_blank\"/.test(link) && !/rel=\"[^\"]*noopener[^\"]*\"/.test(link));
if (insecureLinks.length) {
  fail.push(`links públicos com target=_blank sem noopener: ${insecureLinks.length}`);
} else {
  pass('links públicos externos preservam noopener em target=_blank');
}
const allPublicActionLinks = urls.length;
if (allPublicActionLinks < 20) {
  fail.push(`quantidade de serviços públicos auditáveis abaixo do esperado: ${allPublicActionLinks}`);
} else {
  pass(`${allPublicActionLinks} serviços públicos possuem URL auditável`);
}

const categories = [...actionsBlock.matchAll(/category:\s*'([^']+)'/g)].map(match => match[1]);
const categorySet = new Set(categories);
for (const expectedCategory of ['Prefeitura', 'Participação e controle', 'Eleições 2026']) {
  if (!categorySet.has(expectedCategory)) fail.push('categoria pública ausente: ' + expectedCategory);
}
if (categories.length !== 16) fail.push(`ações categorizadas esperado=16 atual=${categories.length}`);
else pass('16 serviços complementares estão categorizados');

const allowedHosts = new Set([
  'acessoainformacao.aguaslindasdegoias.go.gov.br',
  'aguaslindasdegoias.go.gov.br',
  'legislacao.aguaslindasdegoias.go.gov.br',
  'camaradeaguaslindas.go.gov.br',
  'www.tcmgo.tc.br',
  'www.tse.jus.br',
  'divulgacandcontas.tse.jus.br',
  'www.mpgo.mp.br',
]);

for (const url of urls) {
  try {
    const parsed = new URL(url);
    if (!allowedHosts.has(parsed.hostname)) {
      fail.push('host não oficial no serviço público: ' + url);
    }
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
    if ([404, 410].includes(result.status) || result.status >= 500) {
      fail.push(`endpoint público responde com ${result.status}: ${url}`);
    } else if ([401, 403, 429].includes(result.status)) {
      console.warn('WARN', url, `retornou ${result.status}; pode haver proteção do portal/runner`);
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
