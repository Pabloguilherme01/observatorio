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

function jump(id: string) {
  const reduceMotion = document.documentElement.classList.contains('reduced-motion')
    || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  window.history.replaceState(null, '', '#' + id);

  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    return;
  }

  // Se a seção estiver lazy-loaded, o App carrega o grupo a partir deste evento.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  });
}

function sectionToTab(id: string) {
  if (id === 'dashboard') return 'dashboard';
  if (id === 'descubra') return 'descubra';
  if (id === 'dados' || id === 'fontes') return id;
  return thematicIds.has(id) ? (id === 'dados' ? 'dados' : 'descubra') : 'descubra';
}

export function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const updateFromHash = () => {
      const id = window.location.hash.replace('#', '');
      if (id) setActiveSection(sectionToTab(id));
    };

    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(entries => {
          const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (visible?.target.id) {
            setActiveSection(sectionToTab(visible.target.id));
          }
        }, { rootMargin: '-12% 0px -72% 0px', threshold: [0.12, 0.3, 0.6] });

    const observeVisibleAnchors = () => {
      if (!observer) return;
      const ids = ['dashboard', 'descubra', 'dados', 'fontes', ...thematicIds];
      ids.forEach(id => {
        const node = document.getElementById(id);
        if (node) observer.observe(node);
      });
    };

    updateFromHash();
    observeVisibleAnchors();

    const onNavigate = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      setActiveSection(sectionToTab(id));
      // Lazy sections are inserted after the navigation event.
      requestAnimationFrame(observeVisibleAnchors);
      requestAnimationFrame(() => requestAnimationFrame(observeVisibleAnchors));
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
        <button
          key={id}
          type="button"
          onClick={() => jump(id)}
          className={activeSection === id ? 'is-active' : ''}
          aria-current={activeSection === id ? 'location' : undefined}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:search'))} aria-label="Buscar no observatório">
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Buscar</span>
      </button>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))} aria-label="Abrir mais áreas e ferramentas">
        <Menu className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Mais</span>
      </button>
    </nav>
  );
}
