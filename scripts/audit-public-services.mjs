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

const fail = [];
const pass = message => console.log('PASS', message);

for (const [label, pathFragment] of required) {
  if (!source.includes(label) || !source.includes(pathFragment)) {
    fail.push(label);
  } else {
    pass(label + ' possui atalho direto');
  }
}

const priorityBlock = source.slice(source.indexOf('const priorityPublicServices'), source.indexOf('const actions'));
const urls = [...priorityBlock.matchAll(/href:\s*'([^']+)'/g)].map(match => match[1]);

if (urls.length !== required.length) {
  fail.push('quantidade de atalhos prioritários');
} else {
  pass('atalhos prioritários possuem quantidade esperada');
}

const allowedHosts = new Set([
  'acessoainformacao.aguaslindasdegoias.go.gov.br',
  'aguaslindasdegoias.go.gov.br',
]);

for (const url of urls) {
  try {
    const parsed = new URL(url);
    if (!allowedHosts.has(parsed.hostname)) {
      fail.push('host não oficial no atalho: ' + url);
    }
    if (!/noopener noreferrer/.test(source)) {
      fail.push('atalhos públicos precisam de noopener/noreferrer');
      break;
    }
  } catch {
    fail.push('URL inválida: ' + url);
  }
}

if (fail.length) {
  console.error('FAIL', fail.length, 'regra(s)');
  for (const item of fail) console.error(' -', item);
  process.exitCode = 1;
} else {
  console.log('PASS auditoria de serviços públicos concluída');
}
