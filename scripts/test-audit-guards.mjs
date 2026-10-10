import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const prefix = join(tmpdir(), 'observatorio-audit-guards-');
const fixture = mkdtempSync(prefix);
const preload = join(fixture, 'mutate-input.mjs');
const run = (script, mutation) => {
  writeFileSync(preload, `
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
const original = fs.readFileSync;
fs.readFileSync = (path, ...args) => {
  const result = original(path, ...args);
  const file = String(path).replaceAll('\\\\', '/');
  if (typeof result !== 'string') return result;
  ${mutation}
  return result;
};
syncBuiltinESMExports();
`);
  return spawnSync(process.execPath, ['--import', pathToFileURL(preload).href, 'scripts/' + script + '.mjs'], { cwd: process.cwd(), encoding: 'utf8', timeout: 30000 });
};
try {
  const election = run('test-post-election-transition', `if (file.endsWith('PostElectionHero.tsx')) return result + '\\nuseCountdown';`);
  assert.equal(election.status, 1, 'o guard eleitoral deve rejeitar uma regressão real');
  assert.match(election.stderr, /contagem regressiva/);
  const version = run('audit-release', `if (file.endsWith('package-lock.json')) { const lock = JSON.parse(result); lock.packages['node_modules/es-toolkit'].version = '1.0.0'; return JSON.stringify(lock); }`);
  assert.equal(version.status, 1, 'o guard de compatibilidade deve rejeitar es-toolkit antigo');
  assert.match(version.stderr, /es-toolkit >= 1.47.1/);
  for (const newline of ['lf', 'crlf']) {
    const provenance = run('audit-provenance', `if (file.endsWith('sourceRegistry.ts') || file.endsWith('observatorioData.ts')) return result.replace(/\\r\\n/g, '\\n')${newline === 'crlf' ? ".replace(/\\n/g, '\\r\\n')" : ''};`);
    assert.equal(provenance.status, 0, provenance.stderr);
    const counts = JSON.parse(provenance.stdout.slice(provenance.stdout.indexOf('{')));
    assert.ok(counts.sources > 0 && counts.indicators > 0, 'nenhuma auditoria pode passar com zero registros');
  }
} finally {
  assert.ok(fixture.startsWith(prefix));
  rmSync(fixture, { recursive: true, force: true });
}
console.log('PASS guards rejeitam regressões e processam fontes LF/CRLF sem modificar o repositório');
