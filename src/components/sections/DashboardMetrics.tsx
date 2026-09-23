import { useMemo, useState } from 'react';
import { Activity, Gauge, Map, Users } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

interface Point {
  readonly label: string;
  readonly value: number;
}

interface LineChartProps {
  readonly title: string;
  readonly description: string;
  readonly points: readonly Point[];
  readonly valueFormatter?: (value: number) => string;
}

interface TooltipState {
  readonly xPct: number;
  readonly yPct: number;
  readonly label: string;
  readonly value: string;
}

function lineChartGeometry(points: readonly Point[]) {
  const width = 620;
  const height = 240;
  const padX = 26;
  const padY = 22;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padY * 2;
  const values = points.map(point => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const yMin = minValue - range * 0.12;
  const yMax = maxValue + range * 0.12;
  const yearCount = Math.max(points.length - 1, 1);

  const coords = points.map((point, index) => {
    const x = padX + (plotWidth * index) / yearCount;
    const y = padY + ((yMax - point.value) / (yMax - yMin)) * plotHeight;
    return { ...point, x, y };
  });

  return { width, height, plotHeight, coords };
}

function LineChart({ title, description, points, valueFormatter = value => formatNumber(value) }: LineChartProps) {
  const geometry = useMemo(() => lineChartGeometry(points), [points]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const polyline = geometry.coords.map(point => point.x + ',' + point.y).join(' ');
  const guides = [0, 1, 2, 3].map(index => 22 + (geometry.plotHeight * index) / 3);

  const showTooltip = (point: typeof geometry.coords[number]) => {
    setTooltip({
      xPct: (point.x / geometry.width) * 100,
      yPct: (point.y / geometry.height) * 100,
      label: point.label,
      value: valueFormatter(point.value),
    });
  };

  return (
    <figure className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/70" aria-labelledby={title + '-caption'}>
      <figcaption id={title + '-caption'}>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</div>
        <p className="mt-1 text-sm text-slate-400 light:text-slate-600">{description}</p>
      </figcaption>

      <div className="relative mt-4" onMouseLeave={() => setTooltip(null)}>
        <svg
          viewBox={'0 0 ' + geometry.width + ' ' + geometry.height}
          role="img"
          aria-label={title + ': ' + points.map(point => point.label + ' ' + valueFormatter(point.value)).join('; ')}
          className="h-auto min-w-[560px] w-full overflow-visible"
        >
          <title>{title}</title>
          <desc>{description}</desc>

          {guides.map((y, index) => (
            <line
              key={index}
              x1="26"
              x2="594"
              y1={y}
              y2={y}
              className="stroke-slate-700/40 light:stroke-slate-300/70"
              strokeWidth="1"
            />
          ))}

          <polyline
            points={polyline}
            fill="none"
            className="stroke-sky-300 light:stroke-sky-600"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {geometry.coords.map(point => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                className="cursor-pointer fill-sky-300 transition-[r] duration-150 hover:r-[8px] focus:outline-none light:fill-sky-600"
                tabIndex={0}
                role="img"
                aria-label={point.label + ': ' + valueFormatter(point.value)}
                onMouseEnter={() => showTooltip(point)}
                onMouseLeave={() => setTooltip(null)}
                onFocus={() => showTooltip(point)}
                onBlur={() => setTooltip(null)}
                onPointerDown={() => showTooltip(point)}
              />
              <text x={point.x} y="234" textAnchor="middle" className="fill-slate-500 text-[12px]">
                {point.label}
              </text>
            </g>
          ))}
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 min-w-[120px] -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-md light:border-slate-200 light:bg-white/95 light:text-slate-900"
            style={{ left: tooltip.xPct + '%', top: tooltip.yPct + '%' }}
            role="status"
            aria-live="polite"
          >
            <div className="font-medium text-slate-300 light:text-slate-500">{tooltip.label}</div>
            <div className="mt-0.5 text-sm font-semibold text-sky-300 light:text-sky-700">{tooltip.value}</div>
          </div>
        )}
      </div>
    </figure>
  );
}

export function DashboardMetrics() {
  const density = Number(d.indicators.find(indicator => indicator.id === 'density')?.value ?? 0);
  const area = Number(d.indicators.find(indicator => indicator.id === 'area')?.value ?? 0);
  const population2022 = d.populationSeries.find(point => point.year === 2022)?.value ?? 0;
  const population2026 = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
  const populationGrowthPct = population2022 ? ((population2026 - population2022) / population2022) * 100 : 0;
  const electorateShare = population2026 ? (d.electoral.electorate / population2026) * 100 : 0;
  const inclusionCount = d.electoral.socialNameCount ?? 0;
  const municipalIndicator = (id: string) => d.indicators.find(indicator => indicator.id === id)?.value ?? 0;
  const indigenousElectorate = d.electoral.indigenousElectorate ?? 0;

  const populationPoints = d.populationSeries
    .filter(point => point.year >= 2022)
    .map(point => ({ label: String(point.year), value: point.value }));

  const electoratePoints: readonly Point[] = [
    { label: '2018', value: d.electoral.electorate2018 ?? 0 },
    { label: '2022', value: d.electoral.electorate2022 ?? 0 },
    { label: '2024', value: d.electoral.electorate2024 ?? 0 },
    { label: '2026', value: d.electoral.electorate },
  ];

  const populationDelta = population2026 - population2022;

  const metrics = [
    { label: 'População 2026', value: formatNumber(population2026), caption: 'estimativa IBGE', icon: Users },
    { label: 'Eleitorado 2026', value: formatNumber(d.electoral.electorate), caption: 'snapshot da 28ª Zona', icon: Activity },
    { label: 'Inclusão eleitoral', value: formatNumber(inclusionCount), caption: formatNumber(indigenousElectorate) + ' eleitores indígenas registrados', icon: Gauge },
    { label: 'Densidade demográfica', value: formatNumber(density, 1) + ' hab/km²', caption: 'população 2026 ÷ área territorial', icon: Map },
  ] as const;

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="dashboard-title">
      <SectionHeader titleId="dashboard-title" eyebrow="Visão geral" title="Os números de referência" description="Indicadores principais em uma camada enxuta, com unidade, estado do dado e cálculo derivado explicitado." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, caption, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</div>
                <div className="mt-3 text-3xl font-black text-white light:text-slate-900">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{caption}</div>
              </div>
              <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <LineChart
          title="Crescimento populacional · 2022–2026"
          description="Série disponível no dataset atual; 2022 é Censo e 2025/2026 são estimativas IBGE."
          points={populationPoints}
          valueFormatter={value => formatNumber(value) + ' hab.'}
        />
        <LineChart
          title="Eleitorado · 2018–2026"
          description="Snapshots do eleitorado disponíveis no modelo, com 2026 tratado como fotografia da 28ª Zona."
          points={electoratePoints}
          valueFormatter={value => formatNumber(value) + ' eleitores'}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Crescimento 2022 → 2026</div>
          <div className="mt-2 text-3xl font-black text-white light:text-slate-900">+{formatPercent(populationGrowthPct, 2)}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">+{formatNumber(populationDelta)} habitantes</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">Variação calculada a partir dos dois pontos do dataset.</p>
        </Card>
        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Razão eleitorado/população</div>
          <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatPercent(electorateShare, 2)}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">Relação estatística entre dois universos; não representa comparecimento.</p>
        </Card>
        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Base de cálculo</div>
          <div className="mt-2 text-xl font-black text-white light:text-slate-900">{formatNumber(area, 3)} km²</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">Área territorial usada para a densidade demográfica derivada.</p>
        </Card>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/70">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">Contexto municipal</div>
            <h3 className="mt-1 text-lg font-black text-white light:text-slate-900">Outros indicadores do perfil IBGE</h3>
          </div>
          <span className="text-xs text-slate-500">anos-base preservados por indicador</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Escolarização 6–14', formatPercent(Number(municipalIndicator('schooling-6-14')), 1), '2022'],
            ['Mortalidade infantil', formatNumber(Number(municipalIndicator('infant-mortality')), 2) + '‰', '2025'],
            ['Receitas brutas', 'R$ ' + (Number(municipalIndicator('revenue-2025')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', '2025'],
            ['PIB per capita', 'R$ ' + formatNumber(Number(municipalIndicator('gdp-per-capita-2023')), 2), '2023'],
            ['Área urbanizada', formatNumber(Number(municipalIndicator('urbanized-area')), 2) + ' km²', '2019'],
            ['Arborização viária', formatPercent(Number(municipalIndicator('street-arborization')), 2), '2022'],
            ['Esgotamento adequado', formatPercent(Number(municipalIndicator('adequate-sewerage')), 2), '2022'],
            ['Pessoal ocupado', formatNumber(Number(municipalIndicator('formal-workers'))) + ' pessoas', '2024'],
          ].map(([label, value, year]) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-black/10 p-4 light:bg-white">
              <div className="text-xs font-semibold text-slate-500">{label}</div>
              <div className="mt-2 text-xl font-black text-white light:text-slate-900">{value}</div>
              <div className="mt-1 text-[11px] text-slate-500">ano-base {year}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
