import { ArrowRight, BarChart3, BusFront, CalendarClock, Database, Droplets, ExternalLink, Users, Vote, WalletCards } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { useCountdown } from '../../hooks/useCountdown';
import { useEffect, useState } from 'react';
import { EDITION, STORAGE_NAMESPACE } from '../../config/version';
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
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function HeroCountdown() {
  const election = useCountdown('2026-10-04T08:00:00-03:00');
  const secondRound = useCountdown('2026-10-25T08:00:00-03:00');
  const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
  const transportFare = d.transport.routes[0]?.fareBrl;
  const electorate = d.electoral.electorate;
  const loa = d.budget.totalBrl;
  const updatedAt = formatDate(d.meta.updatedAt);
  const { mode: languageMode } = useLanguageMode();
  const [electionMode, setElectionMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_NAMESPACE}-election-mode`) === '1'
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
            <button type="button" onClick={toggleElectionMode} aria-pressed={electionMode} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2.5 text-sm font-bold text-amber-100 transition hover:bg-amber-300/[0.1]">
              <Vote className="h-4 w-4" aria-hidden="true" />
              {electionMode ? 'Modo Eleição ativo' : 'Ativar Modo Eleição'}
            </button>
            <a href="#descubra" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-200">
              {languageMode === 'simple' ? 'Começar' : 'Escolher um assunto'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#evidencias" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5">
              {languageMode === 'simple' ? 'Conferir fontes' : 'Ver evidências'}
            </a>
          </div>

          {languageMode === 'summary' && (
            <div className="summary-hero-panel mt-5 rounded-[24px] border border-sky-300/15 bg-gradient-to-br from-sky-300/[0.09] via-white/[0.035] to-transparent p-3 sm:p-4" aria-label="Resumo rápido do observatório">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-200/80">Em 1 minuto</div>
                  <h2 className="mt-1 text-base font-black text-white sm:text-lg">Quatro pontos para entender a cidade</h2>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Toque para explorar</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { id: 'dashboard', label: 'Cidade', value: population.toLocaleString('pt-BR'), note: 'Fonte: IBGE · estimativa 2026', icon: BarChart3 },
                  { id: 'eleitorado', label: 'Eleitorado', value: electorate.toLocaleString('pt-BR'), note: 'Fonte: TSE · 15/07/2026', icon: Users },
                  { id: 'orcamento', label: 'Orçamento', value: brl(loa), note: 'Fonte: LOA municipal · 2026', icon: WalletCards },
                  { id: 'transporte', label: 'Transporte', value: transportFare != null ? brl(transportFare) : '—', note: transportFare != null ? 'Fonte: tarifa semiurbana · Entorno-DF' : 'valor não informado', icon: BusFront },
                ].map(({ id, label, value, note, icon: Icon }) => (
                  <a key={id} href={'#' + id} className="summary-hero-card group">
                    <span className="summary-hero-icon"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
                      <strong className="mt-1 block truncate text-base font-black text-white">{value}</strong>
                      <span className="mt-0.5 block text-[11px] text-slate-500">{note}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-300" aria-hidden="true" />
                  </a>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/8 bg-black/10 px-3 py-2.5 text-[11px] leading-5 text-slate-400">
                <Droplets className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                <span>Cada número já mostra sua fonte e referência. Abra o detalhe apenas quando precisar de metodologia.</span>
              </div>
            </div>
          )}


          <div className="election-mode-actions sr-only" aria-hidden="true">Modo Eleição · acesso rápido</div>
          {electionMode && (
            <div className="hero-election-quick mt-3 flex items-center gap-2 rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-2">
              <Vote className="ml-1 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
              <span className="min-w-0 flex-1 text-xs font-bold text-amber-100">Modo Eleição ativo</span>
              <button type="button" className="hero-mobile-election-toggle min-h-10 rounded-xl border border-amber-300/20 bg-amber-300/[0.045] px-3 text-[11px] font-black text-amber-100" onClick={toggleElectionMode} aria-pressed={true} aria-label="Desativar Modo Eleição">Desativar</button>
            </div>
          )}
          <div className="hero-kpis hero-kpis-guide mt-5 grid gap-2 sm:grid-cols-3" aria-label="Atalhos de leitura">
            <a href="#resumo" className="group rounded-2xl border border-white/8 bg-white/[0.02] p-3 transition hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-sky-300/[0.03] light:border-slate-200 light:bg-slate-50/70">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Comece</span>
              <strong className="mt-1 block text-sm font-black text-white light:text-slate-900">Resumo público</strong>
              <span className="mt-1 block text-[11px] leading-5 text-slate-600">os números essenciais ficam logo abaixo</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-sky-300">Abrir <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </a>
            <a href="#descubra" className="group rounded-2xl border border-white/8 bg-white/[0.02] p-3 transition hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-sky-300/[0.03] light:border-slate-200 light:bg-slate-50/70">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Explore</span>
              <strong className="mt-1 block text-sm font-black text-white light:text-slate-900">Assuntos da cidade</strong>
              <span className="mt-1 block text-[11px] leading-5 text-slate-600">eleição, cidade, serviços e recursos</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-sky-300">Explorar <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </a>
            <a href="#fontes" className="group rounded-2xl border border-white/8 bg-white/[0.02] p-3 transition hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-sky-300/[0.03] light:border-slate-200 light:bg-slate-50/70">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Confira</span>
              <strong className="mt-1 block text-sm font-black text-white light:text-slate-900">Fontes e datas</strong>
              <span className="mt-1 block text-[11px] leading-5 text-slate-600">cada dado mantém sua origem visível</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-sky-300">Conferir <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </a>
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
