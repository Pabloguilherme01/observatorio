import { CalendarClock, Database, ExternalLink, RefreshCw } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

export function PublicDataPulse() {
  const updates = [...d.budgetUpdates].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const sourceCount = d.sources.length;
  const indicatorCount = d.indicators.length;
  const datedSources = d.sources.filter(source => source.referenceDate || source.publishedAt).length;
  const datedSourceCoverage = sourceCount ? (datedSources / sourceCount) * 100 : 0;
  const datedIndicators = d.indicators.filter(item => item.referenceDate || d.sources.find(source => source.id === item.sourceId)?.referenceDate).length;
  const indicatorDateCoverage = indicatorCount ? (datedIndicators / indicatorCount) * 100 : 0;
  const indicatorsWithNotes = d.indicators.filter(item => Boolean(item.note?.trim())).length;
  const methodologicalCoverage = indicatorCount ? (indicatorsWithNotes / indicatorCount) * 100 : 0;
  const indicatorStatus = d.indicators.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusSummary = [
    ['Atual', indicatorStatus.current ?? 0],
    ['Histórico', indicatorStatus.historical ?? 0],
    ['Derivado', indicatorStatus.derived ?? 0],
    ['Registro datado', indicatorStatus.snapshot ?? 0],
    ['Planejado', indicatorStatus.planned ?? 0],
  ].filter(([, count]) => Number(count) > 0) as Array<[string, number]>;
  return (
    <section id="dados" className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="dados-title">
      <SectionHeader
        titleId="dados-title"
        eyebrow="Atualizações públicas"
        title="Pulso do conjunto publicado"
        description="Um retrato da documentação disponível e das atualizações recentes. A qualidade detalhada fica concentrada no painel de rastreabilidade."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Resumo do conjunto de dados">
        <DataStat label="Indicadores publicados" value={indicatorCount} hint="itens rastreáveis no catálogo" />
        <DataStat label="Fontes registradas" value={sourceCount} hint={datedSources + ' com data registrada'} />
        <DataStat label="Cobertura temporal das fontes" value={datedSourceCoverage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'} hint={datedSources + ' de ' + sourceCount + ' fontes com referência ou publicação datada'} />
        <DataStat label="Indicadores com data de referência" value={indicatorDateCoverage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'} hint={datedIndicators + ' de ' + indicatorCount + ' indicadores com referência temporal disponível'} />
        <DataStat label="Indicadores com nota metodológica" value={indicatorsWithNotes} hint={methodologicalCoverage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '% do catálogo'} />
        <DataStat label="Fontes com data registrada" value={datedSources} hint="apoio para conferir atualidade e contexto" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-sky-300/10 bg-sky-300/[0.05] text-sky-300">
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-black text-white light:text-slate-900">Estado da publicação</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Última atualização do conjunto principal: <strong className="text-slate-300 light:text-slate-700">{d.meta.updatedAt.split('-').reverse().join('/')}</strong>. Esta data informa a publicação do painel; cada indicador mantém sua própria referência temporal.
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Este bloco resume a publicação sem duplicar o painel de qualidade: aqui você vê volume, documentação e mudanças recentes; nas seções temáticas ficam valores, séries e métodos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Tipos de indicador publicados">
                {statusSummary.map(([label, count]) => (
                  <span key={label} className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] font-bold text-slate-500 light:border-slate-200">
                    {label}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <div>
              <h3 className="text-base font-black text-white light:text-slate-900">Registros orçamentários recentes</h3>
              <p className="text-xs text-slate-500">Apenas novidades, sem repetir o painel de orçamento.</p>
            </div>
          </div>
          {updates.length ? (
            <div className="mt-4 space-y-3">
              {updates.map(update => {
                const sourceUrl = d.sources.find(source => source.id === update.sourceId)?.url;
                return (
                  <article key={update.law} className="rounded-2xl border border-white/8 bg-white/[0.018] p-3 light:border-slate-200 light:bg-slate-50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-sm text-white light:text-slate-900">{update.title}</strong>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{update.date.split('-').reverse().join('/')}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{update.law} · {update.description}</p>
                    {sourceUrl && (
                      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-[11px] font-bold text-sky-300">
                        Abrir fonte <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Nenhuma atualização recente registrada.</p>
          )}
        </Card>
      </div>
    </section>
  );
}

function DataStat({ label, value, hint }: { readonly label: string; readonly value: number | string; readonly hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <Database className="h-4 w-4 text-sky-300" aria-hidden="true" />
      <strong className="mt-2 block text-2xl font-black text-white light:text-slate-900">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</strong>
      <span className="text-xs font-semibold text-slate-400 light:text-slate-600">{label}</span>
      {hint && <span className="mt-1 block text-[10px] leading-4 text-slate-600 light:text-slate-500">{hint}</span>}
    </div>
  );
}
