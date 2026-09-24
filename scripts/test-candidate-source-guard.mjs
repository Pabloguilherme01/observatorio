import generated from '../src/data/generated/tse2026-candidates.json' with { type: 'json' };

const isMunicipal = generated.coverage === 'municipality_required' && generated.meta?.state !== 'local_filter_pending';
if (generated.coverage !== 'municipality_required') {
  throw new Error('Candidate snapshot must not be treated as municipal until coverage=municipality_required.');
}
if (!Array.isArray(generated.matched)) {
  throw new Error('Candidate snapshot matched must be an array.');
}
if (!isMunicipal && generated.matched.length > 0) {
  throw new Error('Non-municipal candidate records must not reach the local candidate UI.');
}
console.log('candidate-source-guard: ok');
