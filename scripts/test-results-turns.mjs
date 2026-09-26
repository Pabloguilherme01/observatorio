import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

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
