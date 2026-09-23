import { Command, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchModal } from './SearchModal';
import { useTheme } from '../../context/ThemeContext';
import { navigation } from '../../config/navigation';
import { LanguageModeToggle } from './LanguageModeToggle';

const primaryNavigationIds = ['descubra', 'dashboard', 'eleitorado', 'transporte', 'orcamento', 'dados', 'acao'] as const;
const primaryNavigation = navigation.filter(item => primaryNavigationIds.includes(item.id as typeof primaryNavigationIds[number]));
const secondaryNavigation = navigation.filter(item => !primaryNavigationIds.includes(item.id as typeof primaryNavigationIds[number]));

export function Header() {
  const { theme, toggle } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observed = navigation.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    if (!observed.length) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-16% 0px -70% 0px', threshold: [0.1, 0.25, 0.5] });
    observed.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const openCommands = () => window.dispatchEvent(new CustomEvent('observatorio:command'));

  useEffect(() => {
    const openSearchFromMobile = () => setSearchOpen(true);
    window.addEventListener('observatorio:search', openSearchFromMobile);
    return () => window.removeEventListener('observatorio:search', openSearchFromMobile);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1117]/82 backdrop-blur-xl light:bg-[#f5f7fa]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#dashboard" className="min-w-0" aria-label="Observatório, início">
            <span className="block truncate text-sm font-black tracking-tight text-white light:text-slate-900">Observatório</span>
            <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Águas Lindas · 2026</span>
          </a>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegação principal">
            {primaryNavigation.map(item => (
              <a key={item.id} href={'#' + item.id} className={'rounded-xl px-3 py-2 text-xs font-semibold transition ' + (activeSection === item.id ? 'bg-white/10 text-white light:bg-slate-900/10 light:text-slate-900' : 'text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900')} aria-current={activeSection === item.id ? 'location' : undefined}>
                {item.shortLabel}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" onClick={openCommands} className="hidden min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white md:flex" aria-label="Abrir atalhos e navegação">
              <Command className="h-4 w-4" aria-hidden="true" /><span>Atalhos</span><kbd>⌘K</kbd>
            </button>
            <button type="button" onClick={() => setSearchOpen(true)} className="min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label="Abrir busca">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="hidden sm:block"><LanguageModeToggle /></div>
            <button type="button" onClick={toggle} className="min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => setMenuOpen(value => !value)} className="hidden min-h-11 min-w-11 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white sm:flex lg:hidden" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}>
              {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && <nav id="mobile-navigation" className="border-t border-white/10 px-4 py-2 sm:hidden lg:hidden" aria-label="Navegação móvel">
          <div className="grid gap-1">
            {primaryNavigation.map(item => item && <a key={item.id} href={'#' + item.id} onClick={() => setMenuOpen(false)} className={'block rounded-xl px-3 py-3 text-sm font-semibold transition ' + (activeSection === item.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white')} aria-current={activeSection === item.id ? 'location' : undefined}>{item.label}</a>)}
          </div>
          <details className="mobile-secondary-nav mt-2 border-t border-white/10 pt-2">
            <summary className="cursor-pointer list-none rounded-xl px-3 py-3 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white">Mais áreas</summary>
            <div className="mt-1 grid gap-1 pb-2">
              {secondaryNavigation.map(item => <a key={item.id} href={'#' + item.id} onClick={() => setMenuOpen(false)} className={'block rounded-xl px-3 py-3 text-sm font-semibold transition ' + (activeSection === item.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white')} aria-current={activeSection === item.id ? 'location' : undefined}>{item.label}</a>)}
            </div>
          </details>
        </nav>}
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
