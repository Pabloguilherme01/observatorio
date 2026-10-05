import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const hero = read('src/components/sections/PostElectionHero.tsx');
const results = read('src/components/sections/ResultsLiveBanner.tsx');
const resultsHook = read('src/hooks/useResultsFeed.ts');
const version = read('src/config/version.ts');
const data = read('src/data/observatorioData.ts');
const config = read('src/data/resultsConfig.ts');
const packageJson = JSON.parse(read('package.json'));

const checks = [
  [!hero.includes('useCountdown'), 'hero não depende mais de contagem regressiva'],
  [hero.includes('resultado do 1º turno') || hero.includes('pós-1º turno'), 'hero identifica explicitamente o estado pós-1º turno'],
  [results.includes('id="resultados"'), 'resultados possuem âncora pública'],
  [results.includes('Resultado oficial') && results.includes('registro histórico'), 'resultado completo é apresentado como registro histórico'],
  [results.includes('Fonte oficial e assinatura digital conferidas pelo TSE') || results.includes('verificação técnica incompleta'), 'status de verificação permanece compreensível ao público'],
  [packageJson.version === (version.match(/APP_VERSION = '([^']+)'/)?.[1] ?? ''), 'package.json e APP_VERSION estão sincronizados'],
  [version.includes("EDITION = 'V" + packageJson.version.split('.')[0] + "'"), 'EDITION acompanha o major da versão'],
  [version.includes("STORAGE_NAMESPACE = 'observatorio-v45'"), 'namespace V45 presente'],
  [data.includes("updatedAt: '2026-10-05'"), 'dataset local marcado com a data da edição'],
  [config.includes('arquivo público, nunca como apuração ao vivo'), 'contrato de resultados distingue arquivo de apuração ao vivo'],
  [resultsHook.includes('let endedFetchDone = false;') && resultsHook.includes('stopPolling();') && resultsHook.includes('Date.now() > RESULTS_WINDOW_END'), 'polling de resultados termina após a última tentativa da janela histórica'],
  [!hero.includes('arquivo auditável') && !hero.includes('proveniência e integridade visíveis'), 'primeira tela evita jargão técnico de auditoria'],
  [!results.includes('snapshot') && !results.includes('assinatura JWS') && results.includes('assinatura digital conferidas'), 'resultado público usa verificação em linguagem compreensível sem remover a confirmação de fonte'],
  [resultsHook.includes('let requestInFlight = false;') && resultsHook.includes('if (requestInFlight) return;'), 'feed não sobrepõe requisições periódicas'],
  [resultsHook.includes('const controller = new AbortController();') || resultsHook.includes('controller = new AbortController();'), 'feed usa AbortController para o request ativo'],
  [resultsHook.includes('signal: controller.signal'), 'request do feed aceita cancelamento'],
  [resultsHook.includes('controller?.abort();'), 'request ativo é abortado no cleanup do hook'],
];

const failures = checks.filter(([, ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error('FAIL ' + failures.length);
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log('PASS post-election transition contract');
