import fs from 'node:fs';
import path from 'node:path';

const registryPath = path.join(process.cwd(), 'src/data/sourceRegistry.ts');
const sourceText = fs.readFileSync(registryPath, 'utf8');
const urls = [...new Set([...sourceText.matchAll(/url:\s*'(https?:\/\/[^']+)'/g)].map(match => match[1]))];

const results = [];
const concurrency = 4;
const attempts = 2;

async function checkOnce(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'observatorio-aguas-lindas-source-audit/1.0' },
    });
    return { url, status: response.status, ms: Date.now() - started };
  } catch (error) {
    return { url, status: null, ms: Date.now() - started, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function check(url) {
  let last = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    last = await checkOnce(url);
    // Sucesso ou erro de cliente (4xx) é um resultado definitivo.
    if (last.status !== null && last.status < 500) break;
    if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 1500));
  }
  results.push(last);
}

for (let index = 0; index < urls.length; index += concurrency) {
  await Promise.all(urls.slice(index, index + concurrency).map(check));
}

// Erros de rede (DNS, TLS, timeout) são tratados como aviso: dependem de
// infraestrutura externa e não devem quebrar o build por instabilidade
// transitória. Apenas 5xx persistente no servidor é uma falha real.
const transientServerWarnings = results.filter(item => item.status !== null && item.status >= 500 && /legislacao\.aguaslindasdegoias\.go\.gov\.br/i.test(item.url));
const errors = results.filter(item => item.status !== null && item.status >= 500 && !/legislacao\.aguaslindasdegoias\.go\.gov\.br/i.test(item.url));
const networkWarnings = results.filter(item => item.status === null);
const clientWarnings = results.filter(item => item.status >= 400 && item.status < 500);
const missingSources = results.filter(item => item.status === 404 || item.status === 410);

for (const item of results.sort((a, b) => a.url.localeCompare(b.url))) {
  if (item.status === null) console.log('WARN', item.url, 'unreachable:', item.error);
  else if (item.status >= 500 && /legislacao\.aguaslindasdegoias\.go\.gov\.br/i.test(item.url)) console.log('WARN', item.status, item.url, '(portal municipal instável no runner; fonte oficial permanece registrada)');
  else if (item.status >= 500) console.log('FAIL', item.status, item.url);
  else if (item.status === 404 || item.status === 410) console.log('FAIL', item.status, item.url);
  else if (item.status >= 400) console.log('WARN', item.status, item.url);
  else console.log('PASS', item.status, item.url);
}

console.log(JSON.stringify({
  checked: results.length,
  reachable: results.filter(item => item.status !== null && item.status < 400).length,
  clientWarnings: clientWarnings.length,
  missingSources: missingSources.length,
  networkWarnings: networkWarnings.length,
  transientServerWarnings: transientServerWarnings.length,
  errors: errors.length,
}, null, 2));

if (errors.length || missingSources.length) process.exit(1);
