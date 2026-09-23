import { CalendarClock, CircleAlert, ShieldAlert } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import { Badge } from '../ui/Badge';

function Timer({ value, completedLabel = 'Encerrado' }: { value: ReturnType<typeof useCountdown>; completedLabel?: string }) {
  if (value.completed) return <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center text-sm font-semibold text-slate-300">{completedLabel}</div>;
  return (
    <div className="grid grid-cols-4 gap-2 text-center" aria-live="polite">
      {[
        ['Dias', value.days],
        ['Horas', value.hours],
        ['Min', value.minutes],
        ['Seg', value.seconds],
      ].map(([label, amount]) => (
        <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3">
          <div className="text-xl font-bold tabular-nums text-white">{String(amount).padStart(2, '0')}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
        </div>
      ))}
    </div>
  );
}

export function HeroCountdown() {
  const election = useCountdown('2026-10-04T08:00:00-03:00');
  const radar = useCountdown('2026-09-23T00:00:00-03:00');

  return (
    <section className="relative overflow-hidden border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="hero-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge>V22 • React</Badge>
          <Badge>Dados públicos</Badge>
          <Badge>Fontes rastreáveis</Badge>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">Observatório Eleitoral</p>
            <h1 id="hero-title" className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
              Águas Lindas de Goiás <span className="text-slate-400">2026</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Dados eleitorais, demográficos, saúde, saneamento, orçamento e mobilidade,
              com indicação da fonte, período e natureza de cada informação.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#dashboard" className="rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-200">Explorar dados</a>
              <a href="#fontes" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5">Ver fontes</a>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <CalendarClock className="h-4 w-4 text-sky-400" aria-hidden="true" />
                1º turno · 04/10 · 08:00
              </div>
              <Timer value={election} />
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-200">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                Marco editorial · 23/09
              </div>
              <Timer value={radar} />
              <p className="mt-2 flex gap-1.5 text-xs leading-5 text-slate-400">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Marcador editorial. Não substitui os prazos jurídicos oficiais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
