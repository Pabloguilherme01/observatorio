import { Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'essencial', description: '4–6 números essenciais e ações rápidas', icon: List },
  { id: 'simple' as const, label: 'Simples', sub: 'claro', description: 'Indicadores, comparações e contexto sem jargão', icon: FileText },
  { id: 'technical' as const, label: 'Técnico', sub: 'detalhes', description: 'Metodologia, fontes, recortes e rastreabilidade', icon: Code2 },
] as const;

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();

  return (
    <div className="language-toggle language-toggle-v3" role="group" aria-label="Escolha o nível de detalhe da leitura">
      <div className={`language-toggle-label mode-${mode}`} data-mode-label={mode}>
        <Info aria-hidden="true" />
        <span><strong>Modo de leitura</strong><small>{mode === 'summary' ? 'Essencial · decisão rápida' : mode === 'simple' ? 'Claro · contexto e comparação' : 'Técnico · método e evidências'}</small></span>
      </div>
      <div className="language-toggle-options">
        {items.map(({ id, label, sub, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            aria-label={label + ' · ' + sub}
            title={description}
            className={mode === id ? 'is-active' : ''}
          >
            <Icon aria-hidden="true" />
            <span><strong>{label}</strong><small>{sub}</small></span>
            {mode === id && <em>Ativo</em>}
          </button>
        ))}
      </div>
    </div>
  );
}
