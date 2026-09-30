import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = createServer((request, response) => {
  const status = Number(new URL(request.url, 'http://localhost').searchParams.get('status')) || 200;
  response.writeHead(status, { 'content-type': 'text/plain' });
  response.end('simulated source response');
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const sourceUrl = status => `http://127.0.0.1:${address.port}/?status=${status}`;

function runAuditUrl(url, strict = false) {
  const env = { ...process.env, SOURCE_AUDIT_URLS: url, SOURCE_AUDIT_ATTEMPTS: '1', SOURCE_AUDIT_TIMEOUT_MS: '1000' };
  delete env.SOURCE_AUDIT_STRICT;
  if (strict) env.SOURCE_AUDIT_STRICT = 'true';
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/audit-sources.mjs'], { cwd: root, env, encoding: 'utf8' });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', statusCode => resolve({ status: statusCode, stdout, stderr }));
  });
}

function runAudit(status, strict = false) {
  return runAuditUrl(sourceUrl(status), strict);
}

try {
  const temporaryOutage = await runAudit(503);
  assert.equal(temporaryOutage.status, 0, temporaryOutage.stderr);
  assert.match(temporaryOutage.stdout, /WARN 503/);

  const strictOutage = await runAudit(503, true);
  assert.equal(strictOutage.status, 1, 'monitor estrito deve falhar em 5xx persistente');
  assert.match(strictOutage.stdout, /FAIL 503/);

  const missingSource = await runAudit(404);
  assert.equal(missingSource.status, 1, 'link inexistente deve falhar mesmo fora do modo estrito');
  assert.match(missingSource.stdout, /FAIL 404/);

  const healthySource = await runAudit(200);
  assert.equal(healthySource.status, 0, healthySource.stderr);
  assert.match(healthySource.stdout, /PASS 200/);

  const probe = createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const probeAddress = probe.address();
  const unavailableUrl = `http://127.0.0.1:${probeAddress.port}/`;
  await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));

  const networkWarning = await runAuditUrl(unavailableUrl);
  assert.equal(networkWarning.status, 0, 'falha de rede não deve bloquear PR/deploy em modo normal');
  assert.match(networkWarning.stdout, /WARN .*unreachable/);

  const strictNetworkOutage = await runAuditUrl(unavailableUrl, true);
  assert.equal(strictNetworkOutage.status, 1, 'monitor estrito deve falhar em indisponibilidade de rede persistente');
  assert.match(strictNetworkOutage.stdout, /FAIL .*unreachable/);

  console.log('PASS política da auditoria separa links quebrados e indisponibilidade persistente do modo normal');
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}