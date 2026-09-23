export type ElectoralModuleStatus = 'captured' | 'cataloged' | 'pending';

export interface Electoral360Module {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: ElectoralModuleStatus;
  readonly frequency: string;
  readonly sourceId: string;
  readonly datasetUrl: string;
  readonly refreshUrl?: string;
}

export interface ElectoralCandidateSnapshot {
  readonly sqCandidate: string;
  readonly ballotNumber: number;
  readonly name: string;
  readonly party: string;
  readonly office: string;
  readonly status: string;
  readonly snapshotDate: string;
  readonly sourceId: string;
  readonly municipality?: string;
  readonly municipalityCodeTse?: string;
  readonly municipalityCodeIbge?: string;
  readonly photoUrl?: string | null;
  readonly instagramUrl?: string | null;
  readonly sourceResource?: string;
  readonly fullName?: string | null;
  readonly occupation?: string | null;
  readonly education?: string | null;
  readonly naturalidade?: string | null;
  readonly declaredAssetsBrl?: number | null;
}

export interface Electoral360Snapshot {
  readonly capturedAt: string;
  readonly captureMode: 'static-local' | 'github-actions';
  readonly candidateUniverseScope: 'GO';
  readonly localWatchlist: readonly string[];
  readonly matchedCandidates: readonly ElectoralCandidateSnapshot[];
}

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
