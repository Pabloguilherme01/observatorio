import { request } from 'node:https';

const BASE = 'https://resultados-sim.tse.jus.br/simulado/simulado2026';
const WINDOW_DATES = new Set(['2026-09-22', '2026-09-23', '2026-09-24']);
const WINDOW_HOURS_BRT = [9, 10, 11, 14, 15, 16, 17];

function brtNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = type => parts.find(item => item.type === type)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = request(url, { headers }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({
        status: res.statusCode ?? 0,
        headers: res.headers,
        body,
      }));
    });
    req.on('error', reject);
    req.end();
  });
}

function parseJson(label, response) {
  if (response.status !== 200) throw new Error(`${label}: HTTP ${response.status}`);
  try { return JSON.parse(response.body); }
  catch { throw new Error(`${label}: resposta não é JSON válido`); }
}

async function main() {
  const now = brtNow();
  const outsideWindow = !WINDOW_DATES.has(now.date) || !WINDOW_HOURS_BRT.includes(now.hour);

  if (outsideWindow && process.env.REQUIRE_TSE_SIMULATION !== 'true') {
    console.log(JSON.stringify({ valid: true, skipped: true, reason: 'fora da janela operacional do simulado TSE', now }, null, 2));
    return;
  }

  const targets = [
    ['ele-c', `${BASE}/comum/config/ele-c.json`],
    ['GO-acompanhamento', `${BASE}/ele2026/21272/dados/go/go-e021272-ab.json`],
    ['GO-municipios', `${BASE}/ele2026/21272/config/mun-e021272-cm.json`],
    ['GO-governador', `${BASE}/ele2026/21272/dados/go/go-c0003-e021272-u.json`],
  ];

  const checks = [];
  for (const [label, url] of targets) {
    const first = await get(url, { accept: 'application/json' });
    const result = parseJson(label, first);
    checks.push({
      label,
      url,
      status: first.status,
      etag: first.headers.etag ?? null,
      lastModified: first.headers['last-modified'] ?? null,
      object: typeof result === 'object' && result !== null,
      bytes: Buffer.byteLength(first.body),
    });

    if (first.headers.etag) {
      const conditional = await get(url, { accept: 'application/json', 'if-none-match': first.headers.etag });
      checks[checks.length - 1].conditionalStatus = conditional.status;
      if (![200, 304].includes(conditional.status)) {
        throw new Error(`${label}: validação condicional retornou HTTP ${conditional.status}`);
      }
    }
  }

  console.log(JSON.stringify({
    valid: true,
    skipped: false,
    environment: 'simulado2026',
    pleito: 17801,
    electionCode: 21272,
    uf: 'GO',
    checks,
  }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ valid: false, error: String(error) }, null, 2));
  process.exit(1);
});
