import { ArrowRight, CalendarClock, Command, ExternalLink, Sparkles } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import { Badge } from '../ui/Badge';

function Timer({ value, completedLabel = 'Encerrado' }: { value: ReturnType<typeof useCountdown>; completedLabel?: string }) {
  if (value.completed) return <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center text-sm font-semibold text-slate-300" role="status">{completedLabel}</div>;
  return <div className="grid grid-cols-4 gap-2 text-center" role="timer" aria-live="off">
    {[['Dias', value.days], ['Horas', value.hours], ['Min', value.minutes], ['Seg', value.seconds]].map(([label, amount]) => (
      <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3">
        <div className="text-xl font-bold tabular-nums text-white">{String(amount).padStart(2, '0')}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      </div>
    ))}
  </div>;
}

export function HeroCountdown() {
  const election = useCountdown('2026-10-04T08:00:00-03:00');
  const secondRound = useCountdown('2026-10-25T08:00:00-03:00');

  return <section className="relative overflow-hidden border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="hero-title">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge>V29 • experiência interativa</Badge>
        <Badge>Dados públicos</Badge>
        <Badge>Fontes rastreáveis</Badge>
        <Badge>Sem ranking automático</Badge>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.18fr_.82fr] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-sky-400">Observatório Eleitoral</p>
          <h1 id="hero-title" className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
            Águas Lindas de Goiás <span className="text-slate-400">2026</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore dados eleitorais, demográficos, saúde, saneamento, orçamento e mobilidade por caminhos interativos, sempre com fonte, período e natureza identificados.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <a href="#dashboard" className="inline-flex items-center gap-2 rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-200">
              Começar exploração <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5">
              <Command className="h-4 w-4" aria-hidden="true" /> Central de comandos
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> Explore · compare · verifique</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><CalendarClock className="h-4 w-4 text-sky-400" aria-hidden="true" />1º turno · 04/10 · 08:00</div>
            <Timer value={election} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><CalendarClock className="h-4 w-4 text-sky-400" aria-hidden="true" />2º turno · 25/10 · se houver</div>
            <Timer value={secondRound} />
            <a href="https://www.tse.jus.br/eleicoes/eleicoes-2026" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-sky-300">Calendário oficial do TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
