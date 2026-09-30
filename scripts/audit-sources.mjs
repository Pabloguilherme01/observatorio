import fs from 'node:fs';
import path from 'node:path';

const registryPath = path.join(process.cwd(), 'src/data/sourceRegistry.ts');
const sourceText = fs.readFileSync(registryPath, 'utf8');
const registryUrls = [...new Set([...sourceText.matchAll(/url:\s*'(https?:\/\/[^']+)'/g)].map(match => match[1]))];
const testUrls = process.env.SOURCE_AUDIT_URLS?.split(',').map(url => url.trim()).filter(Boolean);
const urls = testUrls?.length ? [...new Set(testUrls)] : registryUrls;

const results = [];
const concurrency = Number(process.env.SOURCE_AUDIT_CONCURRENCY || 4);
const attempts = Number(process.env.SOURCE_AUDIT_ATTEMPTS || 2);
const timeoutMs = Number(process.env.SOURCE_AUDIT_TIMEOUT_MS || 8000);

async function checkOnce(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
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

// A auditoria de PR valida o registro e os links inexistentes sem fazer a
// disponibilidade momentânea de terceiros bloquear a entrega. O monitor
// agendado usa SOURCE_AUDIT_STRICT=true para alertar falhas 5xx persistentes.
const strictAvailability = process.env.SOURCE_AUDIT_STRICT === 'true';
const serverWarnings = results.filter(item => item.status !== null && item.status >= 500);
const errors = strictAvailability ? serverWarnings : [];
const networkWarnings = results.filter(item => item.status === null);
const clientWarnings = results.filter(item => item.status >= 400 && item.status < 500);
const missingSources = results.filter(item => item.status === 404 || item.status === 410);

for (const item of results.sort((a, b) => a.url.localeCompare(b.url))) {
  if (item.status === null) console.log('WARN', item.url, 'unreachable:', item.error);
  else if (item.status >= 500 && strictAvailability) console.log('FAIL', item.status, item.url);
  else if (item.status >= 500) console.log('WARN', item.status, item.url, '(fonte externa temporariamente indisponível)');
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
  serverWarnings: serverWarnings.length,
  errors: errors.length,
}, null, 2));

if (errors.length || missingSources.length) process.exit(1);
