import assert from 'node:assert/strict';
import { diffRecords, hasMeaningfulProvenanceChange } from './lib/tseDiff.mjs';

const before = [
  {
    sqCandidate: '1',
    name: 'CANDIDATO',
    party: 'ABC',
    generationDate: '04/10/2026',
    generationTime: '12:30:21',
  },
];

const onlyVolatileMetadata = [
  {
    ...before[0],
    generationDate: '05/10/2026',
    generationTime: '10:14:11',
  },
];

assert.deepEqual(diffRecords(before, onlyVolatileMetadata), [], 'metadados de geração não devem gerar alteração eleitoral');

const substantiveChange = [
  {
    ...onlyVolatileMetadata[0],
    party: 'XYZ',
  },
];

const diff = diffRecords(before, substantiveChange);
assert.equal(diff.length, 1);
assert.deepEqual(diff[0].changedFields, ['party']);

const removedField = [
  {
    sqCandidate: '1',
    name: 'CANDIDATO',
    generationDate: '05/10/2026',
    generationTime: '10:14:11',
  },
];

const removed = diffRecords(before, removedField);
assert.deepEqual(
  removed[0].changedFields,
  ['party'],
  'remoção de campo deve ser detectada pelo comparador por união de chaves',
);

assert.equal(
  hasMeaningfulProvenanceChange(
    { sourceRows: 906, retrievalMethod: 'official_tse_zip_csv', resourceUrl: 'zip' },
    { sourceRows: 906, retrievalMethod: 'official_tse_zip_csv', resourceUrl: 'zip', sourceFileSha256: 'novo-hash' },
  ),
  false,
  'hash de origem isolado não deve criar novo snapshot',
);

assert.equal(
  hasMeaningfulProvenanceChange(
    { sourceRows: 906, retrievalMethod: 'official_tse_zip_csv', resourceUrl: 'zip' },
    { sourceRows: 905, retrievalMethod: 'official_tse_zip_csv', resourceUrl: 'zip' },
  ),
  true,
);

console.log('PASS contrato de diff TSE');
