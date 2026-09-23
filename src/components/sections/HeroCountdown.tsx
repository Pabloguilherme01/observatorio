import { ArrowRight, CalendarClock, Command, Database, ExternalLink, Languages, Sparkles, Vote } from 'lucide-react';
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

  return <section className="hero-shell relative overflow-hidden border-b border-white/10 px-4 py-12 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="hero-title">
    <div className="mx-auto max-w-7xl">
      <div className="hero-badges mb-5 flex flex-wrap gap-2">
        <Badge>{EDITION} · dados + método</Badge>
        <Badge>Dados públicos</Badge>
        <Badge>Fontes rastreáveis</Badge>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.12fr_.88fr] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-sky-400">Observatório Eleitoral</p>
          <h1 id="hero-title" className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">
            Águas Lindas de Goiás <span className="text-slate-400">2026</span>
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            {languageMode === 'simple'
              ? 'Uma leitura pública da cidade: números, fontes e datas ficam visíveis para você conferir de onde veio cada informação.'
              : 'Um painel público para ler dados eleitorais e municipais com período, fonte, natureza do dado e limitações visíveis na própria interface.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#descubra" className="inline-flex items-center gap-2 rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-200">
              Escolher um assunto <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#evidencias" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5">
              Ver evidências
            </a>
          </div>
          <button
            type="button"
            className="hero-mobile-election-toggle mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.045] px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-300/[0.08]"
            onClick={toggleElectionMode}
            aria-pressed={electionMode}
            aria-label={electionMode ? 'Desativar Modo Eleição' : 'Ativar Modo Eleição'}
          >
            <Vote className="h-4 w-4" aria-hidden="true" />
            <span>{electionMode ? 'Modo Eleição · ativo' : 'Modo Eleição'}</span>
            <span className="text-amber-200/60">{electionMode ? 'desativar' : 'ativar'}</span>
          </button>

          <div className="election-mode-actions mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-4" aria-label="Ações cívicas prioritárias">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-200">Modo Eleição · acesso rápido</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <a href="https://www.tse.jus.br/servicos-eleitorais/servicos/aplicativo-e-titulo" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-black text-slate-100">e-Título · local e serviços</a>
              <a href="https://divulgacandcontas.tse.jus.br/divulga/#/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-black text-slate-100">DivulgaCandContas</a>
              <a href="https://www.tse.jus.br/eleicoes/cde-2026" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-black text-slate-100">Pardal</a>
            </div>
          </div>

          <div className="hero-kpis mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Indicadores de referência da edição">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 light:border-slate-200 light:bg-slate-50/70">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">População 2026</div>
              <div className="mt-1 text-lg font-black text-white light:text-slate-900">{population.toLocaleString('pt-BR')}</div>
              <div className="mt-1 text-[11px] text-slate-600">estimativa IBGE</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 light:border-slate-200 light:bg-slate-50/70">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Eleitorado 2026</div>
              <div className="mt-1 text-lg font-black text-white light:text-slate-900">{electorate.toLocaleString('pt-BR')}</div>
              <div className="mt-1 text-[11px] text-slate-600">{languageMode === 'simple' ? 'foto do eleitorado' : 'snapshot local'}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 light:border-slate-200 light:bg-slate-50/70">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">LOA 2026</div>
              <div className="mt-1 text-lg font-black text-white light:text-slate-900">{brl(loa)}</div>
              <div className="mt-1 text-[11px] text-slate-600">orçamento total informado</div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-600" aria-label="Atualização do conjunto de dados">
            <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> Dados locais atualizados em {updatedAt}.</span>
            <span>Conteúdo informativo · sem ranking automático.</span>
          </div>

          <details className="hero-preferences mt-4 rounded-2xl border border-white/8 bg-white/[0.02] light:border-slate-200 light:bg-slate-50/70">
            <summary className="cursor-pointer px-3 py-3 text-sm font-bold text-slate-300 hover:text-white light:text-slate-700">Preferências de leitura e ferramentas</summary>
            <div className="grid gap-3 border-t border-white/8 p-3 sm:grid-cols-2">
              <div aria-label="Escolha a linguagem da interface">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500"><Languages className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> Linguagem</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setLanguageMode('simple')} aria-pressed={languageMode === 'simple'} className={"rounded-xl border px-3 py-2 text-xs font-bold " + (languageMode === 'simple' ? 'border-sky-300/30 bg-sky-300/10 text-sky-200' : 'border-white/10 bg-white/[0.035] text-slate-400')}>Explicação simples</button>
                  <button type="button" onClick={() => setLanguageMode('technical')} aria-pressed={languageMode === 'technical'} className={"rounded-xl border px-3 py-2 text-xs font-bold " + (languageMode === 'technical' ? 'border-sky-300/30 bg-sky-300/10 text-sky-200' : 'border-white/10 bg-white/[0.035] text-slate-400')}>Detalhes técnicos</button>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{languageMode === 'simple' ? 'Termos técnicos ganham explicação direta.' : 'O vocabulário técnico e as camadas metodológicas ficam em primeiro plano.'}</p>
              </div>
              <div aria-label="Escolha a camada de leitura">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Camada de leitura</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:mode', { detail: 'overview' }))} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20 hover:text-white light:border-slate-200 light:text-slate-700">Visão geral</button>
                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:mode', { detail: 'investigation' }))} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20 hover:text-white light:border-slate-200 light:text-slate-700">Investigação</button>
                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:mode', { detail: 'evidence' }))} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20 hover:text-white light:border-slate-200 light:text-slate-700">Evidências</button>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">A mudança reorganiza a densidade da interface.</p>
              </div>
              <div className="flex items-end sm:col-span-2">
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5">
                  <Command className="h-4 w-4" aria-hidden="true" /> Central de comandos
                </button>
              </div>
            </div>
          </details>

          <div className="hero-trust-line mt-4 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> Explore · compare · verifique</span>
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
