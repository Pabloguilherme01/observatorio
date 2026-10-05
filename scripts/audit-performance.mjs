import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = path.join(process.cwd(), 'dist');
if (!fs.existsSync(dist)) {
  console.error('FAIL dist não encontrado.');
  process.exit(1);
}

const assets = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:js|css)$/.test(entry.name)) {
      const buffer = fs.readFileSync(full);
      assets.push({ file: path.relative(dist, full), raw: buffer.length, gzip: gzipSync(buffer, { level: 9 }).length });
    }
  }
}
walk(dist);

const entry = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const initialScripts = [...entry.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
const initialStyles = [...entry.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match => match[1]);
const findAsset = ref => assets.find(asset => asset.file.replace(/^\//, '') === ref.replace(/^\//, '') || asset.file.endsWith(ref.split('/').pop()));
const initial = [...initialScripts, ...initialStyles].map(ref => findAsset(ref)).filter(Boolean);
const initialJsRaw = initial.filter(asset => asset.file.endsWith('.js')).reduce((sum, asset) => sum + asset.raw, 0);
const initialCssRaw = initial.filter(asset => asset.file.endsWith('.css')).reduce((sum, asset) => sum + asset.raw, 0);
const initialJsGzip = initial.filter(asset => asset.file.endsWith('.js')).reduce((sum, asset) => sum + asset.gzip, 0);
const initialCssGzip = initial.filter(asset => asset.file.endsWith('.css')).reduce((sum, asset) => sum + asset.gzip, 0);

const limits = {
  initialJsRaw: Number(process.env.PERF_MAX_INITIAL_JS_KB || 500) * 1024,
  initialCssRaw: Number(process.env.PERF_MAX_INITIAL_CSS_KB || 500) * 1024,
  totalAssetsRaw: Number(process.env.PERF_MAX_TOTAL_ASSETS_KB || 1800) * 1024,
};

const totalRaw = assets.reduce((sum, asset) => sum + asset.raw, 0);
const warnings = [];
const gzipLimits = {
  initialJs: 135 * 1024,
  initialCss: 72 * 1024,
};
if (initialJsGzip > gzipLimits.initialJs * 0.8) warnings.push('JS inicial comprimido está acima de 80% do orçamento de rede.');
if (initialCssGzip > gzipLimits.initialCss * 0.8) warnings.push('CSS inicial comprimido está acima de 80% do orçamento de rede.');
warnings.forEach(message => console.log('WARN ' + message));
console.log(JSON.stringify({
  initialScripts: initialScripts.length,
  initialStyles: initialStyles.length,
  initialJsKb: Math.round(initialJsRaw / 1024 * 10) / 10,
  initialCssKb: Math.round(initialCssRaw / 1024 * 10) / 10,
  initialJsGzipKb: Math.round(initialJsGzip / 1024 * 10) / 10,
  initialCssGzipKb: Math.round(initialCssGzip / 1024 * 10) / 10,
  totalAssetsKb: Math.round(totalRaw / 1024 * 10) / 10,
  limitsKb: Object.fromEntries(Object.entries(limits).map(([key, value]) => [key, Math.round(value / 1024)])),
}, null, 2));

const failures = [];
if (initialJsRaw > limits.initialJsRaw) failures.push('JS inicial excede ' + Math.round(limits.initialJsRaw / 1024) + ' KB.');
if (initialCssRaw > limits.initialCssRaw) failures.push('CSS inicial excede ' + Math.round(limits.initialCssRaw / 1024) + ' KB.');
if (totalRaw > limits.totalAssetsRaw) failures.push('ativos totais excedem ' + Math.round(limits.totalAssetsRaw / 1024) + ' KB.');
if (failures.length) {
  failures.forEach(message => console.error('FAIL ' + message));
  process.exit(1);
}
console.log('PASS orçamento de performance estática concluído');
