import { Droplets, HeartPulse, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { healthCapacity } from '../../lib/calculations';
import { formatDate, formatNumber, formatPercent } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { SanitationGapCard } from './sanitation/SanitationGapCard';
import { StatTile } from './sanitation/StatTile';
import { MetricBar, SewerCurve, sewerHistoryEndYear } from './sanitation/SanitationCoverageVisuals';

function formatSigned(value: number, digits = 0) {
  const sign = value > 0 ? '+' : '';
  return sign + formatNumber(value, digits);
}

export function SanitationHealthSection() {
  const sanitationReference = d.indicators.find(item => item.id === 'public-sewer-service-2024');
  const sanitationSource = d.sources.find(source => source.id === d.sanitation.sourceId);
  const sanitationReferenceDate = sanitationReference?.referenceDate ?? sanitationSource?.referenceDate;
  const sanitationReferenceYear = sanitationReferenceDate?.slice(0, 4) ?? String(sewerHistoryEndYear);
  const adequateSewerageIndicator = d.indicators.find(item => item.id === 'adequate-sewerage');
  const adequateSewerageYear = adequateSewerageIndicator?.referenceDate?.slice(0, 4) ?? 'ano-base próprio';
  const wasteCollectionIndicator = d.indicators.find(item => item.id === 'household-waste-collection-2024');
  const wasteCollectionYear = wasteCollectionIndicator?.referenceDate?.slice(0, 4) ?? sanitationReferenceYear;
  const [plannedBeds, setPlannedBeds] = useState(d.health.plannedBeds ?? d.health.openingReportedBeds);
  const [bedReference, setBedReference] = useState<'opening' | 'current' | 'planning' | 'custom'>('planning');
  const minimumAttendancesPerOpeningBed = healthCapacity(d.health.firstYearAttendancesAtLeast, d.health.openingReportedBeds);
  const scenarioVsOpeningPct = ((plannedBeds - d.health.openingReportedBeds) / d.health.openingReportedBeds) * 100;
  const currentStatedBeds = d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds;
  const scenarioVsCurrent = plannedBeds - currentStatedBeds;
  const planningBeds = d.health.plannedBeds ?? d.health.openingReportedBeds;
  const minimumBeds = Math.min(d.health.openingReportedBeds, currentStatedBeds, planningBeds);
  const maximumBeds = Math.max(d.health.openingReportedBeds, currentStatedBeds, planningBeds);
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
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Saneamento</div>
              <h3 id="sanitation-title" className="mt-2 text-xl font-black text-white light:text-slate-900">Acesso, serviço, coleta e tratamento</h3>
            </div>
            <Droplets className="h-5 w-5 text-sky-300" aria-hidden="true" />
          </div>

          <div className="dashboard-card-meta mt-3">
            <span className="dashboard-meta-chip" data-kind={sanitationReference?.status}>Base SINISA</span>
            {sanitationReferenceDate && <span className="dashboard-meta-chip">ref. {formatDate(sanitationReferenceDate)}</span>}
          </div>

          <div className="mt-6 space-y-4">
            <MetricBar label="Acesso à água" value={d.sanitation.waterAccessPct} emphasis />
            <MetricBar label="Acesso ao serviço público de esgoto" value={d.sanitation.publicSewerServicePct} emphasis />
            <MetricBar label="Coleta do esgoto gerado" value={d.sanitation.sewerCollectionPct} />
            <MetricBar label="Tratamento do esgoto gerado" value={d.sanitation.sewerTreatmentOfGeneratedPct} />
            <MetricBar label="Do esgoto coletado, quanto é tratado" value={d.sanitation.collectedSewerTreatedPct} />
          </div>

          <SewerCurve />

          <div className="mt-5 rounded-3xl border border-white/8 bg-white/[0.018] p-4 light:border-slate-200 light:bg-slate-50/70" aria-label="Lacunas complementares de saneamento">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-200/80 light:text-amber-700">O que ainda fica fora da cobertura</div>
            <h4 className="mt-1 text-base font-black text-white light:text-slate-900">Complementos dos mesmos indicadores</h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">Cada valor é 100% menos a cobertura correspondente. As bases continuam separadas: acesso, serviço, coleta e tratamento não são o mesmo denominador.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['Sem acesso à água', 'water-access-gap-2024'],
                ['Fora do serviço público de esgoto', 'public-sewer-service-gap-2024'],
                ['Esgoto gerado sem coleta', 'sewer-collection-gap-2024'],
                ['Esgoto gerado sem tratamento', 'sewer-treatment-gap-2024'],
              ].map(([label, id]) => (
                <SanitationGapCard key={id} label={label} indicatorId={id} />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4 light:border-slate-200 light:bg-slate-50/70">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Outra definição, outro ano-base</div>
            <div className="mt-2 flex items-end gap-3">
              <strong className="text-2xl font-black text-white light:text-slate-900">{formatPercent(Number(d.indicators.find(item => item.id === 'adequate-sewerage')?.value ?? 0), 2)}</strong>
              <span className="text-xs leading-5 text-slate-500">esgotamento sanitário adequado · IBGE · {adequateSewerageYear}</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Este indicador usa outra classificação e outro ano-base. Leia-o separadamente dos percentuais SINISA {sanitationReferenceYear}.</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatTile value={formatPercent(d.sanitation.waterDistributionLossPct, 1)} label="perdas na distribuição de água" />
            <StatTile value={formatNumber(d.sanitation.waterConsumptionLitersPerPersonDay, 1) + ' L'} label="consumo por pessoa/dia" />
            <StatTile value={formatPercent(d.sanitation.householdWasteCollectionPct, 1)} label={'domicílios com coleta de resíduos · SINISA ' + wasteCollectionYear} />
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
              <StatTile value={formatNumber(d.health.openingReportedBeds)} label="referência reportada na inauguração" valueClassName="text-sm" labelClassName="mt-1 block" borderTone="subtle" />
              <StatTile value={formatNumber(currentStatedBeds)} label={formatNumber(d.health.currentStatedWardBeds) + ' enfermaria + ' + formatNumber(d.health.currentStatedIcuBeds) + ' UTI, explicitados no portal institucional'} valueClassName="text-sm" labelClassName="mt-1 block" borderTone="subtle" />
              <StatTile value={formatNumber(planningBeds)} label="planejamento registrado no dataset, não capacidade instalada" valueClassName="text-sm" labelClassName="mt-1 block" borderTone="subtle" />
            </div>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">As três referências têm naturezas diferentes: inauguração, capacidade explicitada no portal institucional e planejamento. O conjunto publicado não documenta, por si só, a causa da diferença entre {formatNumber(d.health.openingReportedBeds)} e {formatNumber(currentStatedBeds)}; não inferimos desativação, reclassificação ou redução de leitos sem fonte específica.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-4 light:border-slate-200">
              <div className="text-xs text-slate-500">Capacidade reportada na inauguração</div>
              <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatNumber(d.health.openingReportedBeds)}</div>
              <div className="text-xs text-slate-500">leitos</div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 light:border-slate-200">
              <div className="text-xs text-slate-500">Capacidade explicitada no portal institucional</div>
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
                    setPlannedBeds(value === 'opening' ? d.health.openingReportedBeds : value === 'current' ? currentStatedBeds : planningBeds);
                  }}
                  aria-label="Selecionar referência de leitos"
                >
                  <option value="opening">{formatNumber(d.health.openingReportedBeds)} · inauguração</option>
                  <option value="current">{formatNumber(currentStatedBeds)} · portal institucional</option>
                  <option value="planning">{formatNumber(planningBeds)} · planejamento publicado</option>
                  {bedReference === 'custom' && <option value="custom">{formatNumber(plannedBeds)} · cenário personalizado</option>}
                </select>
              </label>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{bedReference === 'custom' ? 'Cenário personalizado' : 'Referência ativa'}</span>
                <strong className="mt-1 block text-3xl font-black text-white light:text-slate-900">{formatNumber(plannedBeds)} leitos</strong>
              </div>
              <span className="text-right text-[11px] leading-5 text-slate-500">
                {formatNumber(d.health.openingReportedBeds)} = inauguração · {formatNumber(currentStatedBeds)} = capacidade explicitada no portal institucional · {formatNumber(planningBeds)} = planejamento registrado
              </span>
            </div>
            <input
              className="mt-4 w-full accent-sky-400"
              type="range"
              min={minimumBeds}
              max={maximumBeds}
              step={1}
              value={plannedBeds}
              onChange={event => {
                setPlannedBeds(Number(event.target.value));
                setBedReference('custom');
              }}
              aria-label="Simular quantidade de leitos"
              aria-valuemin={minimumBeds}
              aria-valuemax={maximumBeds}
              aria-valuenow={plannedBeds}
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Atendimentos/leito</span><strong className="mt-1 block text-lg text-white light:text-slate-900">{formatNumber(Math.round(pressure.attendancePerBed))}</strong></div>
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Variação teórica da pressão</span><strong className="mt-1 block text-lg text-white light:text-slate-900">{formatSigned(-pressure.reductionPct, 1)}%</strong><span className="mt-1 block text-[10px] leading-4 text-slate-500">negativo = menor pressão relativa; positivo = maior pressão relativa</span></div>
              <div className="rounded-2xl border border-white/10 p-3 light:border-slate-200"><span className="text-xs text-slate-500">Indicador derivado</span><strong className="mt-1 block text-lg text-white light:text-slate-900">atendimentos/leito</strong></div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatTile value={formatNumber(plannedBeds)} label={bedReference === 'custom' ? 'leitos no cenário simulado' : bedReference === 'planning' ? 'leitos no planejamento publicado' : 'leitos na referência selecionada'} />
            <StatTile value={formatSigned(plannedBeds - d.health.openingReportedBeds)} label="leitos vs. referência de inauguração" />
            <StatTile value={formatSigned(scenarioVsCurrent)} label="leitos vs. capacidade explicitada no portal institucional" />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <span>Variação da referência de inauguração → cenário selecionado</span>
              <strong className="text-white light:text-slate-900">{formatSigned(scenarioVsOpeningPct, 1)}%</strong>
            </div>
            <p className="mt-2">O cálculo acima usa a referência ou o cenário selecionado. Valores positivos indicam mais leitos que a referência de inauguração; valores negativos indicam menos. Quando o controle é ajustado manualmente, o valor passa a ser uma simulação do usuário e não um dado publicado.</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatTile value={'R$ ' + formatNumber(d.health.openingInvestmentBrl / 1_000_000, 0) + ' mi'} label="investimento reportado na inauguração" />
            <StatTile value={formatNumber(d.health.firstYearAttendancesAtLeast) + '+'} label="atendimentos no primeiro ano" />
          </div>
        </Card>
      </div>
    </section>
  );
}