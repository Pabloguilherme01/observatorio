import { Landmark } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

export function BudgetSection() {
  return <section id="orcamento" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="orcamento-title">
    <SectionHeader eyebrow="Orçamento" title="LOA 2026: leitura por função" description="Percentuais abaixo são derivados do total legal da LOA; as funções não devem ser somadas como se fossem unidades independentes em todos os níveis." action={<div className="flex items-center gap-2 text-xs text-slate-500"><Landmark className="h-4 w-4" />{formatCurrency(d.budget.totalBrl)}</div>} />
    <Card><div className="space-y-4">{[...d.budget.functions].sort((a,b) => b.amountBrl-a.amountBrl).map(row => { const pct = (row.amountBrl / d.budget.totalBrl) * 100; return <div key={row.id} className="grid grid-cols-[1fr_auto] gap-3"><div><div className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-300">{row.name}</span><strong className="text-white">{formatCurrency(row.amountBrl)}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-sky-300" style={{ width: `${Math.min(100,pct)}%` }} /></div></div><div className="pt-0.5 text-right text-xs text-slate-500">{formatPercent(pct,1)}</div></div>})}</div></Card>
  </section>;
}