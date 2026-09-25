import { Check, Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'rápido', description: 'Para se situar: números-chave, contexto mínimo e caminhos de aprofundamento', icon: List },
  { id: 'simple' as const, label: 'Simples', sub: 'claro', description: 'Para entender: indicadores, comparações e contexto em linguagem direta', icon: FileText },
  { id: 'technical' as const, label: 'Técnico', sub: 'rastreável', description: 'Para auditar: fonte, data, método, recortes, cálculos e limitações', icon: Code2 },
] as const;

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();

  return (
    <div className="language-toggle language-toggle-v3" role="group" aria-label="Escolha como você quer ler os dados">
      <div className={'language-toggle-label mode-' + mode} data-mode-label={mode} aria-live="polite">
        <Info aria-hidden="true" />
        <span><strong>Modo de leitura</strong><small>{mode === 'summary' ? 'Rápido · essencial primeiro' : mode === 'simple' ? 'Claro · contexto sem excesso' : 'Rastreável · fonte, método e limites'}</small></span>
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
            data-mode={id}
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
