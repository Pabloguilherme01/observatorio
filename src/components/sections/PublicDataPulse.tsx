import { CalendarClock, ExternalLink, RefreshCw } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

export function PublicDataPulse() {
  const updates = [...d.budgetUpdates].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  return (
    <section id="dados" className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="dados-title">
      <SectionHeader
        titleId="dados-title"
        eyebrow="Atualizações públicas"
        title="O que mudou"
        description="Registros novos ou alterados no conjunto publicado. Cada item mantém sua data e fonte para conferência."
      />
      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-sky-300/10 bg-sky-300/[0.05] text-sky-300">
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-black text-white light:text-slate-900">Estado da publicação</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Última atualização do conjunto principal: <strong className="text-slate-300 light:text-slate-700">{d.meta.updatedAt.split('-').reverse().join('/')}</strong>.
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Este bloco mostra mudanças recentes; indicadores, séries e metodologias permanecem nas seções temáticas.
              </p>
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
                  <article key={update.law} className="rounded-2xl border border-white/8 bg-white/[0.018] p-3">
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
