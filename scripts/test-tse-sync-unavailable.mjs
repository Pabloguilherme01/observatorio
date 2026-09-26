import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import assert from 'node:assert/strict';

const root = new URL('..', import.meta.url).pathname;
const snapshot = join(root, 'src/data/generated/tse2026-candidates.json');
const hash = () => createHash('sha256').update(readFileSync(snapshot)).digest('hex');
const before = hash();
const fixture = mkdtempSync(join(tmpdir(), 'tse-sync-unavailable-'));
const fakeCurl = join(fixture, 'curl');
writeFileSync(fakeCurl, '#!/bin/sh\nexit 22\n');
chmodSync(fakeCurl, 0o755);

for (const [event, expectedStatus] of [['schedule', 0], ['workflow_dispatch', 1]]) {
  const envFile = join(fixture, `${event}.env`);
  const result = spawnSync(process.execPath, ['scripts/sync-tse-2026.mjs'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30_000,
    env: {
      ...process.env,
      PATH: fixture + delimiter + process.env.PATH,
      GITHUB_ENV: envFile,
      GITHUB_EVENT_NAME: event,
      REQUIRE_TSE_FRESH: event === 'workflow_dispatch' ? 'true' : 'false',
    },
  });
  assert.equal(result.status, expectedStatus, `${event}: ${result.stderr}`);
  assert.match(result.stdout + result.stderr, /"state": "upstream_unavailable"/);
  assert.match(readFileSync(envFile, 'utf8'), /TSE_UPSTREAM_STATUS=unavailable/);
  assert.equal(hash(), before, `${event}: o snapshot anterior deve ser preservado`);
}

console.log('TSE indisponível: agendamento preserva snapshot; execução manual falha explicitamente.');
