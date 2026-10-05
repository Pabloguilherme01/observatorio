import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const hero = read('src/components/sections/HeroCountdown.tsx');
const results = read('src/components/sections/ResultsLiveBanner.tsx');
const version = read('src/config/version.ts');
const data = read('src/data/observatorioData.ts');
const config = read('src/data/resultsConfig.ts');

const checks = [
  [!hero.includes('useCountdown'), 'hero não depende mais de contagem regressiva'],
  [hero.includes('pós-1º turno'), 'hero identifica explicitamente o estado pós-1º turno'],
  [results.includes('id="resultados"'), 'resultados possuem âncora pública'],
  [results.includes('arquivo consolidado do turno'), 'resultados completos são apresentados como arquivo'],
  [results.includes('assinatura JWS'), 'integridade criptográfica permanece visível'],
  [version.includes("APP_VERSION = '45.0.0'"), 'versão V45 presente'],
  [version.includes("STORAGE_NAMESPACE = 'observatorio-v45'"), 'namespace V45 presente'],
  [data.includes("updatedAt: '2026-10-04'"), 'dataset local marcado com a data da edição'],
  [config.includes('arquivo público, nunca como apuração ao vivo'), 'contrato de resultados distingue arquivo de apuração ao vivo'],
];

const failures = checks.filter(([, ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error('FAIL ' + failures.length);
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log('PASS post-election transition contract');
