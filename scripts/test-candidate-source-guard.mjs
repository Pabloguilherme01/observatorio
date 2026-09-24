import { electoral360Snapshot } from '../src/data/electoral360.ts';

if (electoral360Snapshot.matchedCandidates.length !== 0) {
  throw new Error('Non-municipal candidate records must not reach the local candidate UI.');
}
console.log('candidate-source-guard: ok');
