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
  { id: 'norte', name: 'Região Norte', population: 82400, note: 'Exemplo visual: perímetro fictício para demonstração da interação acessível.' },
  { id: 'central', name: 'Região Central', population: 96200, note: 'Exemplo visual: perímetro fictício para demonstração da interação acessível.' },
  { id: 'sul', name: 'Região Sul', population: 71378, note: 'Exemplo visual: perímetro fictício para demonstração da interação acessível.' },
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

  const handleCanvasKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && selectedRegion) {
      event.preventDefault();
      setSelected(selectedRegion.id);
    }
  };

  return (
    <figure>
      <svg
        viewBox="0 0 500 520"
        role="img"
        tabIndex={0}
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedBy ?? descId}
        onKeyDown={handleCanvasKeyDown}
        onFocus={() => {
          if (!selected) setSelected(regions[0]?.id ?? null);
        }}
        className="h-auto w-full max-w-xl focus:outline-none"
      >
        <title id={titleId}>Mapa esquemático de regiões de Águas Lindas</title>
        <desc id={descId}>Mapa SVG leve com três regiões fictícias para demonstração de foco, toque e seleção por teclado.</desc>
        {regions.map(region => {
          const selectedState = selected === region.id;
          return (
            <path
              key={region.id}
              d={PATHS[region.id] ?? PATHS.central}
              tabIndex={0}
              role="button"
              aria-label={region.name + ': ' + region.population.toLocaleString('pt-BR') + ' habitantes. ' + region.note}
              aria-pressed={selectedState}
              onClick={() => selectRegion(region)}
              onFocus={() => setSelected(region.id)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectRegion(region);
                }
              }}
              className={selectedState ? 'fill-sky-300/30 stroke-sky-200' : 'fill-white/[0.04] stroke-white/20 hover:fill-sky-300/15'}
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="sr-only" aria-live="polite">
        {selectedRegion
          ? selectedRegion.name + ': ' + selectedRegion.population.toLocaleString('pt-BR') + ' habitantes. ' + selectedRegion.note
          : 'Nenhuma região selecionada.'}
      </div>
      {selectedRegion && (
        <div role="status" className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
          <strong>{selectedRegion.name}</strong>
          <div className="mt-1">{selectedRegion.population.toLocaleString('pt-BR')} habitantes</div>
          <p className="mt-1 text-xs text-slate-500">{selectedRegion.note}</p>
        </div>
      )}
    </figure>
  );
}
