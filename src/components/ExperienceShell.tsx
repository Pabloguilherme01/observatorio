import { ArrowRight, BusFront, Command, Compass, Droplets, LayoutDashboard, Search, Sparkles, Vote, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { navigation, type NavigationId } from '../config/navigation';
import { MobileBottomNav } from './layout/MobileBottomNav';
import { STORAGE_NAMESPACE } from '../config/version';

const RECENT_KEY = `${STORAGE_NAMESPACE}-recent-sections`, FAVORITES_KEY = `${STORAGE_NAMESPACE}-favorite-sections`, REDUCED_KEY = `${STORAGE_NAMESPACE}-reduced-motion`, MODE_KEY = `${STORAGE_NAMESPACE}-experience-mode`, ELECTION_KEY = `${STORAGE_NAMESPACE}-election-mode`;
type ExperienceMode = 'overview' | 'investigation' | 'evidence';
const MODE_LABELS: Record<ExperienceMode, string> = { overview: 'Visão geral', investigation: 'Investigação', evidence: 'Evidências' };

function readStorage(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key: string, value: string): void { try { localStorage.setItem(key, value); } catch {} }
function readList(key: string): string[] { try { const value = JSON.parse(readStorage(key) ?? '[]'); return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []; } catch { return []; } }
function jump(id: string) {
  window.history.replaceState(null, '', '#' + id);
  window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
}

export function ExperienceShell({ children }: { readonly children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false), [helpOpen, setHelpOpen] = useState(false), [query, setQuery] = useState(''), [progress, setProgress] = useState(0), [recent, setRecent] = useState<string[]>([]), [favorites, setFavorites] = useState<string[]>([]), [reducedMotion, setReducedMotion] = useState(false), [mode, setMode] = useState<ExperienceMode>('overview'), [electionMode, setElectionModeState] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null), modalRef = useRef<HTMLDivElement>(null), openerRef = useRef<HTMLElement | null>(null), pendingG = useRef(false), pendingGTimerRef = useRef<number | null>(null), focusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setRecent(readList(RECENT_KEY)); setFavorites(readList(FAVORITES_KEY)); const reduced = readStorage(REDUCED_KEY) === '1'; setReducedMotion(reduced); document.documentElement.classList.toggle('reduced-motion', reduced); const electionStored = readStorage(ELECTION_KEY) === '1'; setElectionModeState(electionStored); document.documentElement.classList.toggle('mode-election', electionStored); const storedMode = readStorage(MODE_KEY) as ExperienceMode | null; const initialMode: ExperienceMode = storedMode === 'overview' || storedMode === 'investigation' || storedMode === 'evidence' ? storedMode : 'overview'; setMode(initialMode); document.documentElement.dataset.experienceMode = initialMode; document.documentElement.classList.remove('mode-overview','mode-investigation','mode-evidence'); document.documentElement.classList.add('mode-' + initialMode);
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
        scrollRaf = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onNavigate = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (navigation.some(item => item.id === id)) remember(id);
    };
    const onHashChange = () => {
      const id = window.location.hash.replace('#', '');
      if (navigation.some(item => item.id === id)) remember(id);
    };
    if (window.location.hash) onHashChange();
    window.addEventListener('observatorio:navigate', onNavigate);
    window.addEventListener('hashchange', onHashChange);
    const onOpen = () => { openerRef.current = document.activeElement as HTMLElement; setCommandOpen(true); };
    const onElection = (event: Event) => { const next = (event as CustomEvent<boolean>).detail; setElectionModeState(next); writeStorage(ELECTION_KEY, next ? '1' : '0'); document.documentElement.classList.toggle('mode-election', next); window.dispatchEvent(new CustomEvent('observatorio:election-mode-changed', { detail: next })); };
    window.addEventListener('observatorio:command', onOpen);
    window.addEventListener('observatorio:election-mode', onElection as EventListener);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      window.removeEventListener('observatorio:command', onOpen);
      window.removeEventListener('observatorio:election-mode', onElection as EventListener);
      window.removeEventListener('observatorio:navigate', onNavigate);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const activeModal = commandOpen || helpOpen;
  useEffect(() => {
    const onMode = (event: Event) => {
      const next = (event as CustomEvent<ExperienceMode>).detail;
      if (next === 'overview' || next === 'investigation' || next === 'evidence') setExperienceMode(next);
    };
    window.addEventListener('observatorio:mode', onMode as EventListener);
    return () => window.removeEventListener('observatorio:mode', onMode as EventListener);
  }, []);
  useEffect(() => {
    if (!activeModal) {
      if (focusTimerRef.current) { window.clearTimeout(focusTimerRef.current); focusTimerRef.current = null; }
      const opener = openerRef.current;
      if (opener && opener.isConnected) window.requestAnimationFrame(() => opener.focus({ preventScroll: true }));
      openerRef.current = null;
      document.body.style.removeProperty('overflow');
      return;
    }
    setQuery('');
    if (window.matchMedia?.('(max-width: 767px)').matches) document.body.style.overflow = 'hidden';
    const isCompactViewport = window.matchMedia?.('(max-width: 767px)').matches;
    if (!isCompactViewport) {
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
      focusTimerRef.current = window.setTimeout(() => {
        focusTimerRef.current = null;
        (commandOpen ? inputRef.current : modalRef.current?.querySelector<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])'))?.focus();
      }, 0);
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setCommandOpen(false); setHelpOpen(false); return; }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusables = Array.from(modalRef.current.querySelectorAll<HTMLElement>('button,input,[href],[tabindex]:not([tabindex="-1"])')).filter(node => !node.hasAttribute('disabled'));
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (focusTimerRef.current) { window.clearTimeout(focusTimerRef.current); focusTimerRef.current = null; }
      document.body.style.removeProperty('overflow');
    };
  }, [activeModal, commandOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null, typing = !!target && ['INPUT','TEXTAREA','SELECT'].includes(target.tagName), modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'k') { event.preventDefault(); openerRef.current = document.activeElement as HTMLElement; setCommandOpen(true); return; }
      if (event.key === 'Escape') { setCommandOpen(false); setHelpOpen(false); return; }
      if (typing || activeModal) return;
      if (event.key === '?') { event.preventDefault(); openerRef.current = document.activeElement as HTMLElement; setHelpOpen(true); return; }
      if (event.key.toLowerCase() === 'g') {
        pendingG.current = true;
        if (pendingGTimerRef.current) window.clearTimeout(pendingGTimerRef.current);
        pendingGTimerRef.current = window.setTimeout(() => { pendingG.current = false; pendingGTimerRef.current = null; }, 900);
        return;
      }
      if (pendingG.current) {
        const map: Record<string, NavigationId> = { d:'dashboard',c:'contexto',e:'eleitorado',t:'transporte',p:'politica',x:'eleitoral360',o:'orcamento',a:'dados',q:'qualidade',f:'fontes',v:'evidencias',u:'acao',l:'linha-do-tempo',r:'descubra',s:'instagram',n:'principios' };
        const id = map[event.key.toLowerCase()]; pendingG.current = false; if (id) { event.preventDefault(); jump(id); remember(id); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (pendingGTimerRef.current) { window.clearTimeout(pendingGTimerRef.current); pendingGTimerRef.current = null; }
      pendingG.current = false;
    };
  }, [activeModal]);

  const setExperienceMode = (next: ExperienceMode) => { setMode(next); writeStorage(MODE_KEY, next); document.documentElement.dataset.experienceMode = next; document.documentElement.classList.remove('mode-overview','mode-investigation','mode-evidence'); document.documentElement.classList.add('mode-' + next); window.dispatchEvent(new CustomEvent('observatorio:mode-changed', { detail: next })); };
  const setElectionMode = (next: boolean) => { setElectionModeState(next); writeStorage(ELECTION_KEY, next ? '1' : '0'); document.documentElement.classList.toggle('mode-election', next); window.dispatchEvent(new CustomEvent('observatorio:election-mode-changed', { detail: next })); };

  const remember = (id: string) => { setRecent(current => { const next = [id,...current.filter(item => item !== id)].slice(0,5); writeStorage(RECENT_KEY, JSON.stringify(next)); return next; }); };
  const toggleFavorite = (id: string) => { setFavorites(current => { const next = current.includes(id) ? current.filter(item => item !== id) : [...current,id].slice(-6); writeStorage(FAVORITES_KEY, JSON.stringify(next)); return next; }); };
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return navigation;
    return navigation.filter(item => [item.label,item.description,item.shortcut].some(value => value.toLocaleLowerCase('pt-BR').includes(normalized)));
  }, [query]);

  return <>
    <div className="reading-progress" style={{ width: progress + '%' }} aria-hidden="true" />
    {children}
    <MobileBottomNav />
    {commandOpen && <div className="command-overlay" role="dialog" aria-modal="true" aria-labelledby="command-title"><button className="command-backdrop" type="button" aria-label="Fechar central de comandos" onClick={() => setCommandOpen(false)} /><div ref={modalRef} className="command-panel"><div className="flex items-center gap-3 border-b border-white/10 px-4 py-3"><Search className="h-4 w-4 text-slate-500" aria-hidden="true" /><input ref={inputRef} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar uma área do observatório…" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" aria-label="Buscar uma área do observatório" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} inputMode="search" /><kbd>Esc</kbd></div><div className="px-4 pt-4"><div id="command-title" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"><Compass className="h-3.5 w-3.5" aria-hidden="true" /> Explorar</div>{!query && recent.length > 0 && <div className="mb-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Retomar leitura</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {recent.slice(0, 4).map(id => {
            const item = navigation.find(entry => entry.id === id);
            if (!item) return null;
            return <button key={id} type="button" className="shortcut-row" onClick={() => { jump(id); remember(id); setCommandOpen(false); }}>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
              <ArrowRight className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </button>;
          })}
        </div>
      </div>}<div className="mt-3 grid gap-2 sm:grid-cols-2">{results.map(item=><div key={item.id} className="command-item"><button type="button" onClick={()=>{jump(item.id);remember(item.id);setCommandOpen(false)}}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-300/10 text-sky-200"><Sparkles className="h-4 w-4" aria-hidden="true"/></span><span className="min-w-0 text-left"><strong>{item.label}</strong><small>{item.description}</small></span></button><button type="button" className="favorite-btn" onClick={()=>toggleFavorite(item.id)} aria-label={(favorites.includes(item.id)?'Remover ':'Fixar ')+item.label}>{favorites.includes(item.id)?'★':'☆'}</button></div>)}</div></div><div className="border-t border-white/10 px-4 py-3 text-xs text-slate-600"><span>Ctrl/⌘ K</span> comandos · <span>?</span> atalhos · <span>G + tecla</span> navegação rápida · <span>Modo</span> {MODE_LABELS[mode]}</div></div></div>}
    {helpOpen && <div className="command-overlay" role="dialog" aria-modal="true" aria-labelledby="shortcut-title"><button className="command-backdrop" type="button" aria-label="Fechar atalhos" onClick={()=>setHelpOpen(false)} /><div ref={modalRef} className="command-panel max-w-lg"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Navegação</div><h2 id="shortcut-title" className="mt-1 text-lg font-black text-white">Atalhos personalizados</h2></div><button type="button" onClick={()=>setHelpOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Fechar"><X className="h-4 w-4"/></button></div><div className="grid gap-2 p-4 sm:grid-cols-2">{navigation.map(item=><button key={item.id} type="button" onClick={()=>{jump(item.id);remember(item.id);setHelpOpen(false)}} className="shortcut-row"><span><strong>{item.label}</strong><small>{item.description}</small></span><kbd>{item.shortcut}</kbd></button>)}</div><div className="border-t border-white/10 p-4"><label className="flex items-center justify-between gap-4 text-xs text-slate-400"><span>Reduzir animações</span><input type="checkbox" checked={reducedMotion} onChange={event=>{const value=event.target.checked;setReducedMotion(value);writeStorage(REDUCED_KEY,value?'1':'0');document.documentElement.classList.toggle('reduced-motion',value)}} /></label><p className="mt-2 text-[11px] leading-5 text-slate-600">Atalhos de uma tecla ficam ativos somente fora de campos de entrada.</p></div></div></div>}
  </>;
}
