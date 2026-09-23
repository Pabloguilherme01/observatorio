import { readFileSync } from 'node:fs';

const text = readFileSync(new URL('../src/data/observatorioData.ts', import.meta.url), 'utf8');
const checks = [];
const fail = message => { checks.push({ ok: false, message }); };
const pass = message => checks.push({ ok: true, message });

if (!text.includes("export const observatorioData")) fail('observatorioData não encontrado.');
else pass('dataset principal encontrado.');

const sourceIds = [...text.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
const unique = new Set(sourceIds);
if (unique.size === sourceIds.length) pass('IDs literais sem duplicação detectada no dataset.');
else fail('Possível duplicação de IDs literais no dataset.');

const poll = text.match(/interviews:\s*400[\s\S]*?theoreticalMarginErrorPct:\s*4\.9/);
poll ? pass('Pesquisa mantém margem teórica explicitamente marcada.') : fail('Pesquisa perdeu a marcação de margem teórica.');

text.includes("fareBrl: 11.45") ? pass('Tarifa Brasília está em R$ 11,45.') : fail('Tarifa Brasília não está em R$ 11,45.');
text.includes("state: 'not_synced'") ? pass('Snapshot TSE local continua explícito como não sincronizado.') : pass('Snapshot TSE local já não está em placeholder.');

const failed = checks.filter(c => !c.ok);
console.log(JSON.stringify({ valid: failed.length === 0, checks }, null, 2));
if (failed.length) process.exit(1);
