import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'test-results');
const files = readdirSync(dir).filter(file => file.startsWith('axe-') && file.endsWith('.json'));

interface AxeViolation {
  readonly id: string;
  readonly impact: string | null;
  readonly help: string;
  readonly description: string;
  readonly nodes: readonly unknown[];
}
interface AxeReport {
  readonly violations: readonly AxeViolation[];
}
const reports: AxeReport[] = files.map(file => JSON.parse(readFileSync(join(dir, file), 'utf8')) as AxeReport);
const violations = new Map<string, AxeViolation>();

for (const report of reports) {
  for (const violation of report.violations) {
    const previous = violations.get(violation.id);
    if (!previous) violations.set(violation.id, violation);
  }
}

const rows = [...violations.values()].map(violation => (
  '<tr><td>' + violation.id + '</td><td>' + String(violation.impact ?? 'unknown') + '</td><td>' +
  violation.help + '</td><td>' + violation.nodes.length + '</td><td><code>' +
  violation.description.replaceAll('<', '&lt;').replaceAll('>', '&gt;') + '</code></td></tr>'
)).join('');

const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>axe-core · Observatório</title><style>body{font:14px system-ui;margin:32px;background:#0d1117;color:#e6edf3}table{border-collapse:collapse;width:100%}th,td{border:1px solid #30363d;padding:10px;text-align:left}th{background:#161b22}.ok{padding:16px;border:1px solid #238636;border-radius:12px}.fail{padding:16px;border:1px solid #da3633;border-radius:12px}</style></head><body><h1>axe-core · relatório runtime</h1><p>Arquivos analisados: '+files.length+'</p>' + (rows ? '<div class="fail">Violações encontradas</div><table><thead><tr><th>ID</th><th>Impacto</th><th>Ajuda</th><th>Nós</th><th>Descrição</th></tr></thead><tbody>'+rows+'</tbody></table>' : '<div class="ok">Zero violações registradas.</div>') + '</body></html>';

mkdirSync(dir,{recursive:true});
writeFileSync(join(dir,'axe-report.html'),html,'utf8');

if (violations.size) {
  console.error('axe-core: ' + violations.size + ' violation(s)');
  process.exitCode = 1;
} else {
  console.log('axe-core: zero violations');
}
