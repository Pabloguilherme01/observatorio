import { Check, CircleHalf, Contrast } from 'lucide-react';
import { useContrast, type ContrastMode } from '../../context/ContrastContext';

const options: readonly { id: ContrastMode; label: string; short: string }[] = [
  { id: 'system', label: 'Sistema', short: 'Automático' },
  { id: 'normal', label: 'Padrão', short: 'Normal' },
  { id: 'high', label: 'Alto contraste', short: 'Mais contraste' },
];

export function ContrastModeToggle() {
  const { mode, effectiveHighContrast, setMode } = useContrast();

  return (
    <div className="contrast-toggle" role="group" aria-label="Contraste da interface">
      <div className="contrast-toggle-label">
        <Contrast aria-hidden="true" />
        <span>
          <strong>Contraste</strong>
          <small>{mode === 'system' ? 'Segue o sistema' : effectiveHighContrast ? 'Alto contraste ativo' : 'Contraste padrão'}</small>
        </span>
      </div>
      <div className="contrast-toggle-options">
        {options.map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={mode === option.id ? 'is-active' : ''}
            aria-pressed={mode === option.id}
            aria-label={option.label + ' · ' + option.short}
            title={option.short}
          >
            {mode === option.id ? <Check aria-hidden="true" /> : <CircleHalf aria-hidden="true" />}
            <span>
              <strong>{option.label}</strong>
              <small>{option.short}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
