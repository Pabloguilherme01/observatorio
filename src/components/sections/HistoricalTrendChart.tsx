import '../../assets/styles/dashboard.css';
import { Activity, CalendarDays, Users } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { observatorioData as d } from '../../data/observatorioData';
import { formatNumber } from '../../utils/formatters';

type TrendPoint = {
  readonly year: number;
  readonly population: number | null;
  readonly electorate: number | null;
};

const YEARS = [2022, 2023, 2024, 2025, 2026] as const;

function valueFor<T extends { year: number; value: number }>(series: readonly T[], year: number): number | null {
  const point = series.find(item => item.year === year);
  return point?.value ?? null;
}

const trendData: readonly TrendPoint[] = YEARS.map(year => ({
  year,
  population: valueFor(d.populationSeries, year),
  electorate: year === 2022
    ? d.electoral.electorate2022 ?? null
    : year === 2024
      ? d.electoral.electorate2024 ?? null
      : year === 2026
        ? d.electoral.electorate
        : null,
}));

function TrendTooltip({ active, payload, label }: {
  readonly active?: boolean;
  readonly payload?: readonly { dataKey?: string; value?: number | null; name?: string }[];
  readonly label?: number | string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="dashboard-chart-tooltip">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 grid gap-1.5">
        {payload.filter(item => typeof item.value === 'number').map(item => (
          <div key={item.dataKey} className="flex items-center justify-between gap-6 text-xs">
            <span className="font-semibold text-slate-400">{item.name}</span>
            <strong className="text-white">{formatNumber(item.value as number)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendLine({
  dataKey,
  name,
  axisId,
  tone,
}: {
  readonly dataKey: 'population' | 'electorate';
  readonly name: string;
  readonly axisId: string;
  readonly tone: string;
}) {
  return (
    <Line
      yAxisId={axisId}
      type="monotone"
      dataKey={dataKey}
      name={name}
      stroke="currentColor"
      className={tone}
      strokeWidth={3}
      connectNulls={false}
      dot={(props: { readonly cx?: number; readonly cy?: number; readonly payload?: TrendPoint; readonly index?: number }) => {
        const { cx, cy, payload, index } = props;
        if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) return null;
        const value = payload[dataKey];
        return value === null
          ? <circle cx={cx} cy={cy} r={5} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="2 2" aria-hidden="true" />
          : <circle key={index} cx={cx} cy={cy} r={4} fill="currentColor" stroke="none" />;
      }}
      activeDot={{ r: 5 }}
      isAnimationActive
      animationDuration={450}
    />
  );
}

function CombinedChart() {
  return (
    <ResponsiveContainer width="100%" height={320} minWidth={0}>
      <LineChart data={trendData} margin={{ top: 10, right: 8, bottom: 4, left: -8 }}>
        <CartesianGrid strokeDasharray="3 5" vertical={false} className="stroke-slate-700/30 light:stroke-slate-300/70" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickMargin={8} />
        <YAxis yAxisId="population" width={58} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={value => formatNumber(Number(value))} />
        <YAxis yAxisId="electorate" orientation="right" width={58} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={value => formatNumber(Number(value))} />
        <Tooltip axisId="population" cursor={{ strokeDasharray: '3 5' }} content={<TrendTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        <TrendLine dataKey="population" name="População" axisId="population" tone="text-sky-300 light:text-sky-700" />
        <TrendLine dataKey="electorate" name="Eleitorado" axisId="electorate" tone="text-violet-300 light:text-violet-700" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SingleSeriesChart({
  dataKey,
  name,
  axisId,
  tone,
}: {
  readonly dataKey: 'population' | 'electorate';
  readonly name: string;
  readonly axisId: string;
  readonly tone: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={205} minWidth={0}>
      <LineChart data={trendData} margin={{ top: 10, right: 8, bottom: 4, left: -8 }}>
        <CartesianGrid strokeDasharray="3 5" vertical={false} className="stroke-slate-700/30 light:stroke-slate-300/70" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickMargin={6} />
        <YAxis yAxisId={axisId} width={58} tickLine={false} axisLine={false} tick={{ fontSize: 9 }} tickFormatter={value => formatNumber(Number(value))} />
        <Tooltip cursor={{ strokeDasharray: '3 5' }} content={<TrendTooltip />} />
        <TrendLine dataKey={dataKey} name={name} axisId={axisId} tone={tone} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function HistoricalTrendChart() {
  return (
    <figure className="dashboard-history-card mt-4 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5 light:border-slate-200 light:bg-slate-50/80" aria-labelledby="dashboard-history-title">
      <figcaption id="dashboard-history-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300/80 light:text-sky-700">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              5 anos em perspectiva
            </div>
            <h3 className="mt-1 text-lg font-black text-white light:text-slate-900">População e eleitorado</h3>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Série de 2022 a 2026 com os pontos oficiais disponíveis no modelo. Anos sem observação não são interpolados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 px-2.5 py-1.5 light:border-slate-200 light:bg-white"><Users className="h-3 w-3" aria-hidden="true" /> População</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 px-2.5 py-1.5 light:border-slate-200 light:bg-white"><Activity className="h-3 w-3" aria-hidden="true" /> Eleitorado</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/14 px-2.5 py-1.5 text-slate-500 light:border-slate-300 light:bg-white">○ Sem observação</span>
          </div>
        </div>
      </figcaption>

      <div className="dashboard-history-chart mt-4 hidden w-full min-[420px]:block" role="img" aria-label="Linha histórica de população e eleitorado de 2022 a 2026.">
        <CombinedChart />
      </div>

      <div className="mt-4 block min-[420px]:hidden" aria-label="Séries históricas separadas em telas estreitas">
        <div className="rounded-2xl border border-white/8 bg-white/[0.018] p-3 light:border-slate-200 light:bg-white">
          <div className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-300/80 light:text-sky-700">População</div>
          <div className="w-full"><SingleSeriesChart dataKey="population" name="População" axisId="population-mobile" tone="text-sky-300 light:text-sky-700" /></div>
        </div>
        <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.018] p-3 light:border-slate-200 light:bg-white">
          <div className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-violet-300/80 light:text-violet-700">Eleitorado</div>
          <div className="w-full"><SingleSeriesChart dataKey="electorate" name="Eleitorado" axisId="electorate-mobile" tone="text-violet-300 light:text-violet-700" /></div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-[11px] leading-5 text-slate-500 sm:grid-cols-3">
        <span><strong className="text-slate-400">População:</strong> Censo 2022 e estimativas IBGE 2025/2026.</span>
        <span><strong className="text-slate-400">Eleitorado:</strong> snapshots TSE de 2022, 2024 e 2026.</span>
        <span><strong className="text-slate-400">Leitura:</strong> universos diferentes, com escalas próprias.</span>
      </div>

      <details className="mt-3 rounded-2xl border border-white/8 bg-white/[0.015] px-3 py-2 light:border-slate-200 light:bg-white">
        <summary className="cursor-pointer list-none text-xs font-bold text-slate-300 light:text-slate-700">Ver dados em tabela</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <caption className="sr-only">Dados históricos de população e eleitorado entre 2022 e 2026</caption>
            <thead>
              <tr className="border-b border-white/8 light:border-slate-200">
                <th scope="col" className="px-2 py-2 font-bold text-slate-500">Ano</th>
                <th scope="col" className="px-2 py-2 font-bold text-slate-500">População</th>
                <th scope="col" className="px-2 py-2 font-bold text-slate-500">Eleitorado</th>
              </tr>
            </thead>
            <tbody>
              {trendData.map(point => (
                <tr key={point.year} className="border-b border-white/6 last:border-0 light:border-slate-100">
                  <th scope="row" className="px-2 py-2 font-semibold text-slate-300 light:text-slate-700">{point.year}</th>
                  <td className="px-2 py-2 text-slate-400 light:text-slate-600">{point.population === null ? 'Sem observação' : formatNumber(point.population)}</td>
                  <td className="px-2 py-2 text-slate-400 light:text-slate-600">{point.electorate === null ? 'Sem observação' : formatNumber(point.electorate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
