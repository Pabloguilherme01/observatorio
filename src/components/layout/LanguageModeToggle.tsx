import { Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();
  const status = mode === 'technical'
    ? 'Detalhes técnicos visíveis'
    : mode === 'summary'
      ? 'Visão rápida com os pontos essenciais'
      : 'Leitura direta ao ponto';

  return (
    <div className="language-toggle language-toggle-v2" role="group" aria-label="Modo de leitura">
      <button type="button" onClick={() => setMode('summary')} aria-pressed={mode === 'summary'} className={mode === 'summary' ? 'is-active' : ''}>
        <List className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Resumo</span>
        <small>visão rápida</small>
      </button>
      <button type="button" onClick={() => setMode('simple')} aria-pressed={mode === 'simple'} className={mode === 'simple' ? 'is-active' : ''}>
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Simples</span>
        <small>direto ao ponto</small>
      </button>
      <button type="button" onClick={() => setMode('technical')} aria-pressed={mode === 'technical'} className={mode === 'technical' ? 'is-active' : ''}>
        <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Técnico</span>
        <small>fonte + método</small>
      </button>
      <span className="language-toggle-status" title={status} aria-label={status}>
        <Info className="h-3 w-3" aria-hidden="true" />
      </span>
    </div>
  );
}
