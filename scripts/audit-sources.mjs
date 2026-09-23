import fs from 'node:fs';
import path from 'node:path';

const registryPath = path.join(process.cwd(), 'src/data/sourceRegistry.ts');
const sourceText = fs.readFileSync(registryPath, 'utf8');
const urls = [...new Set([...sourceText.matchAll(/url:\s*'(https?:\/\/[^']+)'/g)].map(match => match[1]))];

const results = [];
const concurrency = 4;

async function check(url) {
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
    results.push({ url, status: response.status, ms: Date.now() - started });
  } catch (error) {
    results.push({ url, status: null, ms: Date.now() - started, error: error instanceof Error ? error.message : String(error) });
  } finally {
    clearTimeout(timeout);
  }
}

for (let index = 0; index < urls.length; index += concurrency) {
  await Promise.all(urls.slice(index, index + concurrency).map(check));
}

const errors = results.filter(item => item.status === null || item.status >= 500);
const clientWarnings = results.filter(item => item.status >= 400 && item.status < 500);

for (const item of results.sort((a, b) => a.url.localeCompare(b.url))) {
  if (item.status === null) console.log('WARN', item.url, item.error);
  else if (item.status >= 500) console.log('FAIL', item.status, item.url);
  else if (item.status >= 400) console.log('WARN', item.status, item.url);
  else console.log('PASS', item.status, item.url);
}

console.log(JSON.stringify({
  checked: results.length,
  reachable: results.filter(item => item.status !== null && item.status < 400).length,
  clientWarnings: clientWarnings.length,
  errors: errors.length,
}, null, 2));

if (errors.length) process.exit(1);
