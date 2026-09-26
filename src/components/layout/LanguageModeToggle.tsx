import { Check, Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'essencial', description: 'Prioriza síntese, números-chave e próximos caminhos. Ideal para uma leitura rápida.', icon: List },
  { id: 'simple' as const, label: 'Simples', sub: 'explicado', description: 'Acrescenta contexto e comparações em linguagem direta, sem sobrecarregar a leitura.', icon: FileText },
  { id: 'technical' as const, label: 'Técnico', sub: 'verificável', description: 'Expõe fonte, data, método, recortes, cálculos e limitações para conferência.', icon: Code2 },
] as const;

const modeGuide = {
  summary: { title: 'Leitura essencial', detail: 'Menos detalhes na tela · aprofunde quando precisar' },
  simple: { title: 'Leitura contextual', detail: 'Explicações e comparações · complexidade na medida' },
  technical: { title: 'Leitura verificável', detail: 'Evidências, método e limites · máxima rastreabilidade' },
} as const;

export function LanguageModeToggle() {
  const { mode, setMode } = useLanguageMode();
  const guide = modeGuide[mode];

  return (
    <div className="language-toggle language-toggle-v3" role="group" aria-label="Escolha como você quer ler os dados">
      <div className={'language-toggle-label mode-' + mode} data-mode-label={mode} aria-live="polite">
        <Info aria-hidden="true" />
        <span><strong>{guide.title}</strong><small>{guide.detail}</small></span>
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
