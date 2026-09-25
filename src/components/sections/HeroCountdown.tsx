import { ArrowRight, CalendarClock, Database, ExternalLink } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { useCountdown } from '../../hooks/useCountdown';
import { EDITION } from '../../config/version';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { useLanguageMode } from '../../context/LanguageModeContext';

function Timer({ value, completedLabel = 'Encerrado' }: { value: ReturnType<typeof useCountdown>; completedLabel?: string }) {
  if (value.completed) return <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center text-sm font-semibold text-slate-300" role="status">{completedLabel}</div>;
  const milestoneLabel = value.days > 0 ? `Faltam ${value.days} dias.` : 'Falta menos de um dia.';
  return <div className="grid grid-cols-4 gap-2 text-center" role="timer" aria-label="Contagem regressiva, atualizada visualmente">
    {[['Dias', value.days], ['Horas', value.hours], ['Min', value.minutes], ['Seg', value.seconds]].map(([label, amount]) => (
      <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3">
        <div className="text-xl font-bold tabular-nums text-white">{String(amount).padStart(2, '0')}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      </div>
    ))}
    <span className="sr-only" aria-live="polite" aria-atomic="true">{milestoneLabel}</span>
  </div>;
}

export function HeroCountdown() {
  const election = useCountdown('2026-10-04T08:00:00-03:00');
  const secondRound = useCountdown('2026-10-25T08:00:00-03:00');
  const updatedAt = formatDate(d.meta.updatedAt);
  const { mode: languageMode } = useLanguageMode();

  return <section className="hero-shell relative overflow-hidden border-b border-white/10 px-4 py-8 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="hero-title">
    <div className="mx-auto max-w-7xl">
      <div className="hero-badges mb-4 flex flex-wrap gap-2">
        {languageMode === 'simple' ? (
          <Badge>Dados públicos · fontes rastreáveis</Badge>
        ) : (
          <>
            <Badge>{EDITION} · dados + método</Badge>
            <Badge>Dados públicos</Badge>
            <Badge>Fontes rastreáveis</Badge>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">Observatório Eleitoral</p>
          <h1 id="hero-title" className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
            Águas Lindas de Goiás <span className="text-slate-400">2026</span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            {languageMode === 'simple'
              ? 'Principais números da cidade, com a fonte de cada dado.'
              : 'Dados públicos de Águas Lindas, organizados para leitura rápida e conferência.'}
          </p>

          <details className="hero-reading-guide mt-3 max-w-3xl rounded-xl border border-white/10 bg-white/[0.025]">
            <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-slate-300 focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-2">
              Como usar este painel
            </summary>
            <div className="border-t border-white/10 px-3 py-2.5 text-xs leading-5 text-slate-500">
              {languageMode === 'simple'
                ? 'Cada informação apresenta sua fonte e contexto para facilitar a conferência.'
                : 'Veja o número, confira a fonte e consulte o contexto quando precisar.'}
            </div>
          </details>

          <div className="mt-4 flex flex-wrap gap-2">
            <a href="#descubra" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.08] px-4 py-2.5 text-sm font-bold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-300/[0.13] focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-2">
              Explorar <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#evidencias" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-sky-300/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-2">
              Conferir fontes
            </a>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-600" aria-label="Atualização do conjunto de dados">
            {languageMode === 'simple' ? (
              <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> Atualizado em {updatedAt}</span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> Dados locais atualizados em {updatedAt}.</span>
                <span>Informação pública · fontes visíveis.</span>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><CalendarClock className="h-4 w-4 text-sky-400" aria-hidden="true" />1º turno · 04/10 · 08:00</div>
            <Timer value={election} />
          </div>
          <div className="hero-secondary-round rounded-2xl border border-white/8 bg-white/[0.02] p-3 opacity-80">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">Se houver</span>
              <CalendarClock className="h-4 w-4 text-sky-400" aria-hidden="true" />
              2º turno · 25/10
            </div>
            <Timer value={secondRound} />
            <a href="https://www.tse.jus.br/eleicoes/eleicoes-2026" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-sky-300 focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-2">
              Calendário oficial do TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-500" aria-label="Referências rápidas dos dados">
        <span>População · Fonte: IBGE · estimativa 2026</span>
        <span>Eleitorado · Fonte: TSE · snapshot 2026</span>
        <span>Transporte · tarifa semiurbana · Entorno-DF</span>
      </div>
    </div>
  </section>;
}
