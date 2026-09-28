import { BookOpenCheck, ExternalLink, SearchCheck, ShieldCheck, Stethoscope, GraduationCap, WalletCards, MessageCircle, BusFront, HeartHandshake } from 'lucide-react';
import { PremiumInfoCard } from '../ui/PremiumInfoCard';
import { navigateToSection } from '../../lib/sectionNavigation';

const quickNeeds = [
  { icon: Stethoscope, label: 'Saúde e medicamentos', hint: 'Buscar atendimento e canais', query: 'medicamentos' },
  { icon: GraduationCap, label: 'Creches e educação', hint: 'Encontrar orientação e acesso', query: 'creches' },
  { icon: WalletCards, label: 'Gastos e contratos', hint: 'Consultar despesas públicas', query: 'despesas' },
  { icon: MessageCircle, label: 'Ouvidoria e denúncia', hint: 'Localizar o canal adequado', query: 'denúncias' },
  { icon: BusFront, label: 'Trânsito e mobilidade', hint: 'Buscar serviços e orientação', query: 'trânsito' },
  { icon: HeartHandshake, label: 'Assistência social', hint: 'Encontrar atendimento social', query: 'CRAS' },
] as const;

const steps = [
  {
    icon: BookOpenCheck,
    eyebrow: '1 · Entenda',
    title: 'Entenda o que o número mede',
    body: 'Veja o indicador, o período de referência e se o valor é observação, estimativa, registro ou cálculo derivado.',
    tone: 'sky' as const,
  },
  {
    icon: SearchCheck,
    eyebrow: '2 · Confira',
    title: 'Confira fonte, data e recorte',
    body: 'Dados públicos podem usar anos-base e universos diferentes. Confira a origem e a referência antes de comparar.',
    tone: 'violet' as const,
  },
  {
    icon: ShieldCheck,
    eyebrow: '3 · Use com segurança',
    title: 'Use o dado com a ressalva',
    body: 'Leve junto método, recorte, limitações e atualização. O contexto faz parte da informação, não é um detalhe opcional.',
    tone: 'emerald' as const,
  },
] as const;

export function PublicUtilityGuide() {
  const goToServices = (query = '') => {
    const currentState = typeof window.history.state === 'object' && window.history.state !== null
      ? window.history.state
      : {};
    navigateToSection('acao', {
      state: { ...currentState, publicServiceQuery: query },
      replace: true,
      searchParams: { servico: query || null },
    });
    window.dispatchEvent(new CustomEvent('observatorio:public-service-search', { detail: query }));
  };

  return (
    <section id="utilidade-publica" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7" aria-labelledby="public-utility-title">
      <div className="public-utility-shell rounded-[28px] border border-white/8 bg-white/[0.02] p-4 sm:p-6 light:border-slate-200 light:bg-slate-50/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300/80 light:text-sky-700">Utilidade pública</div>
            <h2 id="public-utility-title" className="mt-1 text-xl font-black text-white sm:text-2xl light:text-slate-900">Entenda o dado, confira a fonte e encontre o canal certo</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 light:text-slate-600">
              Use os atalhos por necessidade e os três passos abaixo para sair do número e chegar à evidência ou ao serviço oficial sem perder o contexto.
            </p>
          </div>
          <button type="button" onClick={() => goToServices()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.06] px-4 text-sm font-bold text-sky-200 transition hover:bg-sky-300/[0.1] light:text-sky-800">
            Ver serviços e canais oficiais <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6" aria-label="Atalhos por necessidade">
          {quickNeeds.map(({ icon: Icon, label, hint, query }) => (
            <button key={label} type="button" onClick={() => goToServices(query)} className="public-utility-shortcut flex min-h-16 items-center gap-3 rounded-xl border border-white/8 bg-black/10 px-3 py-3 text-left text-slate-200 transition hover:border-sky-300/25 hover:bg-sky-300/[0.06] light:border-slate-200 light:bg-white light:text-slate-800">
              <span className="public-utility-shortcut-icon"><Icon className="h-4 w-4" aria-hidden="true" /></span>
              <span className="min-w-0">
                <strong className="block text-xs font-black leading-4">{label}</strong>
                <small className="mt-1 block text-[10px] font-semibold leading-4 text-slate-500">{hint}</small>
              </span>
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
