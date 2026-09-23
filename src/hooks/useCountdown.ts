import { useEffect, useMemo, useState } from 'react';

export interface CountdownValue {
  readonly totalMs: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly completed: boolean;
}

export function useCountdown(targetIso: string): CountdownValue {
  const targetMs = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalMs = Math.max(0, targetMs - now);
  const totalSeconds = Math.floor(totalMs / 1000);

  return {
    totalMs,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    completed: totalMs === 0,
  };
}
