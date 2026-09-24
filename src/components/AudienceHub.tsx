import { ArrowRight, BarChart3, BusFront, Droplets, Landmark, RefreshCw, Users, WalletCards } from 'lucide-react';
import { observatorioData as d } from '../data/observatorioData';
import { formatDate } from '../utils/formatters';
import { useLanguageMode } from '../context/LanguageModeContext';
import { AudienceTodaySummary } from './AudienceTodaySummary';

// ajuste de texto público aplicado mantendo a estrutura existente

export function AudienceHub() {
  const { mode } = useLanguageMode();
  return <section id="descubra" className="mx-auto max-w-7xl px-4 pb-8 pt-3 sm:px-6 sm:pb-10">
    <div className="discovery-shell">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-white">O que você quer saber?</h2>
        <p className="mt-2 text-sm text-slate-400">{mode === 'technical' ? 'Valores, método, data e fonte ficam disponíveis em cada dado.' : 'Os principais assuntos e números, sem a camada técnica.'}</p>
      </div>
      <AudienceTodaySummary
        budget={d.budget.totalBrl.toLocaleString('pt-BR')}
        electorate={d.electoral.electorate.toLocaleString('pt-BR')}
        transport={String(d.transport.routes[0]?.fareBrl ?? 0)}
        sanitation={`${d.sanitation.publicSewerServicePct}%`}
        onNavigate={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
      />
    </div>
  </section>;
}
