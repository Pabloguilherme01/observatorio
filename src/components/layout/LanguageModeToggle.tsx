import { Code2, Eye } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();
  return (
    <div className="language-toggle" role="group" aria-label="Modo de leitura">
      <button type="button" onClick={() => setMode('simple')} aria-pressed={mode === 'simple'} className={mode === 'simple' ? 'is-active' : ''}>
        <Eye className="h-3.5 w-3.5" aria-hidden="true" /><span>Simples</span>
      </button>
      <button type="button" onClick={() => setMode('technical')} aria-pressed={mode === 'technical'} className={mode === 'technical' ? 'is-active' : ''}>
        <Code2 className="h-3.5 w-3.5" aria-hidden="true" /><span>Técnico</span>
      </button>
    </div>
  );
}
