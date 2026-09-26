import { Check, ChevronRight, Code2, FileText, Info, List } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const items = [
  { id: 'summary' as const, label: 'Resumo', sub: 'executivo', description: 'Entrega o essencial primeiro: números centrais, serviços e caminhos de aprofundamento.', icon: List },
  { id: 'simple' as const, label: 'Simples', sub: 'guiado', description: 'Explica os números com contexto e comparações em uma leitura fluida e direta.', icon: FileText },
  { id: 'technical' as const, label: 'Técnico', sub: 'auditável', description: 'Abre fonte, data, método, recortes, cálculos e limitações para conferência completa.', icon: Code2 },
] as const;

const modeGuide = {
  summary: { title: 'Leitura executiva', detail: 'O essencial primeiro · avance só quando fizer sentido', signal: 'Essencial' },
  simple: { title: 'Leitura guiada', detail: 'Números com contexto · clareza sem excesso', signal: 'Contexto' },
  technical: { title: 'Leitura auditável', detail: 'Evidência, método e limites · rastreabilidade completa', signal: 'Evidência' },
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
        aria-label={mode === 'technical' ? 'Voltar para visão executiva' : 'Aprofundar leitura'}
        title={mode === 'technical' ? 'Voltar à visão executiva' : 'Avançar para o próximo nível de detalhe'}
      >
        <span>{mode === 'technical' ? 'Voltar à visão executiva' : mode === 'summary' ? 'Ver com contexto' : 'Abrir camada técnica'}</span>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
