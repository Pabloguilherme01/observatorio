import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_NAMESPACE } from '../config/version';
import { fallbackDestinationForMode, type ReadingMode } from '../config/readingModes';

export type LanguageMode = ReadingMode;

interface LanguageModeContextValue {
  readonly mode: LanguageMode;
  readonly setMode: (mode: LanguageMode) => void;
  readonly cycleMode: () => void;
}

const STORAGE_KEY = `${STORAGE_NAMESPACE}-language-mode`;
const LanguageModeContext = createContext<LanguageModeContextValue | null>(null);

export function LanguageModeProvider({ children }: { readonly children: ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>(() => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'technical' || value === 'summary' || value === 'simple' ? value : 'summary';
    } catch {
      return 'summary';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.languageMode = mode;
    try { localStorage.setItem(STORAGE_KEY, mode); } catch {}
  }, [mode]);

  const setMode = useCallback((nextMode: LanguageMode) => {
    setModeState(nextMode);
    if (typeof window === 'undefined') return;

    const target = window.location.hash.slice(1);
    const fallback = fallbackDestinationForMode(target, nextMode);
    if (!fallback || fallback === target) return;

    window.history.replaceState(null, '', '#' + fallback);
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: fallback }));
    });
  }, []);

  const cycleMode = useCallback(() => {
    const nextMode = mode === 'summary' ? 'simple' : mode === 'simple' ? 'technical' : 'summary';
    setMode(nextMode);
  }, [mode, setMode]);

  const value = useMemo(() => ({ mode, setMode, cycleMode }), [mode, setMode, cycleMode]);
  return <LanguageModeContext.Provider value={value}>{children}</LanguageModeContext.Provider>;
}

export function useLanguageMode() {
  const value = useContext(LanguageModeContext);
  if (!value) throw new Error('useLanguageMode deve ser usado dentro de LanguageModeProvider');
  return value;
}
