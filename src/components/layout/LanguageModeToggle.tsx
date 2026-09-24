import { Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'essencial', description: 'Só o essencial e ações rápidas', icon: List },
  { id: 'simple' as const, label: 'Simples', sub: 'claro', description: 'Dados claros, contexto sob demanda', icon: FileText },
  { id: 'technical' as const, label: 'Técnico', sub: 'detalhes', description: 'Fontes, método e rastreabilidade', icon: Code2 },
] as const;

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();

  return (
    <div className="language-toggle language-toggle-v3" role="group" aria-label="Escolha o nível de detalhe da leitura">
      <div className="language-toggle-label">
        <Info aria-hidden="true" />
        <span><strong>Modo de leitura</strong><small>Escolha quanto detalhe você quer ver</small></span>
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
