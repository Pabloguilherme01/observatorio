import { useEffect, useState } from 'react';
import { RESULTS_FEED_SCHEMA_VERSION, RESULTS_FEED_URL, RESULTS_LIVE_MAX_AGE_MS, RESULTS_WINDOW, OFFICIAL_RESULTS_CONTEXT, electionCodeMatchesCargo } from '../data/resultsConfig';

export type ResultsFeedPhase = 'pre_open' | 'open_waiting' | 'live' | 'stale' | 'complete' | 'ended_unavailable';

export interface ResultsFeedItem {
  readonly candidateId: string;
  readonly candidate: string;
  readonly party?: string;
  readonly cargo: string;
  readonly votes: number;
  readonly status?: string;
}

export interface ResultsFeedEntry {
  readonly electionCode: number;
  readonly cargo: string;
  readonly sourceFile: string;
  readonly referenceDate: string;
  readonly updatedAt: string;
  readonly sectionsTotal?: number;
  readonly sectionsCounted?: number;
  readonly totalVotes?: number;
  readonly validVotes?: number;
  readonly blankVotes?: number;
  readonly nullVotes?: number;
  readonly abstentions?: number;
  readonly items: readonly ResultsFeedItem[];
}

export interface ResultsFeed {
  readonly schemaVersion: typeof RESULTS_FEED_SCHEMA_VERSION;
  readonly environment: 'official';
  readonly scope: 'municipality';
  readonly state: 'pending' | 'live' | 'complete';
  readonly source: 'official-tse';
  readonly sourceBaseUrl: string;
  readonly pleito: 3220;
  readonly turn: 1 | 2;
  readonly uf: 'GO';
  readonly municipalityCode: string;
  readonly municipalityName: string;
  readonly referenceDate: string;
  readonly capturedAt: string;
  readonly entries: readonly ResultsFeedEntry[];
  readonly integrity?: {
    readonly files: readonly {
      readonly sourceFile: string;
      readonly sha256: string;
      readonly jwsProofSha256: string;
      readonly signatureStatus: 'verified' | 'not_verified' | 'unavailable';
      readonly verificationMethod: 'tse-official-jwk-ed25519';
      readonly verifiedAt?: string;
      readonly algorithm: 'EdDSA';
      readonly curve: 'Ed25519';
      readonly kid: string;
      readonly keyFingerprint: string;
    }[];
    readonly allVerified: boolean;
  };
}

const RESULTS_WINDOW_START = new Date(RESULTS_WINDOW.start).getTime();
const RESULTS_WINDOW_END = new Date(RESULTS_WINDOW.end).getTime();
const VALID_STATES = new Set<ResultsFeed['state']>(['pending', 'live', 'complete']);

export function isResultsWindowOpen(now = Date.now()) {
  return now >= RESULTS_WINDOW_START && now <= RESULTS_WINDOW_END;
}

function getResultsFeedPhase(data: ResultsFeed | null, now = Date.now()): ResultsFeedPhase {
  if (data?.state === 'complete') return 'complete';
  if (now < RESULTS_WINDOW_START) return 'pre_open';
  if (now > RESULTS_WINDOW_END) return 'ended_unavailable';
  if (data?.state === 'live') {
    const capturedAt = Date.parse(data.capturedAt);
    return Number.isFinite(capturedAt) && now - capturedAt <= RESULTS_LIVE_MAX_AGE_MS ? 'live' : 'stale';
  }
  return 'open_waiting';
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isOfficialResultsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === OFFICIAL_RESULTS_CONTEXT.host;
  } catch {
    return false;
  }
}

function isValidResultsFeed(value: unknown): value is ResultsFeed {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  if (payload.schemaVersion !== RESULTS_FEED_SCHEMA_VERSION) return false;
  if (payload.environment !== OFFICIAL_RESULTS_CONTEXT.environment || payload.scope !== OFFICIAL_RESULTS_CONTEXT.scope) return false;
  if (payload.source !== 'official-tse' || !VALID_STATES.has(payload.state as ResultsFeed['state'])) return false;
  if (payload.pleito !== OFFICIAL_RESULTS_CONTEXT.pleito) return false;
  if (!isOfficialResultsUrl(payload.sourceBaseUrl)) return false;
  if (![1, 2].includes(payload.turn as number) || payload.uf !== OFFICIAL_RESULTS_CONTEXT.uf) return false;
  if (payload.municipalityCode !== OFFICIAL_RESULTS_CONTEXT.municipalityCode) return false;
  if (typeof payload.municipalityName !== 'string' || payload.municipalityName.trim() !== OFFICIAL_RESULTS_CONTEXT.municipalityName) return false;
  if (!isIsoDate(payload.referenceDate) || !isIsoDate(payload.capturedAt)) return false;

  const capturedAt = Date.parse(payload.capturedAt as string);
  if (capturedAt > Date.now() + 5 * 60 * 1000) return false;
  if (!Array.isArray(payload.entries)) return false;

  if (payload.state !== 'pending') {
    const integrityValue = payload.integrity;
    if (!integrityValue || typeof integrityValue !== 'object' || (integrityValue as Record<string, unknown>).allVerified !== true) return false;
  }

  if (payload.integrity !== undefined) {
    if (!payload.integrity || typeof payload.integrity !== 'object') return false;
    const integrity = payload.integrity as Record<string, unknown>;
    if (!Array.isArray(integrity.files) || typeof integrity.allVerified !== 'boolean') return false;
    if (integrity.files.length !== payload.entries.length) return false;
    if (integrity.files.some(file => !file || typeof file !== 'object' || (file as Record<string, unknown>).signatureStatus !== 'verified')) return false;
    if (integrity.files.some(file => (file as Record<string, unknown>).verificationMethod !== 'tse-official-jwk-ed25519' || (file as Record<string, unknown>).algorithm !== 'EdDSA' || (file as Record<string, unknown>).curve !== 'Ed25519' || (file as Record<string, unknown>).kid !== OFFICIAL_RESULTS_CONTEXT.officialKeyKid)) return false;
  }

  return payload.entries.every(entry => {
    if (!entry || typeof entry !== 'object') return false;
    const row = entry as Record<string, unknown>;
    if (!Number.isInteger(row.electionCode) || !OFFICIAL_RESULTS_CONTEXT.allowedElectionCodes.includes(row.electionCode as typeof OFFICIAL_RESULTS_CONTEXT.allowedElectionCodes[number])) return false;
    if (typeof row.cargo !== 'string' || !row.cargo.trim()) return false;
    if (!electionCodeMatchesCargo(row.electionCode as typeof OFFICIAL_RESULTS_CONTEXT.allowedElectionCodes[number], payload.uf as string, row.cargo as string)) return false;
    if (typeof row.sourceFile !== 'string' || !row.sourceFile.trim()) return false;
    if (!isIsoDate(row.referenceDate) || !isIsoDate(row.updatedAt)) return false;
    if (!Array.isArray(row.items)) return false;
    return row.items.every(item => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Record<string, unknown>;
      if (typeof candidate.candidateId !== 'string' || !candidate.candidateId.trim()) return false;
      if (typeof candidate.candidate !== 'string' || !candidate.candidate.trim()) return false;
      if (candidate.cargo !== row.cargo) return false;
      if (typeof candidate.votes !== 'number' || !Number.isFinite(candidate.votes) || candidate.votes < 0) return false;
      return true;
    });
  });
}

export function useResultsFeed(intervalMs = 300000) {
  const [data, setData] = useState<ResultsFeed | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchFeed = async () => {
      if (!isResultsWindowOpen()) {
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const response = await fetch(RESULTS_FEED_URL, { cache: 'no-store', headers: { Accept: 'application/json' } });
        if (!response.ok) {
          if (active) setData(current => current?.state === 'complete' ? current : null);
          return;
        }

        const payload: unknown = await response.json();
        if (!active || !isValidResultsFeed(payload)) {
          if (active) setData(current => current?.state === 'complete' ? current : null);
          return;
        }

        setData(payload);
      } catch {
        if (active) setData(current => current?.state === 'complete' ? current : null);
      } finally {
        if (active) setChecking(false);
      }
    };

    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      if (isResultsWindowOpen()) void fetchFeed();
    };

    if (isResultsWindowOpen()) void fetchFeed();
    const timer = window.setInterval(refresh, intervalMs);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [intervalMs]);

  return {
    data,
    checking,
    phase: getResultsFeedPhase(data),
  };
}
