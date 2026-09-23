import { BookOpen, Compass, FileSearch, Home, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const items = [
  { id: 'dashboard', label: 'Início', icon: Home },
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
  if (id === 'dashboard') return 'dashboard';
  if (id === 'descubra') return 'descubra';
  if (id === 'dados') return 'dados';
  if (id === 'fontes') return 'fontes';
  return thematicIds.has(id) ? 'descubra' : 'descubra';
}

function jump(id: string) {
  window.history.replaceState(null, '', '#' + id);
  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  window.requestAnimationFrame(() => {
    const target = document.getElementById(id);
    if (!target) return;
    const reduceMotion = document.documentElement.classList.contains('reduced-motion')
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
}

export function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const updateFromHash = () => {
      const id = window.location.hash.replace(/^#/, '');
      if (id) setActiveSection(sectionToTab(id));
    };

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(sectionToTab(visible.target.id));
    }, { rootMargin: '-12% 0px -72% 0px', threshold: [0.12, 0.3, 0.6] });

    const observe = () => {
      if (!observer) return;
      ['dashboard', 'descubra', 'dados', 'fontes', ...thematicIds].forEach(id => {
        const node = document.getElementById(id);
        if (node) observer.observe(node);
      });
    };

    updateFromHash();
    observe();

    const onNavigate = (event: Event) => {
      setActiveSection(sectionToTab((event as CustomEvent<string>).detail));
      requestAnimationFrame(observe);
    };

    window.addEventListener('hashchange', updateFromHash);
    window.addEventListener('observatorio:navigate', onNavigate);
    return () => {
      observer?.disconnect();
      window.removeEventListener('hashchange', updateFromHash);
      window.removeEventListener('observatorio:navigate', onNavigate);
    };
  }, []);

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação rápida no celular">
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" onClick={() => jump(id)} className={activeSection === id ? 'is-active' : ''} aria-current={activeSection === id ? 'location' : undefined}>
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:search'))} className="mobile-bottom-search" aria-label="Buscar no observatório">
        <Search className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        <span>Buscar</span>
      </button>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))} className="mobile-bottom-more" aria-label="Abrir todas as áreas e ferramentas">
        <Menu className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        <span>Mais</span>
      </button>
    </nav>
  );
}
