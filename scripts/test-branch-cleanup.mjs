import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const script = readFileSync('scripts/cleanup-branches.mjs', 'utf8');
const workflow = readFileSync('.github/workflows/cleanup-branches.yml', 'utf8');

assert.match(script, /\.filter\(name => name !== 'main'\)/);
assert.match(script, /\.filter\(name => !active\.has\(name\)\)/);
assert.match(script, /\.filter\(name => !candidates\.includes\(name\)\)/);
assert.match(script, /\.filter\(pr => pr\.merged_at\)/);
assert.match(script, /mergedMaxAgeDays/);
assert.match(script, /mergedMaxDeletions/);
assert.match(script, /CLEANUP_MERGED_BRANCHES === 'true'/);
assert.match(script, /mergedBranchPrefixes/);
assert.match(script, /if \(dryRun\)/);
assert.match(script, /method: 'DELETE'/);
assert.match(workflow, /contents: write/);
assert.match(workflow, /pull-requests:\s+read/);
assert.match(workflow, /CLEANUP_MERGED_BRANCHES: 'true'/);
assert.match(workflow, /CLEANUP_MERGED_MAX_AGE_DAYS: '14'/);
assert.match(workflow, /CLEANUP_MERGED_MAX_DELETIONS: '25'/);
assert.match(workflow, /inputs:\s*\n\s+dry_run:/);
assert.match(workflow, /CLEANUP_DRY_RUN:/);

console.log('Branch cleanup safety contract: PASS');
