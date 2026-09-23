import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
interface ThemeContextValue { readonly theme: Theme; readonly toggle: () => void; }
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('observatorio-theme');
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  } catch { return 'dark'; }
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('observatorio-theme', theme); } catch { /* storage unavailable */ }
  }, [theme]);
  const value = useMemo(() => ({
    theme,
    toggle: () => setTheme(value => value === 'dark' ? 'light' : 'dark'),
  }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme deve ser usado dentro de ThemeProvider.');
  return value;
}
