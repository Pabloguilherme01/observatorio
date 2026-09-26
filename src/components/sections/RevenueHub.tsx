import { Calculator, Check, Copy, ExternalLink, LineChart, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { copyText } from '../../lib/clipboard';

type Plan = {
  id: string;
  name: string;
  price: number;
  audience: string;
  description: string;
  features: readonly string[];
};

const PLANS: readonly Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 49.9,
    audience: 'Pesquisadores, jornalistas e profissionais',
    description: 'Relatórios, exportações e leitura aprofundada sem trabalho manual.',
    features: ['Relatórios prontos para compartilhar', 'Exportação de dados e metadados', 'Histórico e comparações', 'Atualizações e alertas'],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 199.9,
    audience: 'Consultorias, escritórios e equipes',
    description: 'Workspace para transformar dados públicos em entregáveis recorrentes.',
    features: ['Tudo do Pro', 'Painéis personalizados', 'Rotinas de atualização', 'Suporte de implantação'],
  },
  {
    id: 'institucional',
    name: 'Institucional',
    price: 799,
    audience: 'Organizações e projetos de dados',
    description: 'Instância e fluxo sob medida para equipes que precisam de rastreabilidade.',
    features: ['Tudo do Profissional', 'Integrações sob demanda', 'Governança e trilha de fontes', 'Implantação assistida'],
  },
];

const DEFAULT_FIXED_COST = 500;

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function track(event: string, payload: Record<string, string | number>) {
  try {
    const key = 'observatorio:product-events';
    const previous = JSON.parse(localStorage.getItem(key) ?? '[]');
    const next = Array.isArray(previous) ? previous.slice(-99) : [];
    next.push({ event, payload, at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Telemetria local é opcional e nunca bloqueia o produto.
  }
}

export function RevenueHub() {
  const [planId, setPlanId] = useState('pro');
  const [customers, setCustomers] = useState(10);
  const [fixedCost, setFixedCost] = useState(DEFAULT_FIXED_COST);
  const [shareStatus, setShareStatus] = useState('');

  const plan = PLANS.find(item => item.id === planId) ?? PLANS[0];
  const monthlyRevenue = plan.price * customers;
  const monthlyResult = monthlyRevenue - fixedCost;
  const annualRevenue = monthlyRevenue * 12;
  const breakEvenCustomers = Math.max(1, Math.ceil(fixedCost / plan.price));
  const margin = monthlyRevenue > 0 ? (monthlyResult / monthlyRevenue) * 100 : 0;

  const proposal = useMemo(() => [
    'OBSERVATÓRIO — PROPOSTA DE USO PROFISSIONAL',
    `Plano: ${plan.name}`,
    `Preço de referência: ${brl(plan.price)}/mês`,
    `Clientes/contas: ${customers}`,
    `Receita mensal simulada: ${brl(monthlyRevenue)}`,
    `Resultado mensal após custo fixo informado: ${brl(monthlyResult)}`,
    '',
    'Aplicações: monitoramento de dados públicos, relatórios, comparações, exportações e painéis rastreáveis.',
  ].join('\\n'), [customers, monthlyRevenue, monthlyResult, plan]);

  const openCheckout = () => {
    track('checkout_intent', { plan: plan.id, customers });
    const url = import.meta.env.VITE_CHECKOUT_URL;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    void copyText(proposal);
    setShareStatus('Proposta copiada. Configure VITE_CHECKOUT_URL para ativar checkout.');
    window.setTimeout(() => setShareStatus(''), 3500);
  };

  const copyProposal = async () => {
    track('proposal_copy', { plan: plan.id, customers });
    const copied = await copyText(proposal);
    setShareStatus(copied ? 'Proposta copiada' : 'Não foi possível copiar automaticamente');
    window.setTimeout(() => setShareStatus(''), 2200);
  };

  return (
    <section id="negocio" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" aria-labelledby="revenue-hub-title">
      <div className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.035] p-4 shadow-[0_18px_70px_rgba(0,0,0,.14)] sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Produto profissional
            </span>
            <h2 id="revenue-hub-title" className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Transforme dados públicos em entregáveis que podem ser vendidos.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              O acesso público continua gratuito. A receita vem de trabalho economizado: relatórios, exportações,
              comparações, painéis personalizados, atualizações e implantação para quem precisa usar os dados profissionalmente.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['Relatórios recorrentes', 'Jornalistas, pesquisadores e equipes que precisam de evidências prontas.'],
                ['Painéis para clientes', 'Consultorias e escritórios que transformam indicadores em entregáveis.'],
                ['Monitoramento', 'Alertas e atualizações para acompanhar mudanças sem conferir tudo manualmente.'],
                ['Implantação', 'Personalização e integração para organizações com fluxos próprios.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white"><LineChart className="h-4 w-4 text-emerald-300" aria-hidden="true" /> {title}</div>
                  <p className="mt-1.5 text-xs leading-5 text-slate-400">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4 text-xs leading-5 text-slate-300">
              <strong className="text-amber-200">Modelo de validação:</strong> nenhuma aplicação consegue garantir 100% de rentabilidade.
              Este módulo foi desenhado para medir demanda, preço, custo e ponto de equilíbrio antes de escalar.
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/10 p-4 sm:p-5" aria-label="Simulador de receita">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Calculator className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Simulador econômico
            </div>
            <p className="mt-1 text-xs text-slate-400">Use números reais de clientes e custos para testar a viabilidade.</p>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-300">
                Oferta
                <select value={planId} onChange={event => { setPlanId(event.target.value); track('plan_select', { plan: event.target.value }); }} className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white">
                  {PLANS.map(item => <option key={item.id} value={item.id}>{item.name} · {brl(item.price)}/mês</option>)}
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-slate-300">
                Clientes/contas
                <input type="number" min="1" max="10000" value={customers} onChange={event => setCustomers(Math.min(10000, Math.max(1, Number(event.target.value) || 1)))} className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white" />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-slate-300">
                Custo fixo mensal
                <input type="number" min="0" step="50" value={fixedCost} onChange={event => setFixedCost(Math.max(0, Number(event.target.value) || 0))} className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white" />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ['Receita mensal', brl(monthlyRevenue)],
                ['Receita anual', brl(annualRevenue)],
                ['Resultado mensal', brl(monthlyResult)],
                ['Margem simulada', `${margin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
                  <span className="block text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
                  <strong className="mt-1 block text-sm text-white">{value}</strong>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-300/8 p-3 text-xs text-slate-300">
              <Users className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
              Ponto de equilíbrio: <strong className="text-white">{breakEvenCustomers} cliente{breakEvenCustomers === 1 ? '' : 's'}</strong> no plano selecionado.
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={openCheckout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-emerald-300">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> Quero contratar
              </button>
              <button type="button" onClick={() => { void copyProposal(); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white hover:border-white/20">
                <Copy className="h-4 w-4" aria-hidden="true" /> Copiar proposta
              </button>
            </div>
            {shareStatus && <p className="mt-2 text-center text-[11px] font-semibold text-emerald-300" role="status" aria-live="polite">{shareStatus}</p>}

            <div className="mt-5 grid gap-2 border-t border-white/8 pt-4">
              {PLANS.map(item => (
                <button key={item.id} type="button" onClick={() => setPlanId(item.id)} className={`rounded-xl border p-3 text-left transition ${planId === item.id ? 'border-emerald-300/30 bg-emerald-300/8' : 'border-white/8 bg-white/[0.02]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-white">{item.name}</strong>
                    <span className="text-sm font-black text-emerald-200">{brl(item.price)}/mês</span>
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400">{item.audience}</span>
                  <span className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-slate-300"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" /> {item.features.join(' · ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sky-300/15 bg-sky-300/[0.035] p-4 text-xs leading-5 text-slate-300">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
          <span><strong className="text-white">Privacidade por padrão:</strong> o simulador guarda apenas eventos de produto no dispositivo, sem enviar dados pessoais para um servidor. Para captar leads ou processar pagamentos, conecte um backend/checkout com política de privacidade e finalidade definida.</span>
        </div>
      </div>
    </section>
  );
}
