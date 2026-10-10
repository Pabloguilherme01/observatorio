import fs from 'node:fs';

import path from 'node:path';

import { gzipSync } from 'node:zlib';

const distDir = path.join(process.cwd(), 'dist');

const assetsDir = path.join(distDir, 'assets');

const indexPath = path.join(distDir, 'index.html');

const fail = message => {
  console.error('FAIL', message);
  process.exitCode = 1;
};

if (!fs.existsSync(indexPath) || !fs.existsSync(assetsDir)) {
  console.error('FAIL dist não encontrado. Execute npm run build antes de npm run audit:bundle.');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir)
  .filter(name => /\.(?:js|css)$/.test(name))
  .map(name => {
    const filePath = path.join(assetsDir, name);
    const buffer = fs.readFileSync(filePath);
    return {
      name,
      type: path.extname(name).slice(1),
      raw: buffer.byteLength,
      gzip: gzipSync(buffer, { level: 9 }).byteLength,
    };
  });

const js = files.filter(file => file.type === 'js');

const css = files.filter(file => file.type === 'css');

const largestJs = [...js].sort((a, b) => b.raw - a.raw)[0];

const largestCss = [...css].sort((a, b) => b.raw - a.raw)[0];

const totalJsRaw = js.reduce((sum, file) => sum + file.raw, 0);

const totalCssRaw = css.reduce((sum, file) => sum + file.raw, 0);

const kb = value => Math.round(value / 1024 * 10) / 10;

const envLimit = (name, fallbackKb) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value * 1024 : fallbackKb * 1024;
};

const limits = {
  largestJsRaw: envLimit('BUNDLE_MAX_JS_KB', 450),
  largestJsGzip: envLimit('BUNDLE_MAX_JS_GZIP_KB', 135),
  largestCssRaw: envLimit('BUNDLE_MAX_CSS_KB', 440),
  largestCssGzip: envLimit('BUNDLE_MAX_CSS_GZIP_KB', 72),
  totalJsRaw: envLimit('BUNDLE_MAX_TOTAL_JS_KB', 1250),
  totalCssRaw: envLimit('BUNDLE_MAX_TOTAL_CSS_KB', 480),
};

console.log(JSON.stringify({
  assets: files.length,
  jsFiles: js.length,
  cssFiles: css.length,
  largestJs: largestJs ? { name: largestJs.name, rawKb: kb(largestJs.raw), gzipKb: kb(largestJs.gzip) } : null,
  largestCss: largestCss ? { name: largestCss.name, rawKb: kb(largestCss.raw), gzipKb: kb(largestCss.gzip) } : null,
  totalJsKb: kb(totalJsRaw),
  totalCssKb: kb(totalCssRaw),
  limitsKb: Object.fromEntries(Object.entries(limits).map(([key, value]) => [key, kb(value)])),
}, null, 2));

if (!largestJs) fail('nenhum bundle JavaScript de produção foi gerado');

if (!largestCss) fail('nenhum bundle CSS de produção foi gerado');

if (largestJs?.raw > limits.largestJsRaw) fail(`maior JS excede orçamento: ${largestJs.name} = ${kb(largestJs.raw)} KB > ${kb(limits.largestJsRaw)} KB`);

if (largestJs?.gzip > limits.largestJsGzip) fail(`maior JS gzip excede orçamento: ${largestJs.name} = ${kb(largestJs.gzip)} KB > ${kb(limits.largestJsGzip)} KB`);

if (largestCss?.raw > limits.largestCssRaw) fail(`maior CSS excede orçamento: ${largestCss.name} = ${kb(largestCss.raw)} KB > ${kb(limits.largestCssRaw)} KB`);

if (largestCss?.gzip > limits.largestCssGzip) fail(`maior CSS gzip excede orçamento: ${largestCss.name} = ${kb(largestCss.gzip)} KB > ${kb(limits.largestCssGzip)} KB`);

if (totalJsRaw > limits.totalJsRaw) fail(`JavaScript total excede orçamento: ${kb(totalJsRaw)} KB > ${kb(limits.totalJsRaw)} KB`);

if (totalCssRaw > limits.totalCssRaw) fail(`CSS total excede orçamento: ${kb(totalCssRaw)} KB > ${kb(limits.totalCssRaw)} KB`);

if (!process.exitCode) console.log('PASS orçamento de bundle de produção');
