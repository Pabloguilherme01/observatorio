import { ArrowRight, BarChart3, Brain, BusFront, Droplets, Landmark, RefreshCw, Users, WalletCards } from 'lucide-react';
import { useMemo } from 'react';
import { observatorioData as d } from '../data/observatorioData';
import generated from '../data/generated/tse2026-candidates.json';
import { formatDate } from '../utils/formatters';
import { ShareDataButton } from './ShareDataButton';
import { useLanguageMode } from '../context/LanguageModeContext';

type Topic = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly simple: string;
  readonly icon: typeof BarChart3;
};

const topics: readonly Topic[] = [
  { id: 'dashboard', label: 'Cidade', description: 'População, densidade e indicadores básicos.', simple: 'Os números básicos da cidade.', icon: BarChart3 },
  { id: 'eleitorado', label: 'Eleitorado', description: 'Perfil, snapshots e diferenças de base.', simple: 'Quem está no recorte eleitoral.', icon: Users },
  { id: 'orcamento', label: 'Orçamento', description: 'LOA, áreas de gasto e valores previstos.', simple: 'Quanto está previsto no orçamento.', icon: WalletCards },
  { id: 'transporte', label: 'Transporte', description: 'Tarifas e cálculo de custo mensal.', simple: 'Quanto o transporte pode custar.', icon: BusFront },
  { id: 'saude', label: 'Saneamento', description: 'Água, esgoto, coleta e tratamento.', simple: 'Como estão água e esgoto.', icon: Droplets },
  { id: 'politica', label: 'Eleições', description: 'Pesquisas documentais, calendário e registros.', simple: 'Calendário, pesquisas e registros.', icon: Landmark },
];

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 1 });
}

export function AudienceHub() {
  const { mode } = useLanguageMode();
  const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
  const sanitationPct = d.sanitation.publicSewerServicePct;
  const fare = d.transport.routes[0]?.fareBrl ?? 0;
  const snapshotState = generated.meta.state;
  const snapshotLabel = snapshotState === 'not_synced'
    ? 'candidaturas ainda não sincronizadas'
    : 'captura de candidaturas: ' + snapshotState;

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: document.documentElement.classList.contains('reduced-motion') ? 'auto' : 'smooth',
      block: 'start',
    });
    window.history.replaceState(null, '', '#' + id);
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  };

  const shareUrl = window.location.origin + window.location.pathname;
  const modeHint = useMemo(
    () => mode === 'simple'
      ? 'Números claros. Toque para ver a fonte.'
      : 'Valores, método, data e fonte ficam disponíveis em cada dado.',
    [mode],
  );

  return (
    <section id="descubra" className="mx-auto max-w-7xl px-4 pb-8 pt-3 sm:px-6 sm:pb-10" aria-labelledby="audience-title">
      <div className="discovery-shell">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">Comece por aqui</div>
            <h2 id="audience-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">O que você quer saber?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{modeHint}</p>
          </div>
          <a href="#mudancas-snapshot" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20 hover:text-white">
            <RefreshCw className="h-4 w-4 text-sky-300" aria-hidden="true" /> Mudanças
          </a>
        </div>

        <div className="topic-rail mt-5" aria-label="Assuntos do observatório">
          {topics.map(({ id, label, description, simple, icon: Icon }) => (
            <button key={id} type="button" onClick={() => go(id)} className="topic-card group">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-300/10 text-sky-200">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mt-3 block text-sm font-black text-white">{label}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {mode === 'simple' ? simple : description}
              </span>
              {mode === 'technical' && (
                <span className="technical-detail mt-2 block text-[10px] leading-4 text-slate-600">Fonte, data e método disponíveis.</span>
              )}
              <span className="mt-auto flex items-center gap-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-sky-300/70">
                Abrir <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>

        {mode === 'technical' && (
          <div className="technical-detail mt-4 rounded-2xl border border-white/8 bg-white/[0.018] px-4 py-3 text-xs text-slate-500">
            Dados locais atualizados em {formatDate(d.meta.updatedAt)} · {snapshotLabel}. Use o inspetor de dados para a referência completa de cada valor.
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.45fr_.55fr]">
          <div className="rounded-3xl border border-white/8 bg-black/10 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Entenda a cidade em poucos minutos</div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">6 atalhos</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['01', 'População', population.toLocaleString('pt-BR') + ' habitantes estimados', 'dashboard'],
                ['02', 'Eleitorado', d.electoral.electorate.toLocaleString('pt-BR') + ' no snapshot local', 'eleitorado'],
                ['03', 'Orçamento', brl(d.budget.totalBrl) + ' na LOA 2026', 'orcamento'],
                ['04', 'Mobilidade', 'a partir de ' + brl(fare) + ' por trecho de referência', 'transporte'],
                ['05', 'Saneamento', sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '% no recorte apresentado', 'saude'],
                ['06', 'Eleições', 'calendário, pesquisas e registros', 'politica'],
              ].map(([step, label, description, id]) => (
                <button key={step} type="button" onClick={() => go(id)} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-left transition hover:-translate-y-0.5 hover:border-sky-300/20">
                  <span className="text-[10px] font-black tracking-widest text-sky-300/70">{step}</span>
                  <strong className="mt-2 block text-sm text-white">{label}</strong>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-sky-300/10 bg-sky-300/[0.035] p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Atualização
            </div>
            <div className="mt-2 text-lg font-black text-white">O que entrou de novo</div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Dataset local atualizado em {formatDate(d.meta.updatedAt)}. {snapshotLabel}.
            </p>
            <a href="#mudancas-snapshot" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20">
              Ver mudanças <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Hoje no Observatório</div>
              <p className="mt-1 text-xs text-slate-500">Um número por vez, sem excesso de informação.</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">{mode === 'simple' ? '4 números' : 'dados + fonte'}</span>
          </div>

          <div className="today-rail">
            <div className="today-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">LOA 2026</span>
              <strong className="mt-2 block text-2xl font-black text-white">{brl(d.budget.totalBrl)}</strong>
              <span className="mt-1 block text-xs text-slate-500">previsto para 2026</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#orcamento" className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">Ver</a>
                <ShareDataButton title="LOA 2026 · Águas Lindas" text={'A LOA 2026 prevê ' + brl(d.budget.totalBrl) + ' para Águas Lindas de Goiás. Veja fonte e detalhes no Observatório.'} url={shareUrl + '#orcamento'} compact />
              </div>
            </div>

            <div className="today-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Eleitorado</span>
              <strong className="mt-2 block text-2xl font-black text-white">{d.electoral.electorate.toLocaleString('pt-BR')}</strong>
              <span className="mt-1 block text-xs text-slate-500">eleitores no snapshot</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#eleitorado" className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">Ver</a>
                <ShareDataButton title="Eleitorado 2026 · Águas Lindas" text={'O snapshot local usado pelo Observatório registra ' + d.electoral.electorate.toLocaleString('pt-BR') + ' eleitores em Águas Lindas de Goiás.'} url={shareUrl + '#eleitorado'} compact />
              </div>
            </div>

            <div className="today-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transporte</span>
              <strong className="mt-2 block text-2xl font-black text-white">{brl(fare)}</strong>
              <span className="mt-1 block text-xs text-slate-500">por trecho para Brasília</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#transporte" className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">Calcular</a>
                <ShareDataButton title="Transporte · Águas Lindas → Brasília" text={'A tarifa de referência considerada pelo Observatório é ' + brl(fare) + ' por trecho para Brasília. Veja o cálculo completo.'} url={shareUrl + '#transporte'} compact />
              </div>
            </div>

            <div className="today-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Saneamento</span>
              <strong className="mt-2 block text-2xl font-black text-white">{sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong>
              <span className="mt-1 block text-xs text-slate-500">serviço público de esgoto</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#saude" className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">Entender</a>
                <ShareDataButton title="Saneamento · Águas Lindas" text={'O indicador de acesso ao serviço público de esgoto é ' + sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '% no recorte apresentado pelo Observatório.'} url={shareUrl + '#saude'} compact />
              </div>
            </div>
          </div>
        </div>

        {mode === 'technical' && (
          <div className="technical-detail mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Fonte oficial', 'Instituição, data e referência aparecem no inspetor.'],
              ['Método', 'Cálculos derivados são identificados como derivados.'],
              ['Compartilhamento', 'Links preservam a âncora do assunto e a origem do dado.'],
            ].map(([title, description], index) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-sky-300/70">0{index + 1}</div>
                <strong className="mt-2 block text-sm text-white">{title}</strong>
                <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-3xl border border-violet-300/10 bg-violet-300/[0.035] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-200/80">
                <Brain className="h-3.5 w-3.5" aria-hidden="true" /> Aprenda em 60 segundos
              </div>
              <strong className="mt-2 block text-base text-white">Quer testar o que entendeu?</strong>
              <p className="mt-1 text-xs leading-5 text-slate-500">Cinco perguntas rápidas, com explicação e fonte. Sem ranking.</p>
            </div>
            <button type="button" onClick={() => {
              window.dispatchEvent(new CustomEvent('observatorio:mode', { detail: 'investigation' }));
              window.setTimeout(() => {
                document.getElementById('quiz')?.scrollIntoView({
                  behavior: document.documentElement.classList.contains('reduced-motion') ? 'auto' : 'smooth',
                  block: 'start',
                });
                window.history.replaceState(null, '', '#quiz');
                window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: 'quiz' }));
              }, 40);
            }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-xs font-black text-violet-100 hover:bg-violet-300/15">
              Começar <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
