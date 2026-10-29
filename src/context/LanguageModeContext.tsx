import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { STORAGE_NAMESPACE } from '../config/version';
import { fallbackDestinationForMode, type ReadingMode } from '../config/readingModes';
import { canPersistMunicipalLanguagePreference, readMunicipalLanguagePreference } from '../lib/storageMigration';
import { replaceCurrentUrl } from '../lib/urlState';

export type LanguageMode = ReadingMode;

interface LanguageModeContextValue {
  readonly mode: LanguageMode;
  readonly setMode: (mode: LanguageMode) => void;
  readonly cycleMode: () => void;
}

const STORAGE_KEY = `${STORAGE_NAMESPACE}-language-mode`;
const LanguageModeContext = createContext<LanguageModeContextValue | null>(null);

export function LanguageModeProvider({ children }: { readonly children: ReactNode }) {
  const userSelectedMode = useRef(false);
  const [mode, setModeState] = useState<LanguageMode>(() => {
    const value = readMunicipalLanguagePreference();
    return value === 'technical' || value === 'guided' || value === 'summary' || value === 'simple' ? value : 'summary';
  });

  useEffect(() => {
    document.documentElement.dataset.languageMode = mode;
    try {
      if (canPersistMunicipalLanguagePreference(userSelectedMode.current)) localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  const modeRef = useRef<LanguageMode>(mode);

  const setMode = useCallback((nextMode: LanguageMode) => {
    userSelectedMode.current = true;
    try { localStorage.setItem(STORAGE_KEY, nextMode); } catch {}
    modeRef.current = nextMode;
    setModeState(nextMode);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.languageMode = nextMode;
    }
    if (typeof window === 'undefined') return;

    const target = window.location.hash.slice(1);
    const fallback = fallbackDestinationForMode(target, nextMode);
    if (!fallback || fallback === target) return;

    replaceCurrentUrl({}, { hash: fallback });
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: fallback }));
    });
  }, []);

  const cycleMode = useCallback(() => {
    const current = modeRef.current;
    const nextMode = current === 'summary' ? 'simple' : current === 'simple' ? 'guided' : current === 'guided' ? 'technical' : 'summary';
    setMode(nextMode);
  }, [setMode]);

  const value = useMemo(() => ({ mode, setMode, cycleMode }), [mode, setMode, cycleMode]);
  return <LanguageModeContext.Provider value={value}>{children}</LanguageModeContext.Provider>;
}

export function useLanguageMode() {
  const value = useContext(LanguageModeContext);
  if (!value) throw new Error('useLanguageMode deve ser usado dentro de LanguageModeProvider');
  return value;
}
