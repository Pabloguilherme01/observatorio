import { ArrowRight, BarChart3, BusFront, Droplets, Landmark, RefreshCw, Users, WalletCards } from 'lucide-react';
import { observatorioData as d } from '../data/observatorioData';
import { formatDate } from '../utils/formatters';
import { useLanguageMode } from '../context/LanguageModeContext';
import { AudienceTodaySummary } from './AudienceTodaySummary';

type Topic = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly simple: string;
  readonly icon: typeof BarChart3;
};

const topics: readonly Topic[] = [
  { id: 'dashboard', label: 'Cidade', description: 'População, densidade e indicadores básicos.', simple: 'Os números básicos da cidade.', icon: BarChart3 },
  { id: 'eleitorado', label: 'Eleitorado', description: 'Perfil eleitoral e recortes da base.', simple: 'Quem está no recorte eleitoral.', icon: Users },
  { id: 'orcamento', label: 'Orçamento', description: 'LOA, áreas de gasto e valores previstos.', simple: 'Quanto está previsto no orçamento.', icon: WalletCards },
  { id: 'transporte', label: 'Transporte', description: 'Tarifas e cálculo de custo mensal.', simple: 'Quanto o transporte pode custar.', icon: BusFront },
  { id: 'saude', label: 'Saneamento', description: 'Água, esgoto, coleta e tratamento.', simple: 'Como estão água e esgoto.', icon: Droplets },
  { id: 'politica', label: 'Eleições', description: 'Calendário, candidaturas e registros.', simple: 'Calendário e candidatos.', icon: Landmark },
];

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 1 });
}

export function AudienceHub() {
  const { mode } = useLanguageMode();
  const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
  const sanitationPct = d.sanitation.publicSewerServicePct;
  const fare = d.transport.routes[0]?.fareBrl ?? 0;

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: document.documentElement.classList.contains('reduced-motion') ? 'auto' : 'smooth',
      block: 'start',
    });
    window.history.replaceState(null, '', '#' + id);
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  };

  const modeHint = mode === 'technical'
    ? 'Valores, método, data e fonte ficam disponíveis em cada dado.'
    : mode === 'summary'
      ? 'Os principais assuntos e números, sem a camada técnica.'
      : 'Números claros para explorar a cidade.';

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
                {mode === 'technical' ? description : simple}
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
            Dados locais atualizados em {formatDate(d.meta.updatedAt)}. A referência completa fica disponível no inspetor de dados.
          </div>
        )}

        {mode === 'technical' && (
          <div className="mt-5 rounded-3xl border border-white/8 bg-black/10 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Atalhos técnicos</div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">6 assuntos</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['População', population.toLocaleString('pt-BR') + ' habitantes', 'dashboard'],
                ['Eleitorado', d.electoral.electorate.toLocaleString('pt-BR') + ' eleitores', 'eleitorado'],
                ['Orçamento', brl(d.budget.totalBrl), 'orcamento'],
                ['Transporte', brl(fare) + ' por trecho', 'transporte'],
                ['Saneamento', sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', 'saude'],
                ['Eleições', 'calendário e registros', 'politica'],
              ].map(([label, description, id]) => (
                <button key={label} type="button" onClick={() => go(id)} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-left transition hover:border-sky-300/20">
                  <strong className="block text-sm text-white">{label}</strong>
                  <span className="mt-1 block text-xs text-slate-500">{description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Hoje</div>
              <p className="mt-1 text-xs text-slate-500">
                {mode === 'technical' ? 'Indicadores com referência e método.' : 'Os quatro números principais para começar.'}
              </p>
            </div>
          </div>

          <AudienceTodaySummary
            budget={brl(d.budget.totalBrl)}
            electorate={d.electoral.electorate.toLocaleString('pt-BR')}
            transport={brl(fare)}
            sanitation={sanitationPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'}
            onNavigate={go}
          />
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
      </div>
    </section>
  );
}
