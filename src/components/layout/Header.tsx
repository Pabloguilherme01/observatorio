import { CalendarDays, Command, Moon, Search, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchModal } from './SearchModal';
import { useTheme } from '../../context/ThemeContext';
import { navigation } from '../../config/navigation';
import { LanguageModeToggle } from './LanguageModeToggle';
import { observatorioData as d } from '../../data/observatorioData';
import { formatDate } from '../../utils/formatters';

const primaryNavigationIds = ['descubra', 'dashboard', 'eleitorado', 'transporte', 'orcamento', 'dados', 'acao'] as const;
const primaryNavigation = navigation.filter(item => primaryNavigationIds.includes(item.id as typeof primaryNavigationIds[number]));

export function Header() {
  const { theme, toggle } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchOpen, setSearchOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    const updateObserver = () => {
      const nodes = navigation.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
      if (!nodes.length) return undefined;
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      }, { rootMargin: '-16% 0px -70% 0px', threshold: [0.1, 0.25, 0.5] });
      nodes.forEach(node => observer.observe(node));
      return () => observer.disconnect();
    };
    return updateObserver();
  }, []);

  useEffect(() => {
    const openSearchFromMobile = () => setSearchOpen(true);
    window.addEventListener('observatorio:search', openSearchFromMobile);
    return () => window.removeEventListener('observatorio:search', openSearchFromMobile);
  }, []);

  return (
    <>
      <header className="site-header sticky top-0 z-40 border-b border-white/10 bg-[#0b1117]/90 backdrop-blur-xl light:bg-[#f5f7fa]/95">
        <div className="site-header-inner mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <a href="#dashboard" className="site-brand min-w-0 shrink-0" aria-label="Observatório, início">
            <span className="block truncate text-[13px] font-black tracking-tight text-white light:text-slate-900">Observatório</span>
            <span className="block truncate text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Águas Lindas · 2026</span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Navegação principal">
            {primaryNavigation.map(item => (
              <a key={item.id} href={'#' + item.id} className={'rounded-xl px-3 py-2 text-xs font-semibold transition ' + (activeSection === item.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white')} aria-current={activeSection === item.id ? 'location' : undefined}>
                {item.shortLabel}
              </a>
            ))}
          </nav>

          <div className="site-header-status hidden lg:flex items-center gap-1.5 rounded-full border border-sky-300/10 bg-sky-300/[0.035] px-2.5 py-1.5 text-[10px] font-bold text-slate-500" aria-label={'Dados atualizados em ' + updatedAt}>\n            <CalendarDays className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />\n            <span>Atualizado {updatedAt}</span>\n          </div>\n\n          <div className="site-header-actions ml-auto flex items-center gap-1">
            <button type="button" onClick={() => setSearchOpen(true)} className="site-icon-button min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label="Buscar no observatório">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="hidden md:block"><LanguageModeToggle /></div>
            <button type="button" onClick={toggle} className="site-icon-button min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => setToolsOpen(value => !value)} className="site-tools-button min-h-11 min-w-11 rounded-xl border border-white/10 bg-white/[0.025] p-2 text-slate-300 hover:bg-white/5 md:hidden" aria-expanded={toolsOpen} aria-controls="mobile-tools" aria-label={toolsOpen ? 'Fechar ferramentas' : 'Abrir ferramentas'}>
              {toolsOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <span aria-hidden="true" className="text-[11px] font-black tracking-[.22em]">•••</span>}
            </button>
          </div>
        </div>

        {toolsOpen && (
          <div id="mobile-tools" className="mobile-tools-sheet border-t border-white/10 px-4 py-3 md:hidden" role="region" aria-label="Ferramentas e modo de leitura">
            <div className="mobile-tools-grid">
              <div className="mobile-tools-mode">
                <div className="mobile-tools-meta">\n                  <span className="mobile-tools-label">Leitura</span>\n                  <span className="mobile-tools-updated"><CalendarDays className="h-3 w-3" aria-hidden="true" />Atualizado {updatedAt}</span>\n                </div>
                <LanguageModeToggle />
              </div>
              <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent('observatorio:command')); setToolsOpen(false); }} className="mobile-tool-action">
                <Command className="h-4 w-4" aria-hidden="true" />
                <span>Explorar todas as áreas</span>
              </button>
            </div>
          </div>
        )}
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
