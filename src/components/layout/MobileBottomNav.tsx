import { BookOpen, Compass, FileSearch, Home, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const items = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'eleitoral360', label: 'Eleitoral', icon: Users },
  { id: 'descubra', label: 'Explorar', icon: Compass },
  { id: 'dados', label: 'Dados', icon: BookOpen },
  { id: 'fontes', label: 'Fontes', icon: FileSearch },
] as const;

const thematicIds = new Set([
  'contexto', 'eleitorado', 'demografia', 'transporte', 'politica',
  'candidaturas', 'eleitoral360', 'linha-do-tempo', 'orcamento',
  'orcamento-impacto', 'qualidade', 'evidencias', 'acao', 'instagram',
  'saude', 'quiz', 'principios',
]);

function sectionToTab(id: string) {
  if (id === 'dashboard' || id === 'resumo') return 'dashboard';
  if (id === 'descubra') return 'descubra';
  if (id === 'eleitoral360' || id === 'candidaturas' || id === 'politica') return 'eleitoral360';
  if (id === 'dados' || id === 'eleitorado') return 'dados';
  if (id === 'fontes') return 'fontes';
  if (thematicIds.has(id)) return 'descubra';
  return 'dashboard';
}

function jump(id: string) {
  window.history.replaceState(null, '', '#' + id);
  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
}

export function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const activeSectionRef = useRef('dashboard');

  useEffect(() => {
    const updateActiveSection = (next: string) => {
      if (activeSectionRef.current === next) return;
      activeSectionRef.current = next;
      setActiveSection(next);
    };
    const updateFromHash = () => {
      const id = window.location.hash.replace(/^#/, '');
      if (id) updateActiveSection(sectionToTab(id));
    };

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      let visible: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting || (visible && entry.intersectionRatio <= visible.intersectionRatio)) continue;
        visible = entry;
      }
      if (visible?.target.id) updateActiveSection(sectionToTab(visible.target.id));
    }, { rootMargin: '-12% 0px -72% 0px', threshold: [0.12, 0.3, 0.6] });

    const targetIds = new Set(['dashboard', 'resumo', 'descubra', 'eleitoral360', 'candidaturas', 'politica', 'dados', 'fontes', ...thematicIds]);
    const observedNodes = new WeakSet<Element>();
    const observedIds = new Set<string>();
    let mutations: MutationObserver | null = null;

    const observe = () => {
      if (!observer) return;
      targetIds.forEach(id => {
        const node = document.getElementById(id);
        if (node && !observedNodes.has(node)) {
          observedNodes.add(node);
          observedIds.add(id);
          observer.observe(node);
        }
      });
      if (observedIds.size === targetIds.size) mutations?.disconnect();
    };

    let observeRaf = 0;
    const scheduleObserve = () => {
      if (observeRaf || !observer) return;
      observeRaf = window.requestAnimationFrame(() => {
        observeRaf = 0;
        observe();
      });
    };

    mutations = typeof MutationObserver === 'undefined' ? null : new MutationObserver(scheduleObserve);

    updateFromHash();
    observe();
    mutations?.observe(document.getElementById('main-content') ?? document.body, {
      childList: true,
      subtree: true,
    });

    const onNavigate = (event: Event) => {
      updateActiveSection(sectionToTab((event as CustomEvent<string>).detail));
      scheduleObserve();
    };

    window.addEventListener('hashchange', updateFromHash);
    window.addEventListener('observatorio:navigate', onNavigate);
    return () => {
      observer?.disconnect();
      mutations?.disconnect();
      if (observeRaf) window.cancelAnimationFrame(observeRaf);
      window.removeEventListener('hashchange', updateFromHash);
      window.removeEventListener('observatorio:navigate', onNavigate);
    };
  }, []);

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação rápida no celular" data-mobile-nav="primary">
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" onClick={() => jump(id)} className={activeSection === id ? 'is-active' : ''} aria-current={activeSection === id ? 'page' : undefined} aria-label={label === 'Início' ? 'Ir para o início e resumo' : label === 'Eleitoral' ? 'Abrir candidatos e dados eleitorais' : label === 'Explorar' ? 'Explorar assuntos do observatório' : label === 'Dados' ? 'Abrir dados públicos' : 'Abrir fontes'} title={label}>
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
