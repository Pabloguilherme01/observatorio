import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_NAMESPACE } from '../config/version';

export type LanguageMode = 'summary' | 'simple' | 'technical';

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

  const value = useMemo(() => ({
    mode,
    setMode: setModeState,
    cycleMode: () => setModeState(current => current === 'summary' ? 'simple' : current === 'simple' ? 'technical' : 'summary'),
  }), [mode]);
  return <LanguageModeContext.Provider value={value}>{children}</LanguageModeContext.Provider>;
}

export function useLanguageMode() {
  const value = useContext(LanguageModeContext);
  if (!value) throw new Error('useLanguageMode deve ser usado dentro de LanguageModeProvider');
  return value;
}
