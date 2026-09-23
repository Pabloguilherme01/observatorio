// Gera src/components/icons.d.mts com re-export explícito dos ícones lucide-react usados no app.
// Garante tree-shaking real (evita bundle completo do pacote de ícones).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const grep = execSync(`grep -rho "from 'lucide-react'" -B0 src || true`, { encoding: 'utf8' });
const raw = execSync(`grep -rn "from 'lucide-react'" src`, { encoding: 'utf8' });
const names = new Set();
for (const line of raw.split('\n')) {
  const m = line.match(/import\s*{([^}]*)}\s*from\s*'lucide-react'/);
  if (m) for (const n of m[1].split(',')) { const t = n.trim().split(/\s+as\s+/)[0]; if (t) names.add(t); }
}
const kebab = (n) => n.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').replace(/([a-z])(\d)/g, '$1-$2').toLowerCase();
const iconsDir = 'node_modules/lucide-react/dist/esm/icons';
const resolved = [];
for (const name of [...names].sort()) {
  let k = kebab(name);
  if (!existsSync(`${iconsDir}/${k}.mjs`)) {
    // aliases comuns do lucide
    const alias = { CheckCircle2: 'circle-check-big', XCircle: 'circle-x', AlertTriangle: 'triangle-alert', CircleHelp: 'circle-question-mark' }[name];
    if (alias && existsSync(`${iconsDir}/${alias}.mjs`)) k = alias;
  }
  if (!existsSync(`${iconsDir}/${k}.mjs`)) { console.error('NÃO RESOLVIDO:', name, '->', k); process.exitCode = 1; continue; }
  resolved.push({ name, k });
}
const out = [
  '// Arquivo gerado por scripts/gen-icon-barrel.mjs — não editar manualmente.',
  '// Re-export explícito para garantir tree-shaking do lucide-react.',
  ...resolved.map(({ name, k }) => `export { ${name} } from 'lucide-react/dist/esm/icons/${k}';`),
  '',
].join('\n');
writeFileSync('src/components/icons.d.mts', out);
console.log(`OK: ${resolved.length} ícones em src/components/icons.d.mts`);
