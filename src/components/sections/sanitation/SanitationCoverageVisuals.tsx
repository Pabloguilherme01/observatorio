import { useState } from 'react';
import { observatorioData as d } from '../../../data/observatorioData';
import { formatPercent } from '../../../utils/formatters';

const sewerHistory = [
  { year: 2017, value: 2.9 }, { year: 2018, value: 19.0 }, { year: 2019, value: 39.2 },
  { year: 2020, value: 42.5 }, { year: 2021, value: 46.2 }, { year: 2022, value: 72.0 },
  { year: 2023, value: 80.8 }, { year: 2024, value: d.sanitation.publicSewerServicePct },
] as const;

const sewerHistoryStartYear = sewerHistory[0].year;
export const sewerHistoryEndYear = sewerHistory[sewerHistory.length - 1].year;

export function MetricBar({ label, value, emphasis = false }: { readonly label: string; readonly value: number; readonly emphasis?: boolean }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      className="relative"
      onMouseLeave={() => setTooltip(null)}
      onMouseMove={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }}
    >
      <div className="mb-1 flex items-center justify-between gap-4 text-xs">
        <span className={emphasis ? 'font-semibold text-white light:text-slate-900' : 'text-slate-400 light:text-slate-600'}>{label}</span>
        <strong className={emphasis ? 'text-sky-300 light:text-sky-700' : 'text-white light:text-slate-900'}>{formatPercent(value, 1)}</strong>
      </div>
      <div
        className="h-2.5 cursor-help overflow-hidden rounded-full bg-white/5 light:bg-slate-200"
        role="img"
        aria-label={label + ': ' + formatPercent(value, 1)}
        tabIndex={0}
        onFocus={() => setTooltip({ x: 50, y: -8 })}
        onBlur={() => setTooltip(null)}
      >
        <div className="h-full rounded-full bg-sky-300 light:bg-sky-600" style={{ width: width + '%' }} />
      </div>
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-md light:border-slate-200 light:bg-white/95 light:text-slate-900"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="status"
          aria-live="polite"
        >
          <span className="block text-slate-400 light:text-slate-500">{label}</span>
          <strong className="text-sky-300 light:text-sky-700">{formatPercent(value, 1)}</strong>
        </div>
      )}
    </div>
  );
}

export function SewerCurve() {
  const [selectedYear, setSelectedYear] = useState(sewerHistory[sewerHistory.length - 1].year);
  const chartMin = 0;
  const chartMax = 100;
  const points = sewerHistory.map((point, index) => ({
    ...point,
    x: 42 + (index * 548) / (sewerHistory.length - 1),
    y: 28 + ((chartMax - point.value) / (chartMax - chartMin)) * 122,
  }));

  return (
    <figure className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-4 light:border-slate-200 light:bg-white">
      <figcaption><div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Histórico · atendimento por rede pública</div><p className="mt-1 text-sm text-slate-400 light:text-slate-600">Indicador histórico de acesso ao serviço público de esgoto, {sewerHistoryStartYear}–{sewerHistoryEndYear}.</p></figcaption>
      <svg viewBox="0 0 620 220" preserveAspectRatio="xMidYMid meet" className="mt-4 h-auto w-full" role="img" aria-label={`Histórico do atendimento por rede pública de esgoto entre ${sewerHistoryStartYear} e ${sewerHistoryEndYear}, em escala de 0 a 100 por cento. Não é série de tratamento efetivo.`}>
        <title>{`Atendimento por rede pública de esgoto, ${sewerHistoryStartYear} a ${sewerHistoryEndYear}`}</title>
        <desc>{sewerHistory.map(point => `${point.year}: ${String(point.value).replace('.', ',')} por cento`).join('; ')}.</desc>
        {[0, 50, 100].map(value => {
          const y = 28 + ((chartMax - value) / (chartMax - chartMin)) * 122;
          return <g key={value}>
            <line x1="42" y1={y} x2="590" y2={y} className="stroke-slate-700/25 light:stroke-slate-300/80" strokeWidth="1" />
            <text x="12" y={y + 4} className="label-secondary fill-slate-500 text-[9px]">{value}%</text>
          </g>;
        })}
        <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} fill="none" className="stroke-sky-300 light:stroke-sky-600" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(point => <g key={point.year} tabIndex={0} role="img" aria-label={`${point.year}: ${String(point.value).replace('.', ',')}%`}><circle cx={point.x} cy={point.y} r="6" className="fill-sky-300 light:fill-sky-600" /><text x={point.x} y={point.y - 12} textAnchor="middle" className="label-secondary fill-slate-400 text-[10px] light:fill-slate-600">{String(point.value).replace('.', ',')}%</text><text x={point.x} y="194" textAnchor="middle" className="label-secondary fill-slate-500 text-[10px]">{point.year}</text></g>)}
      </svg>
      <div className="sewer-mobile-bars mt-4" aria-label="Histórico em barras tocáveis">
        {sewerHistory.map(point => (
          <button
            key={point.year}
            type="button"
            className={'sewer-mobile-bar ' + (selectedYear === point.year ? 'is-selected' : '')}
            onClick={() => setSelectedYear(point.year)}
            aria-pressed={selectedYear === point.year}
            aria-label={point.year + ': ' + String(point.value).replace('.', ',') + ' por cento'}
          >
            <span className="sewer-mobile-bar-value">{String(point.value).replace('.', ',')}%</span>
            <span className="sewer-mobile-bar-track"><span style={{ height: Math.max(4, point.value) + '%' }} /></span>
            <span className="sewer-mobile-bar-year">{point.year}</span>
          </button>
        ))}
      </div>
      <div className="sewer-mobile-selected" role="status" aria-live="polite">
        <strong>{selectedYear}</strong>
        <span>{String(sewerHistory.find(point => point.year === selectedYear)?.value ?? 0).replace('.', ',')}% de atendimento por rede pública</span>
      </div>

      <div className="table-compact-mobile mt-3 grid gap-2 md:hidden">
        {sewerHistory.map(point => (
          <div key={point.year} className="flex items-center justify-between rounded-xl border border-white/8 px-3 py-2 light:border-slate-200">
            <span className="text-xs font-semibold text-slate-500">{point.year}</span>
            <strong className="text-xs text-slate-200 light:text-slate-700">{String(point.value).replace('.', ',')}%</strong>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-5 text-amber-200/80 light:text-amber-700">Como ler: este gráfico mostra atendimento por rede pública. Coleta, tratamento e esgotamento adequado usam definições e anos-base diferentes; não compare as curvas como se fossem a mesma métrica.</p>
    </figure>
  );
}
