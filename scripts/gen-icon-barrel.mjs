import fs from 'node:fs';
import { execSync } from 'node:child_process';

// 1) coleta nomes importados de '../../components/icons' em todo src
const raw = execSync(`grep -rhno "import {[^}]*} from '[^']*components/icons'" src || true`, { encoding: 'utf8' });
const names = new Set();
for (const line of raw.split('\n')) {
  const m = line.match(/import \{([^}]*)\} from/);
  if (m) for (const n of m[1].split(',')) { const t = n.trim().split(/\s+as\s+/)[0]; if (t) names.add(t); }
}


// garantias de nomes usados indiretamente (theme toggle etc.)
for (const extra of ['Moon', 'Sun']) { if (!names.has(extra)) names.add(extra); }

// 2) aliases de nomes depreciados -> exportação via "as"
const alias = {
  AlertTriangle: 'TriangleAlert',
  BarChart3: 'ChartColumnBig',
  Building2: 'Building2',
  CheckCircle2: 'CircleCheckBig',
  CircleHelp: 'CircleQuestionMark',
  FileBarChart2: 'FileChartColumn',
  FileJson: 'FileJson',
  Filter: 'Funnel',
  Grid3X3: 'Grid3x3',
  HelpCircle: 'CircleHelp',
  FileCheck2: 'FileCheckCorner',
  FileQuestion: 'FileQuestionMark',
  History: 'RotateCcwClock',
  Home: 'House',
  Loader2: 'LoaderCircle',
  MoreHorizontal: 'Ellipsis',
  PieChart: 'ChartPie',
  XCircle: 'CircleX',
};

// 3) valida contra as exports reais do pacote
const dts = fs.readFileSync('node_modules/lucide-react/dist/lucide-react.d.ts', 'utf8');
const expClause = dts.match(/export \{([^}]*)\}/)[1];
const exported = new Map(); // publicName -> originalName
for (const part of expClause.split(',')) {
  const p = part.trim(); if (!p) continue;
  const [orig, pub] = p.split(/\s+as\s+/).map(s => s.trim());
  exported.set(pub || orig, orig);
}

const lines = [];
const problems = [];
for (const name of [...names].sort((a,b)=>a.localeCompare(b))) {
  if (exported.has(name)) {
    lines.push(`  ${name},`);
  } else if (alias[name] && exported.has(alias[name])) {
    lines.push(`  ${alias[name]} as ${name},`);
  } else {
    problems.push(name);
  }
}
if (problems.length) { console.error('NÃO RESOLVIDOS:', problems.join(', ')); process.exit(1); }
const out = `// Barrel de ícones lucide-react com re-export explícito (tree-shaking real).\n// Gerado por scripts/gen-icon-barrel.mjs — não editar manualmente.\nexport {\n${lines.join('\n')}\n} from 'lucide-react';\n`;
fs.writeFileSync('src/components/icons.ts', out);
console.log(`OK: ${lines.length} ícones em src/components/icons.ts`);
