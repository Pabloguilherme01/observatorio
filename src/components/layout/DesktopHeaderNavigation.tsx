import { useEffect, useRef, useState } from 'react';
import { navigation } from '../../config/navigation';

const primaryNavigationIds = ['descubra', 'dashboard', 'eleitoral360'] as const;
const primaryNavigation = navigation.filter(item => primaryNavigationIds.includes(item.id as typeof primaryNavigationIds[number]));
const moreNavigation = navigation.filter(item => !primaryNavigationIds.includes(item.id as typeof primaryNavigationIds[number]));

interface DesktopHeaderNavigationProps {
  readonly activeSection: string;
}

export function DesktopHeaderNavigation({ activeSection }: DesktopHeaderNavigationProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreOpenRef = useRef(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreActive = moreNavigation.some(item => item.id === activeSection);

  useEffect(() => {
    moreOpenRef.current = moreOpen;
  }, [moreOpen]);

  useEffect(() => {
    const onDocumentPointer = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      const target = event.target as HTMLElement;
      if (moreOpenRef.current && !target.closest('[aria-haspopup="menu"]') && !target.closest('[role="menu"]')) {
        setMoreOpen(false);
        window.requestAnimationFrame(() => moreButtonRef.current?.focus());
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!moreOpenRef.current) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMoreOpen(false);
        window.requestAnimationFrame(() => moreButtonRef.current?.focus());
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const items = Array.from(document.querySelectorAll<HTMLElement>('#desktop-more-menu [role="menuitem"]'));
      if (!items.length) return;
      event.preventDefault();
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    };

    document.addEventListener('mousedown', onDocumentPointer);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentPointer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Navegação principal">
      {primaryNavigation.map(item => (
        <a
          key={item.id}
          href={'#' + item.id}
          className={'rounded-xl px-3 py-2 text-xs font-semibold transition ' + (activeSection === item.id ? 'bg-white/10 text-white light:bg-slate-900/8 light:text-slate-900' : 'text-slate-400 hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-900/5 light:hover:text-slate-900')}
          aria-current={activeSection === item.id ? 'page' : undefined}
        >
          {item.shortLabel}
        </a>
      ))}
      <div className="relative">
        <button
          ref={moreButtonRef}
          type="button"
          onClick={() => setMoreOpen(value => !value)}
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
            if (event.key === 'Enter' || event.key === ' ') {
              if (moreOpen) return;
              event.preventDefault();
            } else {
              event.preventDefault();
            }
            setMoreOpen(true);
            window.requestAnimationFrame(() => {
              const items = Array.from(document.querySelectorAll<HTMLElement>('#desktop-more-menu [role="menuitem"]'));
              (event.key === 'ArrowUp' ? items.at(-1) : items[0])?.focus();
            });
          }}
          className={'rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-2 ' + (moreActive ? 'bg-white/10 text-white light:bg-slate-900/8 light:text-slate-900' : 'text-slate-400 hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-900/5 light:hover:text-slate-900')}
          aria-expanded={moreOpen}
          aria-current={moreActive ? 'page' : undefined}
          aria-haspopup="menu"
          aria-controls="desktop-more-menu"
        >
          Mais
        </button>
        {moreOpen && (
          <div id="desktop-more-menu" className="absolute right-0 top-full z-50 mt-2 grid max-h-[min(70vh,560px)] w-64 gap-1 overflow-auto rounded-2xl border border-white/10 bg-[#0f1822]/98 p-2 shadow-2xl" role="menu" aria-label="Mais áreas do observatório">
            {moreNavigation.map(item => (
              <a
                key={item.id}
                href={'#' + item.id}
                role="menuitem"
                onClick={() => setMoreOpen(false)}
                className={'rounded-xl px-3 py-2.5 text-left text-xs transition focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-2 ' + (activeSection === item.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white')}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <span className="block font-bold">{item.shortLabel}</span>
                <span className="mt-0.5 block text-[10px] text-slate-500">{item.description}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
