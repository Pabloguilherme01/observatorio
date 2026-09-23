import { ArrowDown, ArrowRight, Wallet } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatBRL } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { MethodologyFooter } from '../MethodologyFooter';

export function BudgetImpact() {
  const source = d.sources.find(s => s.id === 'loa-2026')!;
  const population = Number(d.indicators.find(i => i.id === 'population-2026')?.value ?? 0);
  const health = d.budget.functions.find(x => x.id === 'saude-f')?.amountBrl ?? 0;
  const education = d.budget.functions.find(x => x.id === 'educacao-f')?.amountBrl ?? 0;
  const sanitation = d.budget.functions.find(x => x.id === 'saneamento-f')?.amountBrl ?? 0;
  const rows = [
    ['Saúde', health],
    ['Educação', education],
    ['Saneamento', sanitation],
  ] as const;
  return (
    <section id="orcamento-impacto" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="orcamento-impacto-title">
      <SectionHeader titleId="orcamento-impacto-title" eyebrow="Onde vai o dinheiro?" title="Orçamento com denominadores preservados" description="O módulo conecta alocação e escala populacional sem concluir se um gasto é suficiente ou insuficiente." />
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          {rows.map(([label, amount]) => (
            <div key={label} className="rounded-2xl border border-white/8 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Wallet className="h-4 w-4 text-sky-300" />{label}</div>
              <div className="mt-3 text-2xl font-black text-white">{formatBRL(amount)}</div>
              <div className="mt-1 text-xs text-slate-500">{formatBRL(amount / population)} por habitante, usando população estimada de 2026</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-white/8 px-3 py-1.5">Receita/Despesa → Função</span><ArrowRight className="h-4 w-4" aria-hidden="true" /><span className="rounded-full border border-white/8 px-3 py-1.5">Função → denominador</span><ArrowDown className="h-4 w-4" aria-hidden="true" /><span className="rounded-full border border-white/8 px-3 py-1.5">interpretação pelo leitor</span>
        </div>
        <MethodologyFooter source={source} denominator="população estimada de 2026 para o cálculo per capita" formula="valor da função ÷ população 2026" limitations="Alocação orçamentária não é execução financeira nem mede, isoladamente, resultado do serviço." />
      </Card>
    </section>
  );
}
