import { ArrowRight, CalendarClock, Database, ExternalLink, Vote } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { useCountdown } from '../../hooks/useCountdown';
import { useEffect, useState } from 'react';
import { EDITION } from '../../config/version';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { useLanguageMode } from '../../context/LanguageModeContext';

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

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 1 });
}

export function HeroCountdown() {
  const election = useCountdown('2026-10-04T08:00:00-03:00');
  const secondRound = useCountdown('2026-10-25T08:00:00-03:00');
  const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
  const electorate = d.electoral.electorate;
  const loa = d.budget.totalBrl;
  const updatedAt = formatDate(d.meta.updatedAt);
  const { mode: languageMode, setMode: setLanguageMode } = useLanguageMode();
  const [electionMode, setElectionMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('observatorio-v43-election-mode') === '1'
        || document.documentElement.classList.contains('mode-election');
    } catch {
      return document.documentElement.classList.contains('mode-election');
    }
  });

  useEffect(() => {
    const onElectionModeChanged = (event: Event) => {
      setElectionMode(Boolean((event as CustomEvent<boolean>).detail));
    };
    window.addEventListener('observatorio:election-mode-changed', onElectionModeChanged);
    return () => window.removeEventListener('observatorio:election-mode-changed', onElectionModeChanged);
  }, []);

  const toggleElectionMode = () => {
    window.dispatchEvent(new CustomEvent('observatorio:election-mode', { detail: !electionMode }));
  };

  return <section className="hero-shell relative overflow-hidden border-b border-white/10 px-4 py-10 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="hero-title">
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

      <div className="grid gap-7 lg:grid-cols-[1.12fr_.88fr] lg:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-400">Observatório Eleitoral</p>
          <h1 id="hero-title" className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
            Águas Lindas de Goiás <span className="text-slate-400">2026</span>
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            {languageMode === 'simple'
              ? 'Veja os principais números da cidade e confira a fonte de cada um.'
              : 'Um painel público para ler dados eleitorais e municipais com período, fonte, natureza do dado e limitações visíveis na própria interface.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <a href="#descubra" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-200">
              {languageMode === 'simple' ? 'Começar' : 'Escolher um assunto'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#evidencias" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5">
              {languageMode === 'simple' ? 'Conferir fontes' : 'Ver evidências'}
            </a>
          </div>


          <div className="election-mode-actions sr-only" aria-hidden="true">Modo Eleição · acesso rápido</div>
          <div className="hero-kpis mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Indicadores de referência da edição">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 light:border-slate-200 light:bg-slate-50/70">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">População 2026</div>
              <div className="mt-1 text-lg font-black text-white light:text-slate-900">{population.toLocaleString('pt-BR')}</div>
              <div className="mt-1 text-[11px] text-slate-600">{languageMode === 'simple' ? 'habitantes estimados' : 'estimativa IBGE'}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 light:border-slate-200 light:bg-slate-50/70">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Eleitorado 2026</div>
              <div className="mt-1 text-lg font-black text-white light:text-slate-900">{electorate.toLocaleString('pt-BR')}</div>
              <div className="mt-1 text-[11px] text-slate-600">{languageMode === 'simple' ? 'foto do eleitorado' : 'snapshot local'}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 light:border-slate-200 light:bg-slate-50/70">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">LOA 2026</div>
              <div className="mt-1 text-lg font-black text-white light:text-slate-900">{brl(loa)}</div>
              <div className="mt-1 text-[11px] text-slate-600">{languageMode === 'simple' ? 'orçamento previsto' : 'orçamento total informado'}</div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-600" aria-label="Atualização do conjunto de dados">
            {languageMode === 'simple' ? (
              <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> Atualizado em {updatedAt}</span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> Dados locais atualizados em {updatedAt}.</span>
                <span>Conteúdo informativo · sem ranking automático.</span>
              </>
            )}
          </div>

        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><CalendarClock className="h-4 w-4 text-sky-400" aria-hidden="true" />1º turno · 04/10 · 08:00</div>
            <Timer value={election} />
            <div className="hero-second-round-note mt-2 hidden text-xs font-semibold text-slate-500">2º turno: 25/10, se houver.</div>
          </div>
          <div className="hero-secondary-round rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><CalendarClock className="h-4 w-4 text-sky-400" aria-hidden="true" />2º turno · 25/10 · se houver</div>
            <Timer value={secondRound} />
            <a href="https://www.tse.jus.br/eleicoes/eleicoes-2026" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-sky-300">Calendário oficial do TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
