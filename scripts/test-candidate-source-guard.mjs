import generated from '../src/data/generated/tse2026-candidates.json' with { type: 'json' };

const exposedCandidates = generated.coverage === 'municipality_required' && generated.meta?.state !== 'local_filter_pending'
  ? generated.matched
  : [];

if (exposedCandidates.length !== 0) {
  throw new Error('Non-municipal candidate records must not be exposed as local candidates.');
}
console.log('candidate-source-guard: ok');
