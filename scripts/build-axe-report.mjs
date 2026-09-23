import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'test-results');
mkdirSync(dir, { recursive: true });

const files = readdirSync(dir)
  .filter(file => file.startsWith('axe-') && file.endsWith('.json'))
  .sort();

const reports = files.map(file => {
  const value = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  return value && typeof value === 'object' ? value : { violations: [] };
});

const violations = new Map();

for (const report of reports) {
  const items = Array.isArray(report.violations) ? report.violations : [];
  for (const violation of items) {
    if (!violations.has(violation.id)) {
      violations.set(violation.id, violation);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const rows = [...violations.values()]
  .map(violation => {
    const impact = violation.impact ?? 'unknown';
    const help = escapeHtml(violation.help ?? '');
    const description = escapeHtml(violation.description ?? '');
    const nodes = Array.isArray(violation.nodes) ? violation.nodes.length : 0;
    return '<tr><td>' + escapeHtml(violation.id) + '</td><td>' + escapeHtml(impact) +
      '</td><td>' + help + '</td><td>' + nodes + '</td><td><code>' + description +
      '</code></td></tr>';
  })
  .join('');

const statusMarkup = violations.size
  ? '<div class="fail">Foram encontradas ' + violations.size + ' violações únicas.</div>'
  : '<div class="ok">Zero violações registradas pelo axe-core.</div>';

const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>axe-core · Observatório</title>' +
  '<style>body{font:14px system-ui;margin:32px;background:#0d1117;color:#e6edf3}' +
  'table{border-collapse:collapse;width:100%}th,td{border:1px solid #30363d;padding:10px;text-align:left}' +
  'th{background:#161b22}.ok,.fail{padding:16px;border-radius:12px;margin-bottom:16px}' +
  '.ok{border:1px solid #238636}.fail{border:1px solid #da3633}</style></head><body>' +
  '<h1>axe-core · relatório runtime</h1>' +
  '<p>Arquivos analisados: ' + files.length + '</p>' +
  statusMarkup +
  (rows
    ? '<table><thead><tr><th>ID</th><th>Impacto</th><th>Ajuda</th><th>Nós</th><th>Descrição</th></tr></thead><tbody>' + rows + '</tbody></table>'
    : '') +
  '</body></html>';

writeFileSync(join(dir, 'axe-report.html'), html, 'utf8');

if (violations.size > 0) {
  console.error('axe-core: ' + violations.size + ' violation(s)');
  process.exitCode = 1;
} else {
  console.log('axe-core: zero violations');
}
