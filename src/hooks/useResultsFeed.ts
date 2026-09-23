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

export function useResultsFeed(intervalMs = 300000) {
  const [data, setData] = useState<ResultsFeed | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchFeed = async () => {
      setChecking(true);
      try {
        const response = await fetch(FEED_URL, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as ResultsFeed;
        if (!active || payload.source !== 'official-tse') return;
        setData(payload);
      } catch {
        // Missing feed is expected before official results are published.
      } finally {
        if (active) setChecking(false);
      }
    };

    fetchFeed();
    const timer = window.setInterval(fetchFeed, intervalMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return { data, checking };
}
