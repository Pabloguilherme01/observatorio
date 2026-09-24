import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ContrastMode = 'system' | 'high' | 'normal';

interface ContrastContextValue {
  readonly mode: ContrastMode;
  readonly effectiveHighContrast: boolean;
  readonly setMode: (mode: ContrastMode) => void;
}

const ContrastContext = createContext<ContrastContextValue | null>(null);
const STORAGE_KEY = 'observatorio-contrast';

function readStoredMode(): ContrastMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'high' || stored === 'normal' || stored === 'system') return stored;
  } catch {}
  return 'system';
}

function getSystemHighContrast(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-contrast: more)').matches
    || window.matchMedia('(forced-colors: active)').matches;
}

function applyContrast(high: boolean) {
  const root = document.documentElement;
  root.classList.toggle('high-contrast', high);
  root.dataset.contrast = high ? 'high' : 'normal';
}

export function ContrastProvider({ children }: { readonly children: ReactNode }) {
  const [mode, setMode] = useState<ContrastMode>(readStoredMode);
  const [systemHighContrast, setSystemHighContrast] = useState(getSystemHighContrast);

  const effectiveHighContrast = mode === 'high' || (mode === 'system' && systemHighContrast);

  useEffect(() => {
    applyContrast(effectiveHighContrast);
    try { window.localStorage.setItem(STORAGE_KEY, mode); } catch {}
  }, [effectiveHighContrast, mode]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function' || mode !== 'system') return;
    const contrast = window.matchMedia('(prefers-contrast: more)');
    const forced = window.matchMedia('(forced-colors: active)');
    const update = () => setSystemHighContrast(contrast.matches || forced.matches);
    update();
    contrast.addEventListener?.('change', update);
    forced.addEventListener?.('change', update);
    return () => {
      contrast.removeEventListener?.('change', update);
      forced.removeEventListener?.('change', update);
    };
  }, [mode]);

  const value = useMemo(() => ({ mode, effectiveHighContrast, setMode }), [mode, effectiveHighContrast]);

  return <ContrastContext.Provider value={value}>{children}</ContrastContext.Provider>;
}

export function useContrast(): ContrastContextValue {
  const value = useContext(ContrastContext);
  if (!value) throw new Error('useContrast deve ser usado dentro de ContrastProvider.');
  return value;
}
