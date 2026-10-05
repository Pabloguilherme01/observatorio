import { ArrowDown, ArrowRight, Wallet } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatBudgetCurrency, formatDate, formatPercent } from '../../utils/formatters';
import { formatIndicatorStatus } from '../../utils/dataLabels';
import { dispatchInspect } from '../../lib/dataInspectorEvents';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

export function BudgetImpact() {
  const source = d.sources.find(s => s.id === 'loa-2026');
  const health = d.budget.functions.find(x => x.id === 'saude-f')?.amountBrl ?? 0;
  const education = d.budget.functions.find(x => x.id === 'educacao-f')?.amountBrl ?? 0;
  const sanitation = d.budget.functions.find(x => x.id === 'saneamento-f')?.amountBrl ?? 0;
  const shownTotal = health + education + sanitation;
  const shownShare = d.budget.totalBrl ? (shownTotal / d.budget.totalBrl) * 100 : 0;
  const indicator = (id: string) => d.indicators.find(item => item.id === id);
  const indicatorValue = (id: string) => Number(indicator(id)?.value ?? 0);
  const rows = [
    ['Saúde', health, 'budget-health-share-2026', 'budget-health-per-capita-2026'],
    ['Educação', education, 'budget-education-share-2026', 'budget-education-per-capita-2026'],
    ['Saneamento', sanitation, 'budget-sanitation-share-2026', 'budget-sanitation-per-capita-2026'],
  ] as const;
  return (
    <section id="orcamento-impacto" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="orcamento-impacto-title">
      <SectionHeader titleId="orcamento-impacto-title" eyebrow="Onde vai o dinheiro?" title="Recorte do orçamento por função" description="O módulo conecta alocação e escala populacional sem concluir se um gasto é suficiente ou insuficiente." />
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          {rows.map(([label, amount, shareId, perCapitaId]) => {
            const shareIndicator = indicator(shareId);
            const perCapitaIndicator = indicator(perCapitaId);
            const share = Number(shareIndicator?.value ?? 0);
            const perCapita = Number(perCapitaIndicator?.value ?? 0);
            const sourceId = shareIndicator?.sourceId ?? perCapitaIndicator?.sourceId ?? d.budget.sourceId;
            const referenceDate = shareIndicator?.referenceDate ?? source?.referenceDate;
            return (
              <button
                key={label}
                type="button"
                className="metric-interactive rounded-2xl border border-white/8 p-4 text-left hover:border-sky-300/20 light:border-slate-200 light:bg-white"
                onClick={() => dispatchInspect({
                  label: `${label} na LOA 2026`,
                  value: formatBudgetCurrency(amount),
                  sourceId,
                  referenceDate,
                  status: shareIndicator?.status ?? 'derived',
                  note: shareIndicator?.note,
                  method: `Valor da função ${label} na LOA 2026. Participação: ${formatPercent(share, 1)} do total; razão por habitante: ${formatBudgetCurrency(perCapita)} usando a população estimada de 2026. Alocação não equivale a execução financeira.`,
                })}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Wallet className="h-4 w-4 text-sky-300" />{label}</div>
                <div className="mt-3 text-2xl font-black text-white light:text-slate-900">{formatBudgetCurrency(amount)}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="dashboard-meta-chip" data-kind={shareIndicator?.status ?? 'derived'}>{formatIndicatorStatus(shareIndicator?.status, 'Derivado')}</span>
                  {referenceDate && <span className="dashboard-meta-chip">ref. {formatDate(referenceDate)}</span>}
                  <span className="rounded-full border border-white/8 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 light:border-slate-200">{formatPercent(share, 1)} da LOA</span>
                  <span className="rounded-full border border-white/8 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 light:border-slate-200">{formatBudgetCurrency(perCapita)} por habitante</span>
                </div>
                <span className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-wide text-sky-300/80">Ver fonte e método</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.03] p-4 light:border-sky-200 light:bg-sky-50/70"><div className="text-xs font-bold uppercase tracking-wide text-slate-500">Quanto essas três funções representam</div><div className="mt-1 text-lg font-black text-white light:text-slate-900">{formatBudgetCurrency(shownTotal)}</div><p className="mt-1 text-xs leading-5 text-slate-500">As 3 funções exibidas representam {shownShare.toFixed(1).replace(".", ",")}% da LOA 2026 de {formatBudgetCurrency(d.budget.totalBrl)}. Não são o orçamento inteiro e não devem ser somadas a unidades ou órgãos.</p></div><div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-white/8 px-3 py-1.5">LOA total</span><ArrowRight className="h-4 w-4" aria-hidden="true" /><span className="rounded-full border border-white/8 px-3 py-1.5">função orçamentária</span><ArrowDown className="h-4 w-4" aria-hidden="true" /><span className="rounded-full border border-white/8 px-3 py-1.5">participação e valor por habitante</span>
        </div>
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-white"><div className="font-bold text-slate-400 light:text-slate-700">Fonte e método</div><p className="mt-1">{source?.label ?? 'Fonte registrada no dataset'} · referência {source?.referenceDate ? formatDate(source.referenceDate) : 'não informada'}. Cálculo per capita: valor da função ÷ população estimada de 2026. Alocação orçamentária não é execução financeira nem mede, isoladamente, resultado do serviço.</p>{source?.url && <a className="mt-2 inline-flex min-h-11 items-center font-semibold text-sky-300 underline decoration-sky-300/30 underline-offset-4" href={source.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir fonte oficial do orçamento em nova aba">Abrir fonte oficial</a>}</div>
      </Card>
    </section>
  );
}
