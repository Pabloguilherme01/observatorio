import { Droplets, HeartPulse, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { healthCapacity } from '../../lib/calculations';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const LEGACY_SEWER_REFERENCE_2017 = 2.9;

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
  const points = [
    { x: 32, y: 184, label: '2017', value: LEGACY_SEWER_REFERENCE_2017 },
    { x: 588, y: 44, label: '2024', value: d.sanitation.publicSewerServicePct },
  ] as const;

  return (
    <figure className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-4 light:border-slate-200 light:bg-white">
      <figcaption>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Curva histórica destacada</div>
        <p className="mt-1 text-sm text-slate-400 light:text-slate-600">2,9% → 84,8% conforme a referência mantida no dataset legado.</p>
      </figcaption>

      <svg viewBox="0 0 620 220" className="mt-4 h-auto w-full" role="img" aria-label="Curva histórica de 2,9 por cento em 2017 para 84,8 por cento em 2024">
        <title>Curva histórica de saneamento</title>
        <desc>Referência histórica do dataset legado, com 2,9% em 2017 e 84,8% em 2024. Os indicadores de coleta e tratamento possuem denominadores diferentes e não devem ser inferidos a partir desta linha.</desc>
        <line x1="32" y1="194" x2="588" y2="194" className="stroke-slate-700/40 light:stroke-slate-300" strokeWidth="1" />
        <polyline points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y}`} fill="none" className="stroke-sky-300 light:stroke-sky-600" strokeWidth="5" strokeLinecap="round" />
        {points.map(point => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="7" className="fill-sky-300 light:fill-sky-600" />
            <text x={point.x} y={point.y - 14} textAnchor="middle" className="fill-slate-400 text-[12px] light:fill-slate-600">{String(point.value).replace('.', ',')}%</text>
            <text x={point.x} y="214" textAnchor="middle" className="fill-slate-500 text-[12px]">{point.label}</text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-[11px] leading-5 text-amber-200/80 light:text-amber-700">Leitura metodológica: esta linha reproduz a referência 2017→2024 do dataset do observatório; ela não deve ser interpretada como uma série homogênea de coleta, tratamento ou população atendida sem a ficha técnica correspondente.</p>
    </figure>
  );
}

export function SanitationHealthSection() {
  const [plannedBeds, setPlannedBeds] = useState(d.health.plannedBeds ?? d.health.openingReportedBeds);
  const minimumAttendancesPerOpeningBed = healthCapacity(d.health.firstYearAttendancesAtLeast, d.health.openingReportedBeds);
  const openingToPlanIncreasePct = ((plannedBeds - d.health.openingReportedBeds) / d.health.openingReportedBeds) * 100;
  const currentStatedBeds = d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds;
  const currentToPlanIncrease = plannedBeds - currentStatedBeds;
  const pressure = useMemo(() => {
    const attendancePerBed = d.health.firstYearAttendancesAtLeast / Math.max(plannedBeds, 1);
    const reductionPct = (1 - attendancePerBed / (d.health.firstYearAttendancesAtLeast / d.health.openingReportedBeds)) * 100;
    const status = attendancePerBed > 2000 ? 'Crítico' : attendancePerBed > 1200 ? 'Alta pressão' : 'Sustentável';
    return { attendancePerBed, reductionPct, status };
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
            <MetricBar label="Serviço público de esgoto" value={d.sanitation.publicSewerServicePct} emphasis />
            <MetricBar label="Coleta de esgoto" value={d.sanitation.sewerCollectionPct} />
            <MetricBar label="Tratado / gerado" value={d.sanitation.sewerTreatmentOfGeneratedPct} />
            <MetricBar label="Do coletado, quanto é tratado" value={d.sanitation.collectedSewerTreatedPct} />
          </div>

          <SewerCurve />

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
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Simulador de capacidade</div>
                <div className="mt-1 text-sm text-slate-400">Ajuste hipotético entre a referência de inauguração e o planejamento registrado.</div>
              </div>
              <strong className="text-sky-300">{formatNumber(plannedBeds)} leitos</strong>
            </div>
            <input
              className="mt-4 w-full accent-sky-400"
              type="range"
              min={d.health.openingReportedBeds}
              max={d.health.plannedBeds ?? d.health.openingReportedBeds}
              step={1}
              value={plannedBeds}
              onChange={event => setPlannedBeds(Number(event.target.value))}
              aria-label="Simular quantidade de leitos"
              aria-valuemin={d.health.openingReportedBeds}
              aria-valuemax={d.health.plannedBeds ?? d.health.openingReportedBeds}
              aria-valuenow={plannedBeds}
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Atendimentos/leito</span><strong className="mt-1 block text-lg text-white light:text-slate-900">{formatNumber(Math.round(pressure.attendancePerBed))}</strong></div>
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Redução teórica da pressão</span><strong className="mt-1 block text-lg text-white light:text-slate-900">-{formatNumber(pressure.reductionPct, 1)}%</strong></div>
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Faixa calculada</span><strong className="mt-1 block text-lg text-white light:text-slate-900">{pressure.status}</strong></div>
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