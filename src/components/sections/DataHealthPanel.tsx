import { Activity } from 'lucide-react';
import { DATA_HEALTH, type DataHealth } from '../../data/dataHealth';
import { SectionHeader } from '../ui/SectionHeader';

const labels: ReadonlyArray<[keyof Omit<DataHealth, 'calculadoEm'>, string]> = [
  ['frescura', 'Frescura'],
  ['proveniencia', 'Proveniência'],
  ['cobertura', 'Cobertura'],
  ['reconciliacao', 'Reconciliação'],
  ['automacao', 'Automação'],
];

function dots(value: DataHealth[keyof Omit<DataHealth, 'calculadoEm'>]): string {
  return '●'.repeat(value) + '○'.repeat(5 - value);
}

export function DataHealthPanel() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="health-title">
      <div className="rounded-3xl border border-sky-300/10 bg-sky-300/[0.025] p-5 sm:p-6">
        <SectionHeader
          titleId="health-title"
          eyebrow="Data health"
          title="Metadados técnicos do conjunto"
          description="Dimensões técnicas calculadas no build. Os valores descrevem cobertura, origem e automação do dado; não são uma classificação eleitoral."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DATA_HEALTH.entries.slice(0, 8).map(entry => (
            <article key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="text-xs font-black text-white">{entry.label}</div>
              <div className="mt-3 space-y-1.5">
                {labels.map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-wide">
                    <span className="text-slate-600">{label}</span>
                    <span className="tabular-nums text-sky-300" aria-label={label + ' nível ' + entry.health[key] + ' de 5'}>{dots(entry.health[key])}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-600"><Activity className="h-3 w-3" aria-hidden="true" /> calculado em {entry.health.calculadoEm}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
