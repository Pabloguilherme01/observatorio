import type { KeyboardEvent } from 'react';
import { useId, useState } from 'react';

export interface RegionDatum {
  readonly id: string;
  readonly name: string;
  readonly population: number;
  readonly note: string;
}

interface AccessibleRegionMapProps {
  readonly ariaDescribedBy?: string;
  readonly regions?: readonly RegionDatum[];
}

const DEFAULT_REGIONS: readonly RegionDatum[] = [
  { id: 'norte', name: 'Região Norte', population: 82400, note: 'Representação esquemática: perímetro fictício para demonstração da interação acessível.' },
  { id: 'central', name: 'Região Central', population: 96200, note: 'Representação esquemática: perímetro fictício para demonstração da interação acessível.' },
  { id: 'sul', name: 'Região Sul', population: 71378, note: 'Representação esquemática: perímetro fictício para demonstração da interação acessível.' },
];

const PATHS: Readonly<Record<string, string>> = {
  norte: 'M80 60 L300 35 L420 100 L365 180 L185 170 L80 120 Z',
  central: 'M185 170 L365 180 L430 300 L300 355 L145 300 L120 220 Z',
  sul: 'M145 300 L300 355 L360 455 L190 480 L70 410 L95 335 Z',
};

export function AccessibleRegionMap({ ariaDescribedBy, regions = DEFAULT_REGIONS }: AccessibleRegionMapProps) {
  const titleId = useId();
  const descId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRegion = regions.find(region => region.id === selected);

  const selectRegion = (region: RegionDatum) => setSelected(region.id);

  const handleRegionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, region: RegionDatum) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectRegion(region);
    }
  };

  return (
    <figure data-testid="accessible-region-map">
      <svg
        viewBox="0 0 500 520"
        role="img"
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedBy ?? descId}
        className="h-auto w-full max-w-xl"
      >
        <title id={titleId}>Mapa esquemático de regiões de Águas Lindas</title>
        <desc id={descId}>Representação esquemática. Posições relativas não correspondem a coordenadas geográficas. Os perímetros são fictícios e servem apenas para demonstrar a interação acessível.</desc>
        {regions.map(region => (
          <path
            key={region.id}
            d={PATHS[region.id] ?? PATHS.central}
            className={selected === region.id ? 'fill-sky-300/30 stroke-sky-200' : 'fill-white/[0.04] stroke-white/20'}
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            aria-hidden="true"
          />
        ))}
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Navegação acessível pelas regiões">
        {regions.map(region => (
          <button
            key={region.id}
            type="button"
            data-testid="region-option"
            aria-pressed={selected === region.id}
            aria-label={region.name + ': ' + region.population.toLocaleString('pt-BR') + ' habitantes'}
            onClick={() => selectRegion(region)}
            onKeyDown={event => handleRegionKeyDown(event, region)}
            className="min-h-11 rounded-xl border border-white/10 px-3 py-2 text-left text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            {region.name}
          </button>
        ))}
      </div>

      <div className="sr-only" aria-live="polite">
        {selectedRegion
          ? selectedRegion.name + ': ' + selectedRegion.population.toLocaleString('pt-BR') + ' habitantes. ' + selectedRegion.note
          : 'Nenhuma região selecionada.'}
      </div>

      {selectedRegion && (
        <div data-testid="region-card" role="status" className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
          <strong>{selectedRegion.name}</strong>
          <div className="mt-1">{selectedRegion.population.toLocaleString('pt-BR')} habitantes</div>
          <p className="mt-1 text-xs text-slate-500">{selectedRegion.note}</p>
        </div>
      )}
    </figure>
  );
}
