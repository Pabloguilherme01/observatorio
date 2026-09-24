import { BarChart3, BusFront, Droplets, Landmark, Users, WalletCards } from 'lucide-react';
import { observatorioData as d } from '../data/observatorioData';
import { AudienceTodaySummary } from './AudienceTodaySummary';
import { CandidatesPanel } from './CandidatesPanel';

type Topic = {
  id: string;
  label: string;
  simple: string;
  icon: typeof BarChart3;
};

const topics: Topic[] = [
  { id: 'dashboard', label: 'Cidade', simple: 'Números básicos do município.', icon: BarChart3 },
  { id: 'eleitorado', label: 'Eleitorado', simple: 'Perfil dos eleitores.', icon: Users },
  { id: 'orcamento', label: 'Orçamento', simple: 'Como o dinheiro público está previsto.', icon: WalletCards },
  { id: 'transporte', label: 'Transporte', simple: 'Custos e informações de transporte.', icon: BusFront },
  { id: 'saude', label: 'Saneamento', simple: 'Água, esgoto e cobertura.', icon: Droplets },
  { id: 'politica', label: 'Eleições', simple: 'Candidatos e dados eleitorais.', icon: Landmark },
];

export function AudienceHub() {
  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="descubra" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="discovery-shell">
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            O que você quer saber?
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Explore os principais dados da cidade de forma simples.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ id, label, simple, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              className="topic-card min-h-32 text-left border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.035]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-300/10 dark:text-sky-300">
                <Icon className="h-5 w-5" />
              </span>
              <strong className="mt-3 block text-slate-900 dark:text-white">{label}</strong>
              <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">{simple}</span>
            </button>
          ))}
        </div>

        <div className="mt-6" id="dashboard">
          <AudienceTodaySummary
            budget={d.budget.totalBrl.toLocaleString('pt-BR')}
            electorate={d.electoral.electorate.toLocaleString('pt-BR')}
            transport={String(d.transport.routes[0]?.fareBrl ?? 0)}
            sanitation={`${d.sanitation.publicSewerServicePct}%`}
            onNavigate={go}
          />
        </div>

        <div className="mt-8" id="politica">
          <CandidatesPanel />
        </div>
      </div>
    </section>
  );
}
