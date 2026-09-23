import { Compass, FileSearch, Home, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const items = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'descubra', label: 'Explorar', icon: Compass },
  { id: 'fontes', label: 'Fontes', icon: FileSearch },
] as const;

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', '#' + id);
  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
}

export function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const observedIds = ['dashboard', 'descubra', 'fontes'];
    const thematicIds = new Set(['contexto', 'eleitorado', 'demografia', 'transporte', 'politica', 'eleitoral360', 'linha-do-tempo', 'orcamento', 'orcamento-impacto', 'dados', 'qualidade', 'evidencias', 'acao', 'instagram']);
    const observed = observedIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const updateFromHash = () => {
      const id = window.location.hash.replace('#', '');
      if (observedIds.includes(id)) setActiveSection(id);
      else if (thematicIds.has(id)) setActiveSection('descubra');
    };
    updateFromHash();
    if (!observed.length) return () => window.removeEventListener('hashchange', updateFromHash);

    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-12% 0px -72% 0px', threshold: [0.12, 0.3, 0.6] });

    observed.forEach(node => observer.observe(node));
    const onNavigate = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (observedIds.includes(id)) setActiveSection(id);
      else if (thematicIds.has(id)) setActiveSection('descubra');
    };
    window.addEventListener('hashchange', updateFromHash);
    window.addEventListener('observatorio:navigate', onNavigate);
    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', updateFromHash);
      window.removeEventListener('observatorio:navigate', onNavigate);
    };
  }, []);

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação rápida no celular">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => jump(id)}
          className={activeSection === id ? 'is-active' : ''}
          aria-current={activeSection === id ? 'page' : undefined}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:search'))} aria-label="Buscar no observatório">
        <Search className="h-4 w-4" aria-hidden="true" />
        <span>Buscar</span>
      </button>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))} aria-label="Abrir mais áreas e ferramentas">
        <Menu className="h-4 w-4" aria-hidden="true" />
        <span>Mais</span>
      </button>
    </nav>
  );
}
