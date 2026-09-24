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
    <div className="language-toggle language-toggle-v2" role="group" aria-label="Escolha como ler o observatório">
      <button type="button" onClick={() => setMode('summary')} aria-pressed={mode === 'summary'} className={mode === 'summary' ? 'is-active' : ''} title="Mostrar apenas os pontos principais">
        <List className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Resumo</span>
        <small>essencial</small>
      </button>
      <button type="button" onClick={() => setMode('simple')} aria-pressed={mode === 'simple'} className={mode === 'simple' ? 'is-active' : ''} title="Mostrar informações em linguagem mais simples">
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Simples</span>
        <small>claro</small>
      </button>
      <button type="button" onClick={() => setMode('technical')} aria-pressed={mode === 'technical'} className={mode === 'technical' ? 'is-active' : ''} title="Mostrar fontes, método e detalhes dos dados">
        <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Técnico</span>
        <small>detalhes</small>
      </button>
      <span className="language-toggle-status" title={status} aria-label={status}>
        <Info className="h-3 w-3" aria-hidden="true" />
      </span>
    </div>
  );
}
