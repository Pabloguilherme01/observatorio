import { Activity, CalendarClock, CircleHelp, ExternalLink, Wallet } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ExecutiveSummary() {
  const poll = d.polls[0];
  const groupedUnknown = (poll.nonePct ?? 0) + (poll.notSurePct ?? 0);
  const monthlyPerPerson = d.transport.routes.find(route => route.id === 'brasilia')!.fareBrl
    * d.transport.defaultTripsPerDay
    * d.transport.defaultWorkDaysPerMonth;
  const source = d.sources.find(sourceItem => sourceItem.id === 'tse-pesquisas-2026');
  const population = d.populationSeries.find(point => point.year === 2026);
  const electorate = d.electoral;

  return (
    <section
      id="resumo"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6"
      aria-labelledby="executive-summary-title"
    >
      <div className="rounded-[28px] border border-sky-300/15 bg-sky-300/[0.035] p-5 shadow-[0_18px_70px_rgba(0,0,0,.16)] sm:p-7">
        <SectionHeader
          titleId="executive-summary-title"
          eyebrow="Comece aqui"
          title="Resumo de leitura"
          description="Quatro pontos para entender o painel antes de entrar nos detalhes. Os números preservam a data de referência e a natureza do dado."
        />

        <div className="grid gap-3 lg:grid-cols-[1.35fr_.65fr]">
          <Card className="border-sky-300/15 bg-slate-950/20 light:bg-white">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Pesquisa registrada</div>
                <div className="mt-2 text-3xl font-black text-white light:text-slate-900">
                  {groupedUnknown.toFixed(2).replace('.', ',')}%
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300 light:text-slate-600">
                  soma das respostas “Nenhum” e “Não sabe/NR” na coleta de {formatDate(poll.collectionDate)}.
                  É uma combinação de categorias da pesquisa, não uma classificação adicional de “indecisos”.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll.interviews} entrevistas</span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll.registrationNumber}</span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 light:border-slate-200">{poll.pollster}</span>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.04] px-2.5 py-1 text-amber-200 light:border-amber-300/50 light:bg-amber-50 light:text-amber-800">divulgação com cautela</span>
                </div>
                {source?.url && (
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200">
                    Ver catálogo oficial das pesquisas <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                <CalendarClock className="h-4 w-4 text-sky-300" aria-hidden="true" />
                Eleitorado
              </div>
              <div className="mt-2 text-2xl font-black text-white light:text-slate-900">{electorate.electorate.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-slate-500">snapshot TSE · referência {electorate.snapshotDate.split('-').reverse().join('/')}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                <Wallet className="h-4 w-4 text-sky-300" aria-hidden="true" />
                Mobilidade
              </div>
              <div className="mt-2 text-2xl font-black text-white light:text-slate-900">{brl(monthlyPerPerson)}</div>
              <div className="text-xs text-slate-500">por pessoa/mês · Brasília · 22 dias · 2 trechos/dia</div>
            </Card>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Card className="p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Leitura 1</div>
            <p className="mt-2 text-sm leading-6 text-slate-300 light:text-slate-600">
              Comece pelos valores com data clara. “Atual” e “histórico” não são a mesma coisa.
            </p>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Leitura 2</div>
            <p className="mt-2 text-sm leading-6 text-slate-300 light:text-slate-600">
              Use os simuladores para testar cenários. O resultado calculado não vira automaticamente um fato observado.
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-2">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <p className="text-sm leading-6 text-slate-300 light:text-slate-600">
                Atualização local do conjunto: <strong className="text-white light:text-slate-900">{formatDate(d.meta.updatedAt)}</strong>.
                População estimada: {population?.value.toLocaleString('pt-BR') ?? '—'} em {population ? population.referenceDate.split('-').reverse().join('/') : '—'}. A apuração eleitoral ao vivo é uma camada distinta e deve usar a distribuição oficial do TSE.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
