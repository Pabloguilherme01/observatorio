import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { cargoSpecsForTurn, findElection } from './sync-results-2026.mjs';

const fixture = JSON.parse(readFileSync(resolve('scripts/fixtures/tse-results.valid.synthetic.json'), 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'observatorio-results-'));
const path = join(dir, 'feed.json');
function validate(feed, expectedSuccess) {
  writeFileSync(path, JSON.stringify(feed));
  const result = spawnSync(process.execPath, ['scripts/validate-results-feed.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, RESULTS_FEED_FILE: path, REQUIRE_RESULTS_FEED: 'true' },
    encoding: 'utf8',
  });
  if ((result.status === 0) !== expectedSuccess) {
    throw new Error(`Expected validation ${expectedSuccess ? 'success' : 'failure'}: ${result.stdout} ${result.stderr}`);
  }
}

try {
  assert.deepEqual(cargoSpecsForTurn(2).map(spec => spec.cargo), ['Presidente', 'Governador']);
  assert.equal(cargoSpecsForTurn(1).length, 5);
  const config = { pl: [{ cd: 3220, e: [{ cd: 6257, t: 1, cdt2: 7001 }, { cd: 7001, t: 2 }, { cd: 6259, t: 1 }] }] };
  assert.equal(findElection(config, 6257, 2).electionCode, 7001);
  assert.equal(findElection(config, 6259, 2), null);
  assert.equal(findElection(config, 6259, 1).electionCode, 6259);
  validate(fixture, true);
  const second = structuredClone(fixture);
  second.turn = 2;
  second.entries[0].electionCode = 7001;
  second.entries[0].sourceFile = 'go93343-c0003-e007001-u.json';
  second.integrity.files[0].sourceFile = second.entries[0].sourceFile;
  validate(second, true);
  validate({ ...second, entries: [{ ...second.entries[0], electionCode: 6259 }] }, false);
  validate({ ...second, entries: [{ ...second.entries[0], sourceFile: 'go93343-c0003-e006259-u.json' }] }, false);
  console.log('Results feed validates first and second turns and rejects mismatched election codes.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
