import { Landmark, TrendingUp } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { dispatchInspect, inspectDataId } from '../DataInspector';
import { formatBudgetCurrency, formatDate, formatPercent } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { PremiumInfoCard } from '../ui/PremiumInfoCard';

export function BudgetSection() {
  const rows = [...d.budget.functions].sort((a,b) => b.amountBrl-a.amountBrl);
  const budgetLabel = `LOA ${d.budget.year}`;
  const budgetIndicator = d.indicators.find(item => item.id === 'budget');
  const budgetSource = d.sources.find(source => source.id === d.budget.sourceId);
  const budgetReferenceDate = budgetIndicator?.referenceDate ?? budgetSource?.referenceDate;
  const fiscalReferenceYear = d.indicators.find(item => item.id === 'revenue-per-capita-2025')?.referenceDate?.slice(0, 4) ?? '2025';
  const perCapitaRows = [
    ['Receitas realizadas por habitante', 'revenue-per-capita-2025', `Receitas brutas realizadas ÷ população estimada de ${fiscalReferenceYear}.`],
    ['Despesas empenhadas por habitante', 'expenses-per-capita-2025', `Despesas brutas empenhadas ÷ população estimada de ${fiscalReferenceYear}. Empenho não equivale necessariamente a pagamento.`],
    ['Diferença por habitante', 'revenue-expense-difference-per-capita-2025', `Receitas realizadas − despesas empenhadas, divididas pela população estimada de ${fiscalReferenceYear}. Não equivale automaticamente a superávit fiscal.`],
  ] as const;
  return <section id="orcamento" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="orcamento-title">
    <SectionHeader titleId="orcamento-title" eyebrow="Orçamento" title={budgetLabel + ': total, funções e alterações'} description="O total legal abre a leitura; abaixo, a distribuição por função, os valores por habitante e as alterações legislativas aparecem em camadas separadas." action={<div className="flex items-center gap-2 text-xs text-slate-500"><Landmark className="h-4 w-4" />{formatBudgetCurrency(d.budget.totalBrl)}</div>} />
    <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <button type="button" data-inspect-id={inspectDataId({ label: budgetLabel, sourceId: d.budget.sourceId })} onClick={() => dispatchInspect({ label: budgetLabel, value: formatBudgetCurrency(d.budget.totalBrl), sourceId: d.budget.sourceId, status: budgetIndicator?.status ?? 'planned', referenceDate: budgetReferenceDate, note: `Total legal da Lei Orçamentária Anual de ${d.budget.year}; valor planejado/autorizado, não execução.` })} className="text-left"><Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Orçamento total</div><div className="mt-3 text-4xl font-black text-white">{formatBudgetCurrency(d.budget.totalBrl)}</div><div className="dashboard-card-meta mt-3"><span className="dashboard-meta-chip" data-kind={budgetIndicator?.status}>Planejado</span>{budgetReferenceDate && <span className="dashboard-meta-chip">ref. {formatDate(budgetReferenceDate)}</span>}</div><div className="mt-2 text-xs leading-5 text-slate-500">Valor autorizado na LOA; não representa execução nem pagamento realizado.</div><div className="mt-5 flex items-center gap-2 text-xs font-bold text-sky-300"><TrendingUp className="h-4 w-4" /> distribuição por função abaixo</div></Card></button>
      <Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Alteração legislativa registrada</div>{d.budgetUpdates.map(update => <button key={update.law} type="button" data-inspect-id={inspectDataId({ label: update.title, sourceId: update.sourceId })} onClick={() => dispatchInspect({ label: update.title, value: formatBudgetCurrency(update.amountBrl), sourceId: update.sourceId, referenceDate: update.date, status: 'alteração legislativa', note: update.description })} className="mt-3 w-full rounded-2xl border border-white/8 p-4 text-left"><div className="flex items-center justify-between gap-3"><strong className="text-white">{update.law}</strong><span className="text-xs font-bold text-sky-300">{formatBudgetCurrency(update.amountBrl)}</span></div><div className="mt-1 text-sm text-slate-400">{update.title}</div><p className="mt-2 text-xs leading-5 text-slate-500">{update.description}</p></button>)}</Card>
    </div>
    <div className="mt-4 rounded-3xl border border-white/8 bg-white/[0.018] p-4 light:border-slate-200 light:bg-slate-50/70 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300/80 light:text-sky-700">Escala por habitante · {fiscalReferenceYear}</div>
          <h3 className="mt-1 text-base font-black text-white light:text-slate-900">Receitas e despesas na mesma base populacional</h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">As três razões usam a população estimada de {fiscalReferenceYear}. Servem para dar escala aos totais, não para atribuir receita ou despesa individual a cada morador.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {perCapitaRows.map(([label, indicatorId, method]) => {
          const indicator = d.indicators.find(item => item.id === indicatorId);
          const value = Number(indicator?.value ?? 0);
          return (
            <button
              key={indicatorId}
              type="button"
              data-inspect-id={inspectDataId({ label, sourceId: indicator?.sourceId })}
              onClick={() => dispatchInspect({ label, value: formatBudgetCurrency(value), sourceId: indicator?.sourceId, referenceDate: indicator?.referenceDate, status: indicator?.status, note: indicator?.note, method })}
              className="metric-interactive dashboard-secondary-card rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-sky-300/20 light:bg-white"
            >
              <div className="text-xs font-semibold text-slate-500">{label}</div>
              <div className="mt-2 text-2xl font-black text-white light:text-slate-900">{formatBudgetCurrency(value)}</div>
              <div className="mt-1 text-[11px] leading-5 text-slate-500">por habitante · base populacional {fiscalReferenceYear}</div>
              <div className="dashboard-card-meta mt-3">
                <span className="dashboard-meta-chip" data-kind={indicator?.status}>Derivado</span>
                {indicator?.referenceDate && <span className="dashboard-meta-chip">ref. {formatDate(indicator.referenceDate)}</span>}
              </div>
              <div className="dashboard-card-action mt-3">Ver fonte e fórmula</div>
            </button>
          );
        })}
      </div>
    </div>

    <Card className="mt-4">
      <div className="space-y-4">{rows.map(row => { const pct = (row.amountBrl / d.budget.totalBrl) * 100; return <button key={row.id} type="button" data-inspect-id={inspectDataId({ label: 'LOA · ' + row.name, sourceId: row.sourceId })} onClick={() => dispatchInspect({ label: 'LOA · ' + row.name, value: formatBudgetCurrency(row.amountBrl), sourceId: row.sourceId, status: budgetIndicator?.status ?? 'planned', referenceDate: budgetReferenceDate, note: 'Percentual derivado do total legal da LOA; funções não devem ser somadas como se fossem unidades independentes em todos os níveis.' })} className="grid w-full grid-cols-[1fr_auto] gap-3 text-left"><div><div className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-300">{row.name}</span><strong className="text-white">{formatBudgetCurrency(row.amountBrl)}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-sky-300" style={{ width: Math.min(100,pct) + '%' }} /></div></div><div className="pt-0.5 text-right text-xs text-slate-500">{formatPercent(pct,1)}</div></button>})}</div>
      <PremiumInfoCard compact tone="violet" icon={Landmark} eyebrow="Como ler" title="Camadas orçamentárias não são somadas entre si" className="mt-5">
        O total legal, as funções e a alteração legislativa representam níveis diferentes de leitura. O observatório mantém essas camadas separadas para evitar dupla contagem.
      </PremiumInfoCard>
    </Card>
  </section>;
}
