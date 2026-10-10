import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('..', import.meta.url));
const snapshot = join(root, 'src/data/generated/tse2026-candidates.json');
const hash = () => createHash('sha256').update(readFileSync(snapshot)).digest('hex');
const before = hash();
const prefix = join(tmpdir(), 'tse-sync-unavailable-');
const fixture = mkdtempSync(prefix);
const preload = join(fixture, 'unavailable.mjs');
// Replace only the transport in the child test process; never call upstream.
writeFileSync(preload, `
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
const original = childProcess.execFileSync;
childProcess.execFileSync = (command, ...args) => {
  if (command === 'curl') {
    const error = new Error('Simulated upstream unavailable');
    error.status = 22;
    throw error;
  }
  return original(command, ...args);
};
syncBuiltinESMExports();
`);

try {
  for (const [event, expectedStatus] of [['schedule', 0], ['workflow_dispatch', 1]]) {
    const result = spawnSync(process.execPath, ['--import', pathToFileURL(preload).href, 'scripts/sync-tse-2026.mjs'], {
      cwd: root, encoding: 'utf8', timeout: 30_000,
      env: { ...process.env, GITHUB_EVENT_NAME: event, REQUIRE_TSE_FRESH: event === 'workflow_dispatch' ? 'true' : 'false' },
    });
    assert.equal(result.status, expectedStatus, `${event}: ${result.stderr}`);
    assert.match(result.stdout + result.stderr, /"state": "upstream_unavailable"/);
    assert.equal(hash(), before, `${event}: o snapshot anterior deve ser preservado`);
  }
} finally {
  assert.ok(fixture.startsWith(prefix), 'limpeza restrita à pasta temporária do teste');
  rmSync(fixture, { recursive: true, force: true });
}
console.log('TSE indisponível: agendamento preserva snapshot; execução manual falha explicitamente.');
