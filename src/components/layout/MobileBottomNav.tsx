import { CircleHelp, Compass, LayoutDashboard, MoreHorizontal, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { navigation } from '../../config/navigation';

const primaryItems = [
  { id: 'descubra', label: 'Explorar', icon: Compass },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'eleitoral360', label: 'Eleições', icon: Users },
] as const;

const sectionToTab = (id: string) => {
  if (id === 'resumo' || id === 'dashboard' || id === 'analise') return 'dashboard';
  if (id === 'descubra') return 'descubra';
  if (id === 'eleitoral360' || id === 'candidaturas' || id === 'politica' || id === 'eleitorado') return 'eleitoral360';
  if (id === 'quiz') return 'quiz';
  return 'more';
};

function jump(id: string) {
  window.history.replaceState(null, '', '#' + id);
  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  window.requestAnimationFrame(() => {
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    if (node instanceof HTMLElement) {
      if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
      window.setTimeout(() => node.focus({ preventScroll: true }), 180);
    }
  });
}

export function MobileBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
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
    const onOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      const menu = document.getElementById('mobile-bottom-more');
      const button = document.getElementById('mobile-bottom-more-trigger');
      if (menu?.contains(event.target) || button?.contains(event.target)) return;
      setMoreOpen(false);
    };

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) update(sectionToTab(visible.target.id));
    }, { rootMargin: '-12% 0px -72% 0px', threshold: [0.12, 0.3, 0.6] });

    const observeNavigationNodes = () => {
      navigation.forEach(item => {
        const node = document.getElementById(item.id);
        if (node) observer?.observe(node);
      });
      ['resumo', 'analise'].forEach(id => {
        const node = document.getElementById(id);
        if (node) observer?.observe(node);
      });
    };
    observeNavigationNodes();

    const root = document.getElementById('main-content') ?? document.body;
    const mutationObserver = typeof MutationObserver === 'undefined' ? null : new MutationObserver(observeNavigationNodes);
    mutationObserver?.observe(root, { childList: true, subtree: true });

    window.addEventListener('hashchange', onHash);
    window.addEventListener('observatorio:navigate', onNavigate);
    document.addEventListener('click', onOutside);
    onHash();

    return () => {
      observer?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('observatorio:navigate', onNavigate);
      document.removeEventListener('click', onOutside);
    };
  }, []);

  const moreItems = navigation.filter(item => item.group === 'more');
  const quizItem = navigation.find(item => item.id === 'quiz');

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação principal no celular">
      {primaryItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => { setMoreOpen(false); jump(id); }}
          className={activeSection === id ? 'is-active' : ''}
          aria-current={activeSection === id ? 'page' : undefined}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
      {quizItem && (
        <button
          type="button"
          onClick={() => { setMoreOpen(false); jump(quizItem.id); }}
          className={activeSection === 'quiz' ? 'is-active' : ''}
          aria-current={activeSection === 'quiz' ? 'page' : undefined}
        >
          <CircleHelp className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span>Quiz</span>
        </button>
      )}
      <div className="relative">
        <button
          id="mobile-bottom-more-trigger"
          type="button"
          onClick={() => setMoreOpen(value => !value)}
          className={'w-full ' + (moreOpen || activeSection === 'more' ? 'is-active' : '')}
          aria-expanded={moreOpen}
          aria-controls="mobile-bottom-more"
          aria-current={activeSection === 'more' ? 'page' : undefined}
        >
          <MoreHorizontal className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span>Mais</span>
        </button>
        {moreOpen && (
          <div id="mobile-bottom-more" className="mobile-bottom-more-menu" role="menu" aria-label="Mais áreas do observatório">
            {moreItems.map(item => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => { setMoreOpen(false); jump(item.id); }}
              >
                <span>{item.shortLabel}</span>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
