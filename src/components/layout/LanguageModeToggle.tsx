import { Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();
  const status = mode === 'technical'
    ? 'Dados completos, fontes e detalhes técnicos visíveis'
    : mode === 'summary'
      ? 'Resumo com os principais pontos do observatório'
      : 'Leitura simples com informações essenciais';

  return (
    <div className="language-toggle language-toggle-v2" role="group" aria-label="Escolha como ler os dados">
      <button type="button" onClick={() => setMode('summary')} aria-pressed={mode === 'summary'} className={mode === 'summary' ? 'is-active' : ''}>
        <List className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Resumo</span>
        <small>principais dados</small>
      </button>
      <button type="button" onClick={() => setMode('simple')} aria-pressed={mode === 'simple'} className={mode === 'simple' ? 'is-active' : ''}>
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Simples</span>
        <small>leitura fácil</small>
      </button>
      <button type="button" onClick={() => setMode('technical')} aria-pressed={mode === 'technical'} className={mode === 'technical' ? 'is-active' : ''}>
        <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Técnico</span>
        <small>fontes e método</small>
      </button>
      <span className="language-toggle-status" title={status} aria-label={status}>
        <Info className="h-3 w-3" aria-hidden="true" />
      </span>
    </div>
  );
}
