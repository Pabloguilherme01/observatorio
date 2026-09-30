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
  const legislativeSecondTurn = structuredClone(second);
  legislativeSecondTurn.entries[0].cargo = 'Senador';
  legislativeSecondTurn.entries[0].items[0].cargo = 'Senador';
  validate(legislativeSecondTurn, false);

  const impossibleSections = structuredClone(fixture);
  impossibleSections.entries[0].sectionsCounted = impossibleSections.entries[0].sectionsTotal + 1;
  validate(impossibleSections, false);

  const negativeAggregate = structuredClone(fixture);
  negativeAggregate.entries[0].totalVotes = -1;
  validate(negativeAggregate, false);

  const fractionalVotes = structuredClone(fixture);
  fractionalVotes.entries[0].items[0].votes = 1.5;
  validate(fractionalVotes, false);
  console.log('Results feed validates both turns and rejects mismatched offices, codes and impossible aggregate counts.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
