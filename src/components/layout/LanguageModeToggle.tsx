import { Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();
  const status = mode === 'technical'
    ? 'Detalhes técnicos, fontes e método visíveis'
    : mode === 'summary'
      ? 'Somente os dados essenciais e ações rápidas'
      : 'Leitura clara com contexto sob demanda';

  return (
    <div className="language-toggle language-toggle-v2" role="group" aria-label="Escolha o nível de detalhe da leitura">
      <button type="button" onClick={() => setMode('summary')} aria-pressed={mode === 'summary'} className={mode === 'summary' ? 'is-active' : ''} title="Somente os dados essenciais e ações rápidas">
        <List className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Resumo</span>
        <small>essencial</small>
      </button>
      <button type="button" onClick={() => setMode('simple')} aria-pressed={mode === 'simple'} className={mode === 'simple' ? 'is-active' : ''} title="Leitura clara com contexto sob demanda">
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Simples</span>
        <small>claro</small>
      </button>
      <button type="button" onClick={() => setMode('technical')} aria-pressed={mode === 'technical'} className={mode === 'technical' ? 'is-active' : ''} title="Mostrar fontes, método e detalhes dos dados">
        <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Técnico</span>
        <small>detalhes</small>
      </button>
      <span className="language-toggle-status" title={status} aria-label={status} aria-live="polite" role="status">
        <Info className="h-3 w-3" aria-hidden="true" />
        <span className="sr-only">{status}</span>
      </span>
    </div>
  );
}
