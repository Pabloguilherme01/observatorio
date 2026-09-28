import { Check, ChevronRight, Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'leitura rápida', description: 'Mostra apenas os pontos principais, mantendo referência e origem acessíveis.', icon: List },
  { id: 'simple' as const, label: 'Explicado', sub: 'com contexto', description: 'Acrescenta contexto para entender natureza, período e significado dos números.', icon: FileText },
  { id: 'technical' as const, label: 'Detalhado', sub: 'fonte e método', description: 'Abre a leitura completa com fonte, data, método, cálculos, recortes e limitações.', icon: Code2 },
] as const;

const modeGuide = {
  summary: { title: 'Leitura rápida', detail: 'Menos conteúdo · referências preservadas', signal: 'Essencial' },
  simple: { title: 'Leitura explicada', detail: 'Mais contexto · definições e períodos', signal: 'Contexto' },
  technical: { title: 'Leitura detalhada', detail: 'Maior densidade · fonte, método e limites', signal: 'Evidência' },
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
        aria-label={mode === 'technical' ? 'Voltar para leitura rápida' : 'Aumentar nível de detalhe'}
        title={mode === 'technical' ? 'Voltar à leitura rápida' : 'Avançar para o próximo nível de detalhe'}
      >
        <span>{mode === 'technical' ? 'Voltar ao resumo' : mode === 'summary' ? 'Explicar com contexto' : 'Ver fonte e método'}</span>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
