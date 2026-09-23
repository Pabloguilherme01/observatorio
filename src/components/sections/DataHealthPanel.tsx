import { Activity } from 'lucide-react';
import { DATA_HEALTH, type DataHealth } from '../../data/dataHealth';
import { SectionHeader } from '../ui/SectionHeader';
import { useLanguageMode } from '../../context/LanguageModeContext';

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
  const { mode } = useLanguageMode();
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="health-title">
      <div className="rounded-3xl border border-sky-300/10 bg-sky-300/[0.025] p-5 sm:p-6">
        <SectionHeader
          titleId="health-title"
          eyebrow="Data health"
          title={mode === 'simple' ? 'Como conferir os dados' : mode === 'quick' ? 'Dados verificados' : 'Metadados técnicos do conjunto'}
          description={mode === 'simple' ? 'Fonte, data e cobertura vêm antes da interpretação. Os detalhes técnicos ficam disponíveis no modo técnico.' : mode === 'quick' ? 'Veja só o sinal principal. A camada técnica fica separada.' : 'Dimensões técnicas calculadas no build. Os valores descrevem cobertura, origem e automação do dado; não são uma classificação eleitoral.'}
        />
        {mode === 'quick' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DATA_HEALTH.entries.slice(0, 4).map(entry => (
              <article key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="text-sm font-black text-white">{entry.label}</div>
                <div className="mt-2 text-xs font-semibold text-sky-200">Sinal de integridade disponível</div>
              </article>
            ))}
          </div>
        ) : mode === 'simple' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DATA_HEALTH.entries.slice(0, 8).map(entry => (
              <article key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="text-sm font-black text-white">{entry.label}</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">Tem fonte, data e checagem de consistência registrados.</p>
                <div className="mt-3 text-[10px] font-semibold text-slate-600">Atualizado no build · {entry.health.calculadoEm}</div>
              </article>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
