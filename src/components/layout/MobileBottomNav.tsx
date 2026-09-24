import { CircleHelp, Compass, FileSearch, FileText, Home, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLanguageMode } from '../../context/LanguageModeContext';

const baseItems = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'descubra', label: 'Explorar', icon: Compass },
  { id: 'eleitoral360', label: 'Eleitoral', icon: Users },
] as const;

const thematicIds = new Set([
  'contexto','demografia','transporte','politica','candidaturas','eleitoral360',
  'linha-do-tempo','orcamento','orcamento-impacto','qualidade','evidencias','acao',
  'instagram','saude','quiz','principios','fontes','dados','eleitorado',
]);

function sectionToTab(id: string) {
  if (id === 'dashboard' || id === 'resumo') return 'dashboard';
  if (id === 'descubra') return 'descubra';
  if (id === 'eleitoral360' || id === 'candidaturas' || id === 'politica' || id === 'eleitorado') return 'eleitoral360';
  if (id === 'dados') return 'dados';
  if (id === 'fontes') return 'fontes';
  if (id === 'quiz') return 'quiz';
  if (thematicIds.has(id)) return 'descubra';
  return 'dashboard';
}

function jump(id: string) {
  window.history.replaceState(null, '', '#' + id);
  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' }));
}

export function MobileBottomNav() {
  const { mode } = useLanguageMode();
  const isTechnical = mode === 'technical';
  const items = isTechnical
    ? [...baseItems, { id: 'dados', label: 'Dados', icon: FileSearch }, { id: 'fontes', label: 'Fontes', icon: FileText }]
    : [...baseItems, { id: 'dados', label: 'Dados', icon: FileSearch }, { id: 'quiz', label: 'Quiz', icon: CircleHelp }];

  const [activeSection, setActiveSection] = useState('dashboard');
  const activeSectionRef = useRef('dashboard');

  useEffect(() => {
    const update = (next: string) => {
      if (activeSectionRef.current === next) return;
      activeSectionRef.current = next;
      setActiveSection(next);
    };
    const onHash = () => update(sectionToTab(window.location.hash.replace(/^#/, '')));
    const onNavigate = (event: Event) => update(sectionToTab((event as CustomEvent<string>).detail));

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) update(sectionToTab(visible.target.id));
    }, { rootMargin:'-12% 0px -72% 0px', threshold:[0.12,0.3,0.6] });

    const nodes = ['dashboard','resumo','descubra','eleitoral360','candidaturas','politica','eleitorado','dados','fontes','quiz','contexto','demografia','transporte','orcamento','saude'];
    nodes.forEach(id => { const node=document.getElementById(id); if(node) observer?.observe(node); });

    window.addEventListener('hashchange', onHash);
    window.addEventListener('observatorio:navigate', onNavigate);
    onHash();

    return () => {
      observer?.disconnect();
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('observatorio:navigate', onNavigate);
    };
  }, []);

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação principal no celular">
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" onClick={() => jump(id)} className={activeSection === id ? 'is-active' : ''} aria-current={activeSection === id ? 'page' : undefined}>
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
