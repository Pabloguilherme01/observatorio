import { useEffect, useState } from 'react';

export type ResultsFeedPhase = 'pre_open' | 'open_waiting' | 'live' | 'complete' | 'ended_unavailable';

export interface ResultsFeedItem {
  readonly municipality?: string;
  readonly candidateId?: string;
  readonly candidate?: string;
  readonly cargo?: string;
  readonly validVotes?: number;
  readonly totalVotes?: number;
  readonly updatedAt?: string;
}

export interface ResultsFeed {
  readonly schemaVersion: 1;
  readonly state: 'pending' | 'live' | 'complete';
  readonly source: 'official-tse';
  readonly sourceUrl: string;
  readonly sourceFile: string;
  readonly electionCode: number;
  readonly turn: 1 | 2;
  readonly uf: 'GO';
  readonly municipalityCode: string;
  readonly municipalityName: string;
  readonly cargo: string;
  readonly referenceDate: string;
  readonly capturedAt: string;
  readonly items: readonly ResultsFeedItem[];
  readonly integrity?: {
    readonly sha256?: string;
    readonly jwsVerified?: boolean;
  };
}

const FEED_URL = '/observatorio/data/tse-results.json';
const RESULTS_WINDOW_START = new Date('2026-09-30T00:00:00-03:00').getTime();
const RESULTS_WINDOW_END = new Date('2026-10-26T06:00:00-03:00').getTime();
const VALID_STATES = new Set<ResultsFeed['state']>(['pending', 'live', 'complete']);

export function isResultsWindowOpen(now = Date.now()) {
  return now >= RESULTS_WINDOW_START && now <= RESULTS_WINDOW_END;
}

function getResultsFeedPhase(data: ResultsFeed | null, now = Date.now()): ResultsFeedPhase {
  if (data?.state === 'complete') return 'complete';
  if (now < RESULTS_WINDOW_START) return 'pre_open';
  if (now > RESULTS_WINDOW_END) return 'ended_unavailable';
  if (data?.state === 'live') return 'live';
  return 'open_waiting';
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isOfficialResultsUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('https://resultados.tse.jus.br');
}

function isValidResultsFeed(value: unknown): value is ResultsFeed {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  if (payload.schemaVersion !== 1) return false;
  if (payload.source !== 'official-tse' || !VALID_STATES.has(payload.state as ResultsFeed['state'])) return false;
  if (!isOfficialResultsUrl(payload.sourceUrl) || typeof payload.sourceFile !== 'string' || !payload.sourceFile.trim()) return false;
  if (!Number.isInteger(payload.electionCode) || ![6257, 6259, 6261].includes(payload.electionCode as number)) return false;
  if (![1, 2].includes(payload.turn as number) || payload.uf !== 'GO') return false;
  if (typeof payload.municipalityCode !== 'string' || !/^\d{5}$/.test(payload.municipalityCode)) return false;
  if (typeof payload.municipalityName !== 'string' || !payload.municipalityName.trim()) return false;
  if (typeof payload.cargo !== 'string' || !payload.cargo.trim()) return false;
  if (!isIsoDate(payload.referenceDate) || !isIsoDate(payload.capturedAt)) return false;

  const capturedAt = Date.parse(payload.capturedAt as string);
  if (capturedAt > Date.now() + 5 * 60 * 1000) return false;
  if (!Array.isArray(payload.items)) return false;

  if (payload.integrity !== undefined) {
    if (!payload.integrity || typeof payload.integrity !== 'object') return false;
    const integrity = payload.integrity as Record<string, unknown>;
    if (integrity.sha256 !== undefined && (typeof integrity.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(integrity.sha256))) return false;
    if (integrity.jwsVerified !== undefined && typeof integrity.jwsVerified !== 'boolean') return false;
  }

  return payload.items.every(item => {
    if (!item || typeof item !== 'object') return false;
    const row = item as Record<string, unknown>;
    if (row.updatedAt !== undefined && !isIsoDate(row.updatedAt)) return false;
    if (row.municipality !== undefined && (typeof row.municipality !== 'string' || !row.municipality.trim())) return false;
    if (row.candidateId !== undefined && typeof row.candidateId !== 'string') return false;
    if (row.candidate !== undefined && typeof row.candidate !== 'string') return false;
    if (row.cargo !== undefined && typeof row.cargo !== 'string') return false;
    for (const key of ['validVotes', 'totalVotes'] as const) {
      if (row[key] !== undefined && (typeof row[key] !== 'number' || !Number.isFinite(row[key]) || row[key] < 0)) return false;
    }
    if (typeof row.validVotes === 'number' && typeof row.totalVotes === 'number' && row.validVotes > row.totalVotes) return false;
    return true;
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
        const response = await fetch(FEED_URL, { cache: 'no-store' });
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
