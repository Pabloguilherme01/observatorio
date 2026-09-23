import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchModal } from './SearchModal';
import { useTheme } from '../../context/ThemeContext';

const links = [
  ['Dashboard', 'dashboard'],
  ['Eleitorado', 'eleitorado'],
  ['Transporte', 'transporte'],
  ['Política', 'politica'],
  ['Orçamento', 'orcamento'],
  ['Dados', 'dados'],
  ['Fontes', 'fontes'],
] as const;

export function Header() {
  const { theme, toggle } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observedIds = links.map(([, id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!observedIds.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-18% 0px -68% 0px', threshold: [0.1, 0.25, 0.5] });
    observedIds.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1117]/85 backdrop-blur-xl light:bg-[#f5f7fa]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#" className="min-w-0" aria-label="Observatório Eleitoral, início">
            <span className="block truncate text-sm font-black tracking-tight text-white light:text-slate-900">Observatório</span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Águas Lindas · 2026</span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
            {links.map(([label, id]) => (
              <a key={id} href={`#${id}`} className={"rounded-xl px-3 py-2 text-xs font-semibold transition " + (activeSection === id ? "bg-white/10 text-white light:bg-slate-900/10 light:text-slate-900" : "text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900")}
                aria-current={activeSection === id ? "location" : undefined}>
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setSearchOpen(true)} className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label="Buscar no observatório">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={toggle} className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-900/5 light:hover:text-slate-900" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => setMenuOpen(value => !value)} className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}>
              {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-navigation" className="border-t border-white/10 px-4 py-2 lg:hidden" aria-label="Navegação móvel">
            {links.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className={'block rounded-xl px-3 py-3 text-sm font-semibold transition ' + (activeSection === id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white')} aria-current={activeSection === id ? 'location' : undefined}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
