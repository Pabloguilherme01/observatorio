import type { ElectoralCandidateDiff, ElectoralCandidateRecord, ElectoralSnapshotPayload, ElectoralSyncState } from '../types/electoral360';

export function candidateKey(candidate: ElectoralCandidateRecord): string {
  return candidate.sqCandidate || String(candidate.ballotNumber ?? candidate.name);
}

export function diffCandidates(
  before: readonly ElectoralCandidateRecord[],
  after: readonly ElectoralCandidateRecord[],
): ElectoralCandidateDiff[] {
  const previous = new Map(before.map(candidate => [candidateKey(candidate), candidate]));
  const current = new Map(after.map(candidate => [candidateKey(candidate), candidate]));
  const diff: ElectoralCandidateDiff[] = [];

  for (const [key, candidate] of current) {
    const old = previous.get(key);
    if (!old) {
      diff.push({ key, type: 'added', after: candidate });
      continue;
    }
    const fields = (Object.keys(candidate) as (keyof ElectoralCandidateRecord)[]).filter(field => candidate[field] !== old[field]);
    if (fields.length) diff.push({ key, type: 'changed', before: old, after: candidate, changedFields: fields.map(String) });
  }

  for (const [key, candidate] of previous) {
    if (!current.has(key)) diff.push({ key, type: 'removed', before: candidate });
  }

  return diff;
}

export function syncState(
  previous: ElectoralSnapshotPayload | null,
  nextRecords: readonly ElectoralCandidateRecord[],
  diff: readonly ElectoralCandidateDiff[],
): ElectoralSyncState {
  if (!previous) return 'first_capture';
  if (!diff.length) return 'unchanged';
  return 'changed';
}
