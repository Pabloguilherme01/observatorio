import { useEffect, useState } from 'react';

export interface ResultsFeedItem {
  readonly municipality?: string;
  readonly cargo?: string;
  readonly validVotes?: number;
  readonly totalVotes?: number;
  readonly updatedAt?: string;
}

export interface ResultsFeed {
  readonly state: 'pending' | 'live' | 'complete';
  readonly source: 'official-tse';
  readonly referenceDate: string;
  readonly capturedAt: string;
  readonly items: readonly ResultsFeedItem[];
}

const FEED_URL = '/observatorio/data/tse-results.json';
const RESULTS_WINDOW_START = new Date('2026-09-30T00:00:00-03:00').getTime();
const RESULTS_WINDOW_END = new Date('2026-10-26T06:00:00-03:00').getTime();
const VALID_STATES = new Set<ResultsFeed['state']>(['pending', 'live', 'complete']);

function isResultsWindowOpen(now = Date.now()) {
  return now >= RESULTS_WINDOW_START && now <= RESULTS_WINDOW_END;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isValidResultsFeed(value: unknown): value is ResultsFeed {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  if (payload.source !== 'official-tse' || !VALID_STATES.has(payload.state as ResultsFeed['state'])) return false;
  if (!isIsoDate(payload.referenceDate) || !isIsoDate(payload.capturedAt)) return false;
  const capturedAt = Date.parse(payload.capturedAt as string);
  if (capturedAt > Date.now() + 5 * 60 * 1000) return false;
  if (!Array.isArray(payload.items)) return false;

  return payload.items.every(item => {
    if (!item || typeof item !== 'object') return false;
    const row = item as Record<string, unknown>;
    if (row.updatedAt !== undefined && !isIsoDate(row.updatedAt)) return false;
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
    setData(current => current ?? null);

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
        // Missing or invalid feed is expected outside the official results window.
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

  return { data, checking };
}
