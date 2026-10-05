import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataText = readFileSync(path.join(root, 'src/data/observatorioData.ts'), 'utf8');
const sourceText = readFileSync(path.join(root, 'src/data/sourceRegistry.ts'), 'utf8');

const errors = [];
const warnings = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);

const sourceBlocks = [...sourceText.matchAll(/\n  \{[\s\S]*?\n  \},/g)].map(match => match[0]);
const sources = sourceBlocks.filter(block => /\n    id:\s*'/.test(block));
const sourceIds = new Set(sources.map(block => block.match(/\n    id:\s*'([^']+)'/)?.[1]).filter(Boolean));

if (sources.length !== 68) fail(`sourceRegistry deveria conter 68 fontes; encontrado: ${sources.length}`);
else pass('sourceRegistry contém 68 fontes.');

const missingChecked = sources
  .filter(block => !/\blastCheckedAt:\s*'\d{4}-\d{2}-\d{2}'/.test(block))
  .map(block => block.match(/\n    id:\s*'([^']+)'/)?.[1])
  .filter(Boolean);
if (missingChecked.length) fail('fontes sem lastCheckedAt: ' + missingChecked.join(', '));
else pass('todas as fontes possuem data explícita de verificação.');

const invalidChecked = sources
  .map(block => block.match(/lastCheckedAt:\s*'([^']+)'/)?.[1])
  .filter(Boolean)
  .filter(value => Number.isNaN(new Date(value + 'T00:00:00Z').getTime()) || new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) !== value);
if (invalidChecked.length) fail('lastCheckedAt inválido: ' + invalidChecked.join(', '));
else pass('datas de verificação das fontes são ISO válidas.');

if (/id:\s*'ibge-cidades-2026'[\s\S]*?referenceDate:/.test(sourceText)) {
  fail('ibge-cidades-2026 não pode impor uma data de referência global: seus indicadores possuem anos-base distintos.');
} else {
  pass('fonte ampla do IBGE não impõe uma data de referência global.');
}

const used = [
  ...dataText.matchAll(/(?:sourceId|consolidatedSourceId):\s*'([^']+)'/g)
].map(match => match[1]);
for (const match of dataText.matchAll(/sourceIds:\s*\[([\s\S]*?)\]/g)) {
  for (const id of match[1].matchAll(/'([^']+)'/g)) used.push(id[1]);
}
const missing = [...new Set(used)].filter(id => !sourceIds.has(id));
if (missing.length) fail('sourceId sem registro: ' + missing.join(', '));
else pass('todos os sourceId possuem registro de proveniência.');

const indicatorSection = dataText.match(/indicators:\s*\[([\s\S]*?)\n  \],\n};/)?.[1] ?? '';
const indicators = indicatorSection.split('\n').filter(line => line.trim().startsWith('{ id:') && line.includes('status:'));
const ambiguous = indicators
  .filter(line => !line.includes('referenceDate:'))
  .map(line => ({
    id: line.match(/id:\s*'([^']+)'/)?.[1],
    status: line.match(/status:\s*'([^']+)'/)?.[1],
  }))
  .filter(item => item.id);

if (ambiguous.length) {
  warnings.push(ambiguous.map(item => item.id).join(', '));
  console.log('WARN indicadores sem data diária exata: ' + ambiguous.length + '. Isso é permitido quando a fonte só informa ano/período ou atualização.');
} else {
  pass('todos os indicadores possuem referência temporal estruturada.');
}

const suspiciousSyntheticDates = indicators
  .filter(line => /referenceDate:\s*'\\d{4}-01-01'/.test(line))
  .map(line => line.match(/id:\s*'([^']+)'/)?.[1])
  .filter(Boolean);
if (suspiciousSyntheticDates.length) {
  warnings.push('datas em 01/01: ' + suspiciousSyntheticDates.join(', '));
  console.log('WARN há referências em 01/01 que exigem revisão semântica: ' + suspiciousSyntheticDates.join(', '));
} else {
  pass('nenhuma referência diária artificial em 01/01 foi detectada no dataset.');
}

console.log(JSON.stringify({
  valid: errors.length === 0,
  sources: sources.length,
  indicators: indicators.length,
  indicatorsWithoutExactReference: ambiguous.length,
  warnings,
  errors,
}, null, 2));

if (errors.length) process.exit(1);
