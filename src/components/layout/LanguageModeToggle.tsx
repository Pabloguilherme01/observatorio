import { Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'decidir', description: 'Poucos números essenciais, estado atual e ações rápidas', icon: List },
  { id: 'simple' as const, label: 'Simples', sub: 'entender', description: 'Indicadores, comparações e contexto sem jargão', icon: FileText },
  { id: 'technical' as const, label: 'Técnico', sub: 'conferir', description: 'Fontes, metodologia, recortes, cálculos e rastreabilidade', icon: Code2 },
] as const;

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();

  return (
    <div className="language-toggle language-toggle-v3" role="group" aria-label="Escolha como você quer ler os dados">
      <div className={`language-toggle-label mode-${mode}`} data-mode-label={mode}>
        <Info aria-hidden="true" />
        <span><strong>Modo de leitura</strong><small>{mode === 'summary' ? 'Decidir · essencial e rápido' : mode === 'simple' ? 'Entender · contexto e comparação' : 'Conferir · método e evidências'}</small></span>
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
