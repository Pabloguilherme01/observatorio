import { Check, ChevronRight, Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'essencial', description: 'Mostra os pontos centrais com fonte e referência, reduzindo detalhes na tela.', icon: List },
  { id: 'simple' as const, label: 'Explicado', sub: 'com contexto', description: 'Explica os números em linguagem direta e mantém fontes e referências acessíveis.', icon: FileText },
  { id: 'technical' as const, label: 'Detalhado', sub: 'fonte e método', description: 'Exibe fonte, data, método, recortes, cálculos e limitações para conferência completa.', icon: Code2 },
] as const;

const modeGuide = {
  summary: { title: 'Leitura essencial', detail: 'Pontos centrais · fonte e referência continuam acessíveis', signal: 'Essencial' },
  simple: { title: 'Leitura explicada', detail: 'Números com contexto · linguagem direta', signal: 'Contexto' },
  technical: { title: 'Leitura detalhada', detail: 'Fonte, método e limites · conferência completa', signal: 'Evidência' },
} as const;

export function LanguageModeToggle() {
  const { mode, setMode, cycleMode } = useLanguageMode();
  const guide = modeGuide[mode];

  return (
    <div className="language-toggle language-toggle-v3" data-active-mode={mode} role="group" aria-label="Escolha como você quer ler os dados">
      <div className={'language-toggle-label mode-' + mode} data-mode-label={mode} aria-live="polite">
        <Info aria-hidden="true" />
        <span><strong>{guide.title}</strong><small>{guide.detail}</small></span>
        <em className="language-toggle-signal" aria-hidden="true">{guide.signal}</em>
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
      <button
        type="button"
        className="language-toggle-deepen"
        onClick={cycleMode}
        aria-label={mode === 'technical' ? 'Voltar para leitura essencial' : 'Aumentar nível de detalhe'}
        title={mode === 'technical' ? 'Voltar à leitura essencial' : 'Avançar para o próximo nível de detalhe'}
      >
        <span>{mode === 'technical' ? 'Voltar ao essencial' : mode === 'summary' ? 'Explicar com contexto' : 'Ver fonte e método'}</span>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
