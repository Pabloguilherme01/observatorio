import { Check, Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'essencial', description: 'Poucos números, estado atual e caminhos úteis', icon: List },
  { id: 'simple' as const, label: 'Simples', sub: 'claro', description: 'Indicadores, comparações e contexto em linguagem direta', icon: FileText },
  { id: 'technical' as const, label: 'Técnico', sub: 'evidências', description: 'Fontes, metodologia, recortes, cálculos e rastreabilidade', icon: Code2 },
] as const;

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();

  return (
    <div className="language-toggle language-toggle-v3" role="group" aria-label="Escolha como você quer ler os dados">
      <div className={'language-toggle-label mode-' + mode} data-mode-label={mode}>
        <Info aria-hidden="true" />
        <span><strong>Modo de leitura</strong><small>{mode === 'summary' ? 'Resumo · essencial e rápido' : mode === 'simple' ? 'Simples · claro e direto' : 'Técnico · fontes e método'}</small></span>
      </div>
      <div className="language-toggle-options">
        {items.map(({ id, label, sub, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            aria-label={label + ' · ' + description}
            title={description}
            className={mode === id ? 'is-active' : ''}
          >
            <Icon aria-hidden="true" />
            <span><strong>{label}</strong><small>{sub}</small></span>
            {mode === id && <em><Check aria-hidden="true" /> Ativo</em>}
          </button>
        ))}
      </div>
    </div>
  );
}
