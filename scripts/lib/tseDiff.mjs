const VOLATILE_CANDIDATE_FIELDS = new Set(['generationDate', 'generationTime']);

const comparableFields = candidate =>
  new Set(Object.keys(candidate ?? {}).filter(field => !VOLATILE_CANDIDATE_FIELDS.has(field)));

const candidateKey = candidate =>
  candidate?.sqCandidate || String(candidate?.ballotNumber ?? candidate?.name ?? '');

export function diffRecords(before, after) {
  const previous = new Map((before ?? []).map(candidate => [candidateKey(candidate), candidate]));
  const current = new Map((after ?? []).map(candidate => [candidateKey(candidate), candidate]));
  const records = [];

  for (const [id, candidate] of current) {
    const old = previous.get(id);
    if (!old) {
      records.push({ key: id, type: 'added', after: candidate });
      continue;
    }

    const fields = new Set([...comparableFields(old), ...comparableFields(candidate)]);
    const changedFields = [...fields].filter(field =>
      JSON.stringify(candidate?.[field]) !== JSON.stringify(old?.[field]),
    );

    if (changedFields.length) {
      records.push({
        key: id,
        type: 'changed',
        before: old,
        after: candidate,
        changedFields,
      });
    }
  }

  for (const [id, candidate] of previous) {
    if (!current.has(id)) records.push({ key: id, type: 'removed', before: candidate });
  }

  return records;
}

export function hasMeaningfulProvenanceChange(previousMeta, currentMeta) {
  return (
    previousMeta?.sourceRows !== currentMeta.sourceRows
    || previousMeta?.retrievalMethod !== currentMeta.retrievalMethod
    || previousMeta?.resourceUrl !== currentMeta.resourceUrl
  );
}
