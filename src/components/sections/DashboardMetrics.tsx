import { useMemo, useState } from 'react';
import { Activity, Gauge, Map, Users } from '../../components/icons';
import { observatorioData as d } from '../../data/observatorioData';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { dispatchInspect } from '../DataInspector';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { useLanguageMode } from '../../context/LanguageModeContext';

interface Point { readonly label: string; readonly value: number; readonly sourceId: string; readonly referenceDate?: string; }
interface LineChartProps { readonly title: string; readonly description: string; readonly points: readonly Point[]; readonly valueFormatter?: (value: number) => string; }
interface TooltipState { readonly xPct: number; readonly yPct: number; readonly point: Point; }
interface MetricDetail { readonly label: string; readonly value: string; readonly caption: string; readonly simpleExplanation: string; readonly icon: typeof Users; readonly sourceId: string; readonly referenceDate?: string; readonly status?: string; readonly note?: string; }

function lineChartGeometry(points: readonly Point[]) {
  const width = 620, height = 240, padX = 26, padY = 22;
  const plotWidth = width - padX * 2, plotHeight = height - padY * 2;
  const values = points.map(point => point.value);
  const minValue = Math.min(...values), maxValue = Math.max(...values), range = Math.max(maxValue - minValue, 1);
  const yMin = minValue - range * 0.12, yMax = maxValue + range * 0.12, yearCount = Math.max(points.length - 1, 1);
  const coords = points.map((point, index) => ({ ...point, x: padX + (plotWidth * index) / yearCount, y: padY + ((yMax - point.value) / (yMax - yMin)) * plotHeight }));
  return { width, height, plotHeight, coords };
}

function LineChart({ title, description, points, valueFormatter = value => formatNumber(value) }: LineChartProps) {
  const geometry = useMemo(() => lineChartGeometry(points), [points]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const polyline = geometry.coords.map(point => point.x + ',' + point.y).join(' ');
  const guides = [0, 1, 2, 3].map(index => 22 + (geometry.plotHeight * index) / 3);

  const showTooltip = (point: typeof geometry.coords[number]) => setTooltip({
    xPct: Math.min(88, Math.max(12, (point.x / geometry.width) * 100)),
    yPct: Math.min(88, Math.max(18, (point.y / geometry.height) * 100)),
    point,
  });

  return (
    <figure className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/70" aria-labelledby={title + '-caption'}>
      <figcaption id={title + '-caption'}>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</div>
        <p className="mt-1 text-sm text-slate-400 light:text-slate-600">{description}</p>
      </figcaption>
      <div className="relative mt-4 overflow-visible pb-1" onMouseLeave={() => setTooltip(null)}>
        <svg viewBox={'0 0 ' + geometry.width + ' ' + geometry.height} role="img" aria-label={title + ': ' + points.map(point => point.label + ' ' + valueFormatter(point.value)).join('; ')} className="h-auto w-full max-w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
          <title>{title}</title><desc>{description}</desc>
          {guides.map((y, index) => <line key={index} x1="26" x2="594" y1={y} y2={y} className="stroke-slate-700/40 light:stroke-slate-300/70" strokeWidth="1" />)}
          <polyline points={polyline} fill="none" className="stroke-sky-300 light:stroke-sky-600" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {geometry.coords.map(point => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="6" className="cursor-pointer fill-sky-300 transition-[r] duration-150 hover:r-[8px] focus:outline-none light:fill-sky-600" tabIndex={0} role="button" aria-label={point.label + ': ' + valueFormatter(point.value) + '. Abrir detalhes.'}
                onMouseEnter={() => showTooltip(point)} onMouseLeave={() => setTooltip(null)} onFocus={() => showTooltip(point)} onBlur={() => setTooltip(null)}
                onPointerDown={() => showTooltip(point)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); dispatchInspect({ label: title + ' · ' + point.label, value: valueFormatter(point.value), sourceId: point.sourceId, referenceDate: point.referenceDate, method: 'Ponto da série temporal.' }); } }} />
              <text x={point.x} y="234" textAnchor="middle" className="chart-axis-label fill-slate-500 text-[12px]">{point.label}</text>
            </g>
          ))}
        </svg>
        <div className="mt-3 grid gap-2 md:hidden" aria-label={title + ' em tabela'}>
          {points.map(point => (
            <div key={point.label + '-mobile'} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 light:bg-white">
              <span className="text-xs font-semibold text-slate-500">{point.label}</span>
              <span className="text-xs font-black text-slate-200 light:text-slate-700">{valueFormatter(point.value)}</span>
            </div>
          ))}
        </div>
        {tooltip && <button type="button" onClick={() => dispatchInspect({ label: title + ' · ' + tooltip.point.label, value: valueFormatter(tooltip.point.value), sourceId: tooltip.point.sourceId, referenceDate: tooltip.point.referenceDate, method: 'Ponto da série temporal.' })} className="absolute z-20 min-w-[150px] -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 text-left text-xs text-white shadow-xl backdrop-blur-md light:border-slate-200 light:bg-white/95 light:text-slate-900" style={{ left: tooltip.xPct + '%', top: tooltip.yPct + '%' }}>
          <div className="font-medium text-slate-300 light:text-slate-500">{tooltip.point.label}</div>
          <div className="mt-0.5 text-sm font-semibold text-sky-300 light:text-sky-700">{valueFormatter(tooltip.point.value)}</div>
          <div className="mt-1 text-[10px] text-slate-500">Abrir fonte e metodologia</div>
        </button>}
      </div>
    </figure>
  );
}

export function DashboardMetrics() {
  const { mode: languageMode } = useLanguageMode();
  const density = Number(d.indicators.find(i => i.id === 'density')?.value ?? 0);
  const area = Number(d.indicators.find(i => i.id === 'area')?.value ?? 0);
  const population2022 = d.populationSeries.find(p => p.year === 2022)?.value ?? 0;
  const population2026 = d.populationSeries.find(p => p.year === 2026)?.value ?? 0;
  const populationGrowthPct = population2022 ? ((population2026 - population2022) / population2022) * 100 : 0;
  const electorateShare = population2026 ? (d.electoral.electorate / population2026) * 100 : 0;
  const inclusionCount = d.electoral.socialNameCount ?? 0;
  const municipalIndicator = (id: string) => d.indicators.find(i => i.id === id)?.value ?? 0;
  const populationPoints = d.populationSeries.filter(p => p.year >= 2022).map(p => ({ label: String(p.year), value: p.value, sourceId: p.sourceId, referenceDate: p.referenceDate }));
  const electoratePoints: readonly Point[] = [
    { label: '2018', value: d.electoral.electorate2018 ?? 0, sourceId: d.electoral.electorate2018SourceId ?? d.electoral.sourceId },
    { label: '2022', value: d.electoral.electorate2022 ?? 0, sourceId: d.electoral.electorate2022SourceId ?? d.electoral.sourceId },
    { label: '2024', value: d.electoral.electorate2024 ?? 0, sourceId: d.electoral.electorate2024SourceId ?? d.electoral.sourceId },
    { label: '2026', value: d.electoral.electorate, sourceId: d.electoral.sourceId, referenceDate: d.electoral.snapshotDate },
  ];
  const populationDelta = population2026 - population2022;
  const metricDetails: readonly MetricDetail[] = [
    { label: 'População 2026', value: formatNumber(population2026), caption: 'estimativa IBGE', simpleExplanation: 'Estimativa de quantas pessoas moram na cidade em 2026.', icon: Users, sourceId: 'ibge-estimativas-2026', referenceDate: '2026-07-01' },
    { label: 'Eleitorado 2026', value: formatNumber(d.electoral.electorate), caption: 'snapshot da 28ª Zona', simpleExplanation: 'Quantidade de eleitores usada no recorte desta edição.', icon: Activity, sourceId: 'tse-eleitorado-2026', referenceDate: d.electoral.snapshotDate },
    { label: 'Nome social', value: formatNumber(inclusionCount), caption: 'eleitores no snapshot eleitoral', simpleExplanation: 'Registros de eleitores com nome social no recorte usado.', icon: Gauge, sourceId: d.electoral.sourceId, referenceDate: d.electoral.snapshotDate },
    { label: 'Densidade demográfica', value: formatNumber(density, 1) + ' hab/km²', caption: 'população 2026 ÷ área territorial', simpleExplanation: 'Média de habitantes por km², calculada a partir dos dados disponíveis.', icon: Map, sourceId: 'ibge-estimativas-2026', referenceDate: '2026-07-01' },
  ];

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="dashboard-title">
      <SectionHeader titleId="dashboard-title" eyebrow="Visão geral" title="Os números de referência" description="Indicadores principais em uma camada enxuta. Clique em um número para abrir fonte, referência e metodologia." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricDetails.map(({ label, value, caption, simpleExplanation, icon: Icon, sourceId, referenceDate, status, note }) => (
          <button key={label} type="button" onClick={() => dispatchInspect({ label, value, sourceId, referenceDate, status, note })} className="text-left">
            <Card><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</div><div className="mt-3 text-3xl font-black text-white light:text-slate-900">{value}</div><div className="mt-1 text-xs text-slate-500">{caption}</div><div className="mt-2 text-[11px] leading-5 text-slate-400 light:text-slate-600">{languageMode === 'simple' ? simpleExplanation : 'Fonte e método detalhados no inspetor.'}</div><div className="mt-2 inline-flex rounded-full border border-white/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 light:border-slate-200">{referenceDate ? `ref. ${referenceDate.split('-').reverse().join('/')}` : 'sem referência'}</div><div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-sky-300/70">Abrir detalhes</div></div><Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" /></div></Card>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-slate-50/70">
        <strong className="text-slate-300 light:text-slate-700">Antes de comparar:</strong> população e eleitorado são universos diferentes e podem ter datas de referência diferentes. A razão eleitorado/população é um cálculo estatístico; não mede comparecimento às urnas.
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <LineChart title="Crescimento populacional · 2022–2026" description="2022 é Censo; 2025/2026 são estimativas IBGE." points={populationPoints} valueFormatter={value => formatNumber(value) + ' hab.'} />
        <LineChart title="Eleitorado · 2018–2026" description="Snapshots disponíveis no modelo; 2026 é fotografia da 28ª Zona." points={electoratePoints} valueFormatter={value => formatNumber(value) + ' eleitores'} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <button type="button" className="text-left" onClick={() => dispatchInspect({ label: 'Crescimento 2022 → 2026', value: '+' + formatPercent(populationGrowthPct, 2), sourceId: 'ibge-estimativas-2026', referenceDate: '2026-07-01', status: 'derivado', note: 'Variação calculada entre os pontos de população de 2022 e 2026.' })}><Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Crescimento 2022 → 2026</div><div className="mt-2 text-3xl font-black text-white light:text-slate-900">+{formatPercent(populationGrowthPct, 2)}</div><div className="mt-1 text-xs font-semibold text-slate-500">+{formatNumber(populationDelta)} habitantes</div></Card></button>
        <button type="button" className="text-left" onClick={() => dispatchInspect({ label: 'Razão eleitorado/população', value: formatPercent(electorateShare, 2), sourceId: 'tse-eleitorado-2026', referenceDate: d.electoral.snapshotDate, status: 'derivado', note: 'Relação estatística entre dois universos; não representa comparecimento.' })}><Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Razão eleitorado/população</div><div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatPercent(electorateShare, 2)}</div><p className="mt-1 text-xs leading-5 text-slate-500">Clique para metodologia.</p></Card></button>
        <button type="button" className="text-left" onClick={() => dispatchInspect({ label: 'Área territorial', value: formatNumber(area, 3) + ' km²', sourceId: 'ibge-cidades-2026', referenceDate: '2025-01-01' })}><Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Base de cálculo</div><div className="mt-2 text-xl font-black text-white light:text-slate-900">{formatNumber(area, 3)} km²</div><p className="mt-1 text-xs leading-5 text-slate-500">Área territorial usada para a densidade derivada.</p></Card></button>
      </div>
      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50/70">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">Contexto municipal</div><h3 className="mt-1 text-lg font-black text-white light:text-slate-900">Outros indicadores do perfil IBGE</h3></div><span className="text-xs text-slate-500">Clique em qualquer valor</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[['Escolarização 6–14', formatPercent(Number(municipalIndicator('schooling-6-14')), 1), '2022', 'ibge-cidades-2026'],['Mortalidade infantil', formatNumber(Number(municipalIndicator('infant-mortality')), 2) + '‰', '2025', 'ibge-cidades-2026'],['Receitas brutas', 'R$ ' + (Number(municipalIndicator('revenue-2025')) / 1_000_000).toFixed(1).replace('.', ',') + ' mi', '2025', 'ibge-cidades-2026'],['PIB per capita', 'R$ ' + formatNumber(Number(municipalIndicator('gdp-per-capita-2023')), 2), '2023', 'ibge-cidades-2026'],['Área urbanizada', formatNumber(Number(municipalIndicator('urbanized-area')), 2) + ' km²', '2019', 'ibge-cidades-2026'],['Arborização viária', formatPercent(Number(municipalIndicator('street-arborization')), 2), '2022', 'ibge-cidades-2026'],['Esgotamento adequado', formatPercent(Number(municipalIndicator('adequate-sewerage')), 2), '2022', 'ibge-cidades-2026'],['Pessoal ocupado', formatNumber(Number(municipalIndicator('formal-workers'))) + ' pessoas', '2024', 'ibge-cidades-2026']].map(([label,value,year,sourceId]) => <button key={label} type="button" onClick={() => dispatchInspect({ label, value, sourceId, referenceDate: year + '-12-31' })} className="rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-sky-300/20 light:bg-white"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-2 text-xl font-black text-white light:text-slate-900">{value}</div><div className="mt-1 text-[11px] text-slate-500">ano-base {year}</div></button>)}
        </div>
      </div>
    </section>
  );
}
