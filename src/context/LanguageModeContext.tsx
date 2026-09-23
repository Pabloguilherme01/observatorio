import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_NAMESPACE } from '../config/version';

export type LanguageMode = 'simple' | 'technical' | 'quick';

interface LanguageModeContextValue {
  readonly mode: LanguageMode;
  readonly setMode: (mode: LanguageMode) => void;
}

const STORAGE_KEY = `${STORAGE_NAMESPACE}-language-mode`;
const LanguageModeContext = createContext<LanguageModeContextValue | null>(null);

export function LanguageModeProvider({ children }: { readonly children: ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>(() => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'technical' || value === 'quick' ? value : 'simple';
    } catch {
      return 'simple';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.languageMode = mode;
    document.documentElement.classList.remove('mode-simple', 'mode-technical', 'mode-quick');
    document.documentElement.classList.add('mode-' + mode);
    try { localStorage.setItem(STORAGE_KEY, mode); } catch {}
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode: setModeState }), [mode]);
  return <LanguageModeContext.Provider value={value}>{children}</LanguageModeContext.Provider>;
}

export function useLanguageMode() {
  const value = useContext(LanguageModeContext);
  if (!value) throw new Error('useLanguageMode deve ser usado dentro de LanguageModeProvider');
  return value;
}
