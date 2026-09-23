import { ArrowRight, BarChart3, Brain, BusFront, Droplets, Landmark, RefreshCw, Users, WalletCards } from 'lucide-react';
import { observatorioData as d } from '../data/observatorioData';
import generated from '../data/generated/tse2026-candidates.json';
import { formatDate } from '../utils/formatters';
import { ShareDataButton } from './ShareDataButton';
import { useLanguageMode } from '../context/LanguageModeContext';

type Topic = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly icon: typeof BarChart3;
};

const topics: readonly Topic[] = [
  { id: 'dashboard', label: 'Dados da cidade', description: 'População, densidade e indicadores básicos.', icon: BarChart3 },
  { id: 'eleitorado', label: 'Eleitorado', description: 'Perfil, snapshots e diferenças de base.', icon: Users },
  { id: 'orcamento', label: 'Orçamento', description: 'LOA, áreas de gasto e valores previstos.', icon: WalletCards },
  { id: 'transporte', label: 'Transporte', description: 'Tarifas e cálculo de custo mensal.', icon: BusFront },
  { id: 'saude', label: 'Saneamento', description: 'Água, esgoto, coleta e tratamento.', icon: Droplets },
  { id: 'politica', label: 'Eleições', description: 'Pesquisas documentais, calendário e registros.', icon: Landmark },
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
    ? 'candidaturas: captura TSE ainda não sincronizada'
    : 'candidaturas: estado ' + snapshotState;

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', '#' + id);
  };

  const shareUrl = window.location.origin + window.location.pathname;

  return (
    <section id="descubra" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="audience-title">
      <div className="rounded-[28px] border border-sky-300/10 bg-white/[0.025] p-4 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">Descoberta</div>
            <h2 id="audience-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">O que você quer descobrir?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Escolha um assunto e vá direto ao dado.</p>
          </div>
          <a href="#mudancas-snapshot" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20 hover:text-white">
            <RefreshCw className="h-4 w-4 text-sky-300" aria-hidden="true" />
            O que mudou?
          </a>
        </div>

        <div className="topic-rail mt-5" aria-label="Assuntos do observatório">
          {topics.map(({ id, label, description, icon: Icon }) => (
            <button key={id} type="button" onClick={() => go(id)} className="topic-card group">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-300/10 text-sky-200"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="mt-3 block text-sm font-black text-white">{label}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{mode === 'simple' ? description.replace(/\.$/, '') : description + ' · fonte e metodologia disponíveis'}</span>
              <span className="mt-auto flex items-center gap-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-sky-300/70">Abrir <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
            </button>
          ))}
        </div>

        <div className="mt-4 technical-detail rounded-2xl border border-white/8 bg-white/[0.018] px-4 py-3 text-xs text-slate-500">Modo técnico: dataset atualizado em {formatDate(d.meta.updatedAt)} · estado da captura de candidaturas: {snapshotState} · referências e metodologia ficam disponíveis nos detalhes de cada dado.</div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.45fr_.55fr]">
          <div className="rounded-3xl border border-white/8 bg-black/10 p-4 sm:p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">5 minutos para entender Águas Lindas</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['01', 'População', population.toLocaleString('pt-BR') + ' habitantes estimados', 'dashboard'],
                ['02', 'Eleitorado', d.electoral.electorate.toLocaleString('pt-BR') + ' no snapshot local', 'eleitorado'],
                ['03', 'Orçamento', brl(d.budget.totalBrl) + ' na LOA 2026', 'orcamento'],
                ['04', 'Mobilidade', 'a partir de ' + brl(fare) + ' por trecho de referência', 'transporte'],
                ['05', 'Saneamento', sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '% com acesso ao serviço público de esgoto', 'saude'],
                ['06', 'Eleições', 'calendário, pesquisas e registros documentais', 'politica'],
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
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Radar
            </div>
            <div className="mt-2 text-lg font-black text-white">Atualização local</div>
            <p className="mt-1 text-xs leading-5 text-slate-500">Dataset local atualizado em {formatDate(d.meta.updatedAt)}. {snapshotLabel}.</p>
            <a href="#mudancas-snapshot" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20">Abrir histórico de mudanças <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Hoje no Observatório</div>
              <p className="mt-1 text-xs text-slate-500">Números de referência com compartilhamento individual.</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Veja · entenda · confira</span>
          </div>

          <div className="today-rail">
            <div className="today-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">LOA 2026</span>
              <strong className="mt-2 block text-2xl font-black text-white">{brl(d.budget.totalBrl)}</strong>
              <span className="mt-1 block text-xs text-slate-500">orçamento total informado</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#orcamento" className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">Ver orçamento</a>
                <ShareDataButton title="LOA 2026 · Águas Lindas" text={'A LOA 2026 prevê ' + brl(d.budget.totalBrl) + ' para Águas Lindas de Goiás. Veja a fonte e os detalhes no Observatório.'} url={shareUrl + '#orcamento'} compact />
              </div>
            </div>

            <div className="today-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Eleitorado</span>
              <strong className="mt-2 block text-2xl font-black text-white">{d.electoral.electorate.toLocaleString('pt-BR')}</strong>
              <span className="mt-1 block text-xs text-slate-500">snapshot local de 2026</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#eleitorado" className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">Ver perfil</a>
                <ShareDataButton title="Eleitorado 2026 · Águas Lindas" text={'O snapshot local usado pelo Observatório registra ' + d.electoral.electorate.toLocaleString('pt-BR') + ' eleitores em Águas Lindas de Goiás.'} url={shareUrl + '#eleitorado'} compact />
              </div>
            </div>

            <div className="today-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transporte</span>
              <strong className="mt-2 block text-2xl font-black text-white">{brl(fare)}</strong>
              <span className="mt-1 block text-xs text-slate-500">trecho de referência para Brasília</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#transporte" className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">Calcular custo</a>
                <ShareDataButton title="Transporte · Águas Lindas → Brasília" text={'A tarifa de referência considerada pelo Observatório é ' + brl(fare) + ' por trecho para Brasília. Veja o cálculo completo.'} url={shareUrl + '#transporte'} compact />
              </div>
            </div>

            <div className="today-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Saneamento</span>
              <strong className="mt-2 block text-2xl font-black text-white">{sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong>
              <span className="mt-1 block text-xs text-slate-500">acesso ao serviço público de esgoto</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#saude" className="inline-flex min-h-10 items-center rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">Entender o indicador</a>
                <ShareDataButton title="Saneamento · Águas Lindas" text={'O indicador de acesso ao serviço público de esgoto é ' + sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '% no recorte apresentado pelo Observatório.'} url={shareUrl + '#saude'} compact />
              </div>
            </div>
          </div>
        </div>

        <div className="technical-detail mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['Fonte oficial', mode === 'simple' ? 'A fonte aparece junto do dado.' : 'Cada dado aponta para a instituição, data e referência usada.'],
            ['Explicação simples', mode === 'simple' ? 'Texto curto e direto.' : 'A camada técnica preserva método, fonte e contexto.'],
            ['Compartilhável', mode === 'simple' ? 'Compartilhe o assunto com a fonte.' : 'Cada assunto pode ser aberto por âncora e compartilhado com rastreabilidade.'],
          ].map(([title, description], index) => (
            <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-300/70">0{index + 1}</div>
              <strong className="mt-2 block text-sm text-white">{title}</strong>
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-3xl border border-violet-300/10 bg-violet-300/[0.035] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-200/80"><Brain className="h-3.5 w-3.5" aria-hidden="true" /> Aprenda em 60 segundos</div>
              <strong className="mt-2 block text-base text-white">Teste o que você entendeu sobre os dados</strong>
              <p className="mt-1 text-xs leading-5 text-slate-500">Cinco perguntas, explicações e fonte de cada resposta. Sem ranking entre pessoas.</p>
            </div>
            <button type="button" onClick={() => {
              window.dispatchEvent(new CustomEvent('observatorio:mode', { detail: 'investigation' }));
              window.setTimeout(() => {
                document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.replaceState(null, '', '#quiz');
              }, 40);
            }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-xs font-black text-violet-100 hover:bg-violet-300/15">
              Começar quiz <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
