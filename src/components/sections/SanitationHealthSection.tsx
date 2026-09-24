import { Droplets, HeartPulse, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { healthCapacity } from '../../lib/calculations';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const sewerHistory = [
  { year: 2017, value: 2.9 }, { year: 2018, value: 19.0 }, { year: 2019, value: 39.2 },
  { year: 2020, value: 42.5 }, { year: 2021, value: 46.2 }, { year: 2022, value: 72.0 },
  { year: 2023, value: 80.8 }, { year: 2024, value: d.sanitation.publicSewerServicePct },
] as const;

function MetricBar({ label, value, emphasis = false }: { readonly label: string; readonly value: number; readonly emphasis?: boolean }) {
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

function SewerCurve() {
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
      <figcaption><div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Histórico · atendimento por rede pública</div><p className="mt-1 text-sm text-slate-400 light:text-slate-600">Indicador histórico de acesso ao serviço público de esgoto, 2017–2024.</p></figcaption>
      <svg viewBox="0 0 620 220" preserveAspectRatio="xMidYMid meet" className="mt-4 h-auto w-full" role="img" aria-label="Histórico do atendimento por rede pública de esgoto entre 2017 e 2024, em escala de 0 a 100 por cento. Não é série de tratamento efetivo.">
        <title>Atendimento por rede pública de esgoto, 2017 a 2024</title>
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

export function SanitationHealthSection() {
  const [plannedBeds, setPlannedBeds] = useState(d.health.plannedBeds ?? d.health.openingReportedBeds);
  const [bedReference, setBedReference] = useState<'opening' | 'current' | 'planning'>('planning');
  const minimumAttendancesPerOpeningBed = healthCapacity(d.health.firstYearAttendancesAtLeast, d.health.openingReportedBeds);
  const openingToPlanIncreasePct = ((plannedBeds - d.health.openingReportedBeds) / d.health.openingReportedBeds) * 100;
  const currentStatedBeds = d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds;
  const currentToPlanIncrease = plannedBeds - currentStatedBeds;
  const pressure = useMemo(() => {
    const attendancePerBed = d.health.firstYearAttendancesAtLeast / Math.max(plannedBeds, 1);
    const reductionPct = (1 - attendancePerBed / (d.health.firstYearAttendancesAtLeast / d.health.openingReportedBeds)) * 100;
    return { attendancePerBed, reductionPct };
  }, [plannedBeds]);

  return (
    <section id="saude" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="saude-title">
      <SectionHeader
        titleId="saude-title"
        eyebrow="Saneamento + saúde"
        title="Capacidade, cobertura e pressão de demanda"
        description="Os dois painéis preservam os denominadores e as datas de referência para que cobertura sanitária e capacidade hospitalar não sejam interpretadas como métricas intercambiáveis."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Saneamento 360°</div>
              <h3 id="sanitation-title" className="mt-2 text-xl font-black text-white light:text-slate-900">Acesso, serviço, coleta e tratamento</h3>
            </div>
            <Droplets className="h-5 w-5 text-sky-300" aria-hidden="true" />
          </div>

          <div className="mt-6 space-y-4">
            <MetricBar label="Acesso à água" value={d.sanitation.waterAccessPct} emphasis />
            <MetricBar label="Acesso ao serviço público de esgoto" value={d.sanitation.publicSewerServicePct} emphasis />
            <MetricBar label="Coleta do esgoto gerado" value={d.sanitation.sewerCollectionPct} />
            <MetricBar label="Tratamento do esgoto gerado" value={d.sanitation.sewerTreatmentOfGeneratedPct} />
            <MetricBar label="Do esgoto coletado, quanto é tratado" value={d.sanitation.collectedSewerTreatedPct} />
          </div>

          <SewerCurve />

                    <div className="mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4 light:border-slate-200 light:bg-slate-50/70">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Outra definição, outro ano-base</div>
            <div className="mt-2 flex items-end gap-3">
              <strong className="text-2xl font-black text-white light:text-slate-900">{formatPercent(Number(d.indicators.find(item => item.id === 'adequate-sewerage')?.value ?? 0), 2)}</strong>
              <span className="text-xs leading-5 text-slate-500">esgotamento sanitário adequado · IBGE · 2022</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Este indicador usa outra classificação e outro ano-base. Leia-o separadamente dos percentuais SINISA 2024.</p>
          </div>

<div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
              <strong className="block text-white light:text-slate-900">{formatPercent(d.sanitation.waterDistributionLossPct, 1)}</strong>
              <span className="text-xs text-slate-500">perdas na distribuição de água</span>
            </div>
            <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
              <strong className="block text-white light:text-slate-900">{formatNumber(d.sanitation.waterConsumptionLitersPerPersonDay, 1)} L</strong>
              <span className="text-xs text-slate-500">consumo por pessoa/dia</span>
            </div>
            <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
              <strong className="block text-white light:text-slate-900">{formatNumber(36_579)}</strong>
              <span className="text-xs text-slate-500">pessoas sem coleta, conforme snapshot</span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4 text-xs leading-5 text-slate-400 light:border-amber-300/50 light:bg-amber-50 light:text-slate-600">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300 light:text-amber-700" aria-hidden="true" />
            <p>{d.sanitation.note}</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">HEALGO</div>
              <h3 className="mt-2 text-xl font-black text-white light:text-slate-900">Pressão de demanda e capacidade</h3>
            </div>
            <HeartPulse className="h-5 w-5 text-rose-300" aria-hidden="true" />
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.02] p-4 light:border-slate-200 light:bg-slate-50">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Como ler os números de leitos</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 p-3 light:border-slate-200"><strong className="block text-sm text-white light:text-slate-900">164</strong><span className="mt-1 block text-xs text-slate-500">referência reportada na inauguração</span></div>
              <div className="rounded-2xl border border-white/8 p-3 light:border-slate-200"><strong className="block text-sm text-white light:text-slate-900">85</strong><span className="mt-1 block text-xs text-slate-500">32 enfermaria + 53 UTI, explicitados no portal atual</span></div>
              <div className="rounded-2xl border border-white/8 p-3 light:border-slate-200"><strong className="block text-sm text-white light:text-slate-900">298</strong><span className="mt-1 block text-xs text-slate-500">planejamento registrado no dataset, não capacidade instalada</span></div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">As três referências têm naturezas diferentes: inauguração, capacidade explicitada no portal atual e planejamento. O snapshot não documenta, por si só, a causa da diferença entre 164 e 85; não inferimos desativação, reclassificação ou redução de leitos sem fonte específica.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-4 light:border-slate-200">
              <div className="text-xs text-slate-500">Capacidade reportada na inauguração</div>
              <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatNumber(d.health.openingReportedBeds)}</div>
              <div className="text-xs text-slate-500">leitos</div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 light:border-slate-200">
              <div className="text-xs text-slate-500">Capacidade explicitada no portal atual</div>
              <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatNumber(currentStatedBeds)}</div>
              <div className="text-xs text-slate-500">{formatNumber(d.health.currentStatedWardBeds)} enfermaria + {formatNumber(d.health.currentStatedIcuBeds)} UTI</div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-sky-400/15 bg-sky-400/[0.04] p-5 light:border-sky-200 light:bg-sky-50">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-200 light:text-sky-700">Primeiro ano · cálculo derivado</div>
            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
              <div className="text-4xl font-black text-white light:text-slate-900">≈ {formatNumber(Math.floor(minimumAttendancesPerOpeningBed ?? 0))}</div>
              <div className="pb-1 text-sm text-slate-400 light:text-slate-600">atendimentos por leito</div>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Base: pelo menos {formatNumber(d.health.firstYearAttendancesAtLeast)} atendimentos ÷ {formatNumber(d.health.openingReportedBeds)} leitos reportados na inauguração.</p>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.02] p-5 light:border-slate-200 light:bg-slate-50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Simulador de capacidade</div>
                <div className="mt-1 text-sm text-slate-400">Escolha a referência que deseja usar no cálculo hipotético.</div>
              </div>
              <label className="text-xs font-bold text-slate-500">
                Referência
                <select
                  className="ml-2 min-h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs font-bold text-white light:border-slate-200 light:bg-white light:text-slate-900"
                  value={bedReference}
                  onChange={event => {
                    const value = event.target.value as 'opening' | 'current' | 'planning';
                    setBedReference(value);
                    setPlannedBeds(value === 'opening' ? 164 : value === 'current' ? 85 : 298);
                  }}
                  aria-label="Selecionar referência de leitos"
                >
                  <option value="opening">164 · inauguração</option>
                  <option value="current">85 · portal atual</option>
                  <option value="planning">298 · planejamento</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Referência ativa</span>
                <strong className="mt-1 block text-3xl font-black text-white light:text-slate-900">{formatNumber(plannedBeds)} leitos</strong>
              </div>
              <span className="text-right text-[11px] leading-5 text-slate-500">
                164 = inauguração · 85 = capacidade explicitada no portal atual · 298 = planejamento registrado
              </span>
            </div>
            <input
              className="mt-4 w-full accent-sky-400"
              type="range"
              min={85}
              max={298}
              step={1}
              value={plannedBeds}
              onChange={event => setPlannedBeds(Number(event.target.value))}
              aria-label="Simular quantidade de leitos"
              aria-valuemin={85}
              aria-valuemax={298}
              aria-valuenow={plannedBeds}
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Atendimentos/leito</span><strong className="mt-1 block text-lg text-white light:text-slate-900">{formatNumber(Math.round(pressure.attendancePerBed))}</strong></div>
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Redução teórica da pressão</span><strong className="mt-1 block text-lg text-white light:text-slate-900">-{formatNumber(pressure.reductionPct, 1)}%</strong></div>
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Indicador derivado</span><strong className="mt-1 block text-lg text-white light:text-slate-900">atendimentos/leito</strong></div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
              <strong className="block text-white light:text-slate-900">{formatNumber(plannedBeds)}</strong>
              <span className="text-xs text-slate-500">leitos planejados no dataset</span>
            </div>
            <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
              <strong className="block text-white light:text-slate-900">+{formatNumber(plannedBeds - d.health.openingReportedBeds)}</strong>
              <span className="text-xs text-slate-500">leitos vs. referência de inauguração</span>
            </div>
            <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
              <strong className="block text-white light:text-slate-900">+{formatNumber(currentToPlanIncrease)}</strong>
              <span className="text-xs text-slate-500">leitos vs. capacidade explicitada hoje</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <span>Variação 164 → 298</span>
              <strong className="text-white light:text-slate-900">+{openingToPlanIncreasePct.toFixed(1).replace('.', ',')}%</strong>
            </div>
            <p className="mt-2">O número de referência do planejamento é tratado como cenário e não como capacidade já instalada.</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
              <strong className="block text-white light:text-slate-900">R$ {formatNumber(d.health.openingInvestmentBrl / 1_000_000, 0)} mi</strong>
              <span className="text-xs text-slate-500">investimento reportado na inauguração</span>
            </div>
            <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200">
              <strong className="block text-white light:text-slate-900">{formatNumber(d.health.firstYearAttendancesAtLeast)}+</strong>
              <span className="text-xs text-slate-500">atendimentos no primeiro ano</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}