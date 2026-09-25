import { Activity, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { observatorioData as d } from '../../data/observatorioData';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function PoliticalResearch() {
  const { mode } = useLanguageMode();
  const poll = d.polls[0];
  const pollSource = d.sources.find(source => source.id === 'tse-pesquisas-2026');

  return (
    <section id="politica" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="research-title">
      <div id="pesquisas" className="scroll-mt-24" aria-hidden="true" />
      <SectionHeader
        titleId="research-title"
        eyebrow="Pesquisas eleitorais"
        title={mode === 'technical' ? 'Pesquisa registrada' : 'Pesquisa eleitoral documentada'}
        description="O observatório mostra o snapshot registrado disponível, preserva as categorias publicadas e não transforma um único levantamento em tendência."
      />

      {!poll ? (
        <Card>
          <p className="text-sm text-slate-500">Nenhuma pesquisa registrada disponível no snapshot atual.</p>
        </Card>
      ) : (
        <Card>
          <div className="flex items-start gap-3">
            <Activity className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
            <div className="min-w-0 w-full">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Pesquisas registradas · 1 snapshot</div>
              <h3 className="mt-1 text-lg font-black text-white light:text-slate-900">{poll.pollster}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {poll.collectionDate} · {poll.interviews} entrevistas · {poll.method === 'spontaneous' ? 'pergunta espontânea' : poll.method} · registro {poll.registrationNumber}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {poll.results.map(result => (
                  <div key={result.label} className="rounded-xl border border-white/8 p-3">
                    <div className="text-[11px] leading-4 text-slate-500">{result.label}</div>
                    <strong className="mt-1 block text-xl text-white light:text-slate-900">{result.percentage.toFixed(2).replace('.', ',')}%</strong>
                  </div>
                ))}
              </div>

              {mode !== 'summary' && (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/8 p-3"><strong className="block text-white">{poll.nonePct?.toFixed(2).replace('.', ',')}%</strong><span className="text-[11px] text-slate-500">Nenhum</span></div>
                  <div className="rounded-xl border border-white/8 p-3"><strong className="block text-white">{poll.notSurePct?.toFixed(2).replace('.', ',')}%</strong><span className="text-[11px] text-slate-500">NS/NR</span></div>
                  <div className="rounded-xl border border-white/8 p-3"><strong className="block text-white">{poll.unclassifiedPct?.toFixed(2).replace('.', ',')}%</strong><span className="text-[11px] text-slate-500">Não classificado</span></div>
                  <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.03] p-3 sm:col-span-3">
                    <strong className="block text-amber-100">Margem registrada</strong>
                    <span className="text-[11px] text-slate-500">{poll.theoreticalMarginErrorPct != null ? poll.theoreticalMarginErrorPct.toFixed(1).replace('.', ',') + '%' : 'não informada'}</span>
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Este conjunto contém um único snapshot. Ele não é uma série temporal e não sustenta inferência de tendência. O observatório preserva as categorias publicadas sem completar a distribuição por inferência.
              </p>
              {poll.judicialContext && <p className="mt-2 text-xs leading-5 text-amber-100/80">Contexto documental: {poll.judicialContext.summary}</p>}
              {pollSource?.url && (
                <a href={pollSource.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-xs font-bold text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60">
                  Conferir fonte oficial <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}
