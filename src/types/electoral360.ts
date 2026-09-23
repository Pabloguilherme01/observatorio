export type ElectoralSyncState = 'first_capture' | 'synced' | 'unchanged' | 'changed' | 'stale' | 'failed' | 'not_synced';

export interface ElectoralSnapshotMeta {
  readonly snapshotId: string;
  readonly source: string;
  readonly sourceUrl: string;
  readonly scope: string;
  readonly downloadedAt: string;
  readonly sourceFileSha256: string;
  readonly sourceRows: number;
  readonly matchedRows: number;
  readonly workflowRunId?: string;
  readonly gitCommit?: string;
  readonly schemaVersion: number;
  readonly state: ElectoralSyncState;
}

export interface ElectoralCandidateRecord {
  readonly sqCandidate: string;
  readonly ballotNumber: number | null;
  readonly name: string;
  readonly fullName: string | null;
  readonly party: string | null;
  readonly office: string | null;
  readonly status: string | null;
  readonly federation: string | null;
  readonly generationDate: string | null;
  readonly generationTime: string | null;
}

export interface ElectoralCandidateDiff {
  readonly key: string;
  readonly type: 'added' | 'removed' | 'changed';
  readonly before?: ElectoralCandidateRecord;
  readonly after?: ElectoralCandidateRecord;
  readonly changedFields?: readonly string[];
}

export interface ElectoralSnapshotPayload {
  readonly schemaVersion: number;
  readonly meta: ElectoralSnapshotMeta;
  readonly watchlist: readonly string[];
  readonly matched: readonly ElectoralCandidateRecord[];
  readonly diff: {
    readonly state: ElectoralSyncState;
    readonly added: number;
    readonly removed: number;
    readonly changed: number;
    readonly records: readonly ElectoralCandidateDiff[];
  };
}
