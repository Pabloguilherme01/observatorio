import { BookOpenCheck, ExternalLink, SearchCheck, ShieldCheck, Stethoscope, GraduationCap, WalletCards, MessageCircle } from 'lucide-react';
import { PremiumInfoCard } from '../ui/PremiumInfoCard';

const quickNeeds = [
  { icon: Stethoscope, label: 'Saúde e medicamentos', query: 'medicamentos' },
  { icon: GraduationCap, label: 'Creches e educação', query: 'creches' },
  { icon: WalletCards, label: 'Gastos e contratos', query: 'despesas' },
  { icon: MessageCircle, label: 'Ouvidoria e denúncia', query: 'denúncias' },
] as const;

const steps = [
  {
    icon: BookOpenCheck,
    eyebrow: '1 · Entenda',
    title: 'Leia o número com contexto',
    body: 'Confira o que o indicador mede, qual é o período de referência e se o valor é observação, estimativa ou cálculo derivado.',
    tone: 'sky' as const,
  },
  {
    icon: SearchCheck,
    eyebrow: '2 · Confira',
    title: 'Abra a fonte antes de comparar',
    body: 'Dados públicos podem usar anos-base e universos diferentes. A fonte e a data ficam acessíveis para você conferir a origem.',
    tone: 'violet' as const,
  },
  {
    icon: ShieldCheck,
    eyebrow: '3 · Use com segurança',
    title: 'Separe dado de interpretação',
    body: 'O Observatório organiza evidências públicas. Comparações e conclusões devem respeitar método, recorte, limitações e atualização.',
    tone: 'emerald' as const,
  },
] as const;

export function PublicUtilityGuide() {
  const goToServices = (query = '') => {
    window.history.replaceState({ publicServiceQuery: query }, '', '#acao');
    window.dispatchEvent(new CustomEvent('observatorio:public-service-search', { detail: query }));
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: 'acao' }));
  };

  return (
    <section id="utilidade-publica" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7" aria-labelledby="public-utility-title">
      <div className="rounded-[28px] border border-white/8 bg-white/[0.02] p-4 sm:p-6 light:border-slate-200 light:bg-slate-50/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300/80 light:text-sky-700">Utilidade pública</div>
            <h2 id="public-utility-title" className="mt-1 text-xl font-black text-white sm:text-2xl light:text-slate-900">Do dado à ação, sem perder o contexto</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 light:text-slate-600">
              Um caminho curto para interpretar informações públicas, conferir a evidência e encontrar canais oficiais quando precisar agir.
            </p>
          </div>
          <button type="button" onClick={() => goToServices()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-4 text-sm font-bold text-sky-200 transition hover:bg-sky-300/[0.1] light:text-sky-800">
            Abrir serviços e canais oficiais <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {quickNeeds.map(({ icon: Icon, label, query }) => (
            <button key={label} type="button" onClick={() => goToServices(query)} className="flex min-h-12 items-center gap-2 rounded-xl border border-white/8 bg-black/10 px-3 text-left text-xs font-bold text-slate-200 transition hover:border-sky-300/25 hover:bg-sky-300/[0.06] light:border-slate-200 light:bg-white light:text-slate-800">
              <Icon className="h-4 w-4 shrink-0 text-sky-300 light:text-sky-700" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {steps.map(step => (
            <PremiumInfoCard key={step.title} icon={step.icon} eyebrow={step.eyebrow} title={step.title} tone={step.tone} compact>
              <p>{step.body}</p>
            </PremiumInfoCard>
          ))}
        </div>
      </div>
    </section>
  );
}
