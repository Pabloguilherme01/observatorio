import { Command, Compass, History, Keyboard, Search, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { navigation, type NavigationId } from '../config/navigation';

const RECENT_KEY = 'observatorio-recent-sections', FAVORITES_KEY = 'observatorio-favorite-sections', REDUCED_KEY = 'observatorio-reduced-motion';
const quick = navigation.slice(0, 6);

function readList(key: string): string[] { try { const value = JSON.parse(localStorage.getItem(key) ?? '[]'); return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []; } catch { return []; } }
function jump(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.history.replaceState(null, '', '#' + id); window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id })); }

export function ExperienceShell({ children }: { readonly children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false), [helpOpen, setHelpOpen] = useState(false), [query, setQuery] = useState(''), [progress, setProgress] = useState(0), [recent, setRecent] = useState<string[]>([]), [favorites, setFavorites] = useState<string[]>([]), [reducedMotion, setReducedMotion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null), modalRef = useRef<HTMLDivElement>(null), openerRef = useRef<HTMLElement | null>(null), pendingG = useRef(false);

  useEffect(() => {
    setRecent(readList(RECENT_KEY)); setFavorites(readList(FAVORITES_KEY)); const reduced = localStorage.getItem(REDUCED_KEY) === '1'; setReducedMotion(reduced); document.documentElement.classList.toggle('reduced-motion', reduced);
    const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    const onOpen = () => { openerRef.current = document.activeElement as HTMLElement; setCommandOpen(true); };
    window.addEventListener('observatorio:command', onOpen);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('observatorio:command', onOpen); };
  }, []);

  const activeModal = commandOpen || helpOpen;
  useEffect(() => {
    if (!activeModal) { openerRef.current?.focus?.(); return; }
    setQuery('');
    window.setTimeout(() => (commandOpen ? inputRef.current : modalRef.current?.querySelector<HTMLElement>('button,input,[href],[tabindex]:not([tabindex="-1"])'))?.focus(), 0);
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
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal, commandOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null, typing = !!target && ['INPUT','TEXTAREA','SELECT'].includes(target.tagName), modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'k') { event.preventDefault(); openerRef.current = document.activeElement as HTMLElement; setCommandOpen(true); return; }
      if (event.key === 'Escape') { setCommandOpen(false); setHelpOpen(false); return; }
      if (typing || activeModal) return;
      if (event.key === '?') { event.preventDefault(); openerRef.current = document.activeElement as HTMLElement; setHelpOpen(true); return; }
      if (event.key.toLowerCase() === 'g') { pendingG.current = true; window.setTimeout(() => { pendingG.current = false; }, 900); return; }
      if (pendingG.current) {
        const map: Record<string, NavigationId> = { d:'dashboard',e:'eleitorado',t:'transporte',p:'politica',x:'eleitoral360',o:'orcamento',a:'dados',q:'qualidade',f:'fontes',l:'linha-do-tempo' };
        const id = map[event.key.toLowerCase()]; pendingG.current = false; if (id) { event.preventDefault(); jump(id); remember(id); }
      }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [activeModal]);

  const remember = (id: string) => { setRecent(current => { const next = [id,...current.filter(item => item !== id)].slice(0,5); localStorage.setItem(RECENT_KEY, JSON.stringify(next)); return next; }); };
  const toggleFavorite = (id: string) => { setFavorites(current => { const next = current.includes(id) ? current.filter(item => item !== id) : [...current,id].slice(-6); localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); return next; }); };
  const results = useMemo(() => { const normalized = query.trim().toLocaleLowerCase('pt-BR'); if (!normalized) return navigation; return navigation.filter(item => [item.label,item.description,item.shortcut].some(value => value.toLocaleLowerCase('pt-BR').includes(normalized))); }, [query]);
  const currentLabel = recent[0] ? navigation.find(item => item.id === recent[0])?.label : null;

  return <>
    <div className="reading-progress" style={{ width: progress + '%' }} aria-hidden="true" />
    {children}
    <div className="quick-dock" aria-label="Acesso rápido"><button type="button" onClick={() => { openerRef.current=document.activeElement as HTMLElement; setCommandOpen(true); }} title="Central de comandos · Ctrl K" aria-label="Abrir central de comandos"><Command className="h-4 w-4" aria-hidden="true" /><span className="quick-dock-label">Comandos</span></button><button type="button" onClick={() => { openerRef.current=document.activeElement as HTMLElement; setHelpOpen(true); }} title="Atalhos · ?" aria-label="Ver atalhos de teclado"><Keyboard className="h-4 w-4" aria-hidden="true" /><span className="quick-dock-label">Atalhos</span></button><button type="button" onClick={() => { const id=favorites[0]??recent[0]??'dashboard'; jump(id); remember(id); }} title={currentLabel ? 'Continuar em '+currentLabel : 'Começar pelo dashboard'} aria-label="Continuar exploração"><History className="h-4 w-4" aria-hidden="true" /><span className="quick-dock-label">Continuar</span></button></div>
    {commandOpen && <div className="command-overlay" role="dialog" aria-modal="true" aria-labelledby="command-title"><button className="command-backdrop" type="button" aria-label="Fechar central de comandos" onClick={() => setCommandOpen(false)} /><div ref={modalRef} className="command-panel"><div className="flex items-center gap-3 border-b border-white/10 px-4 py-3"><Search className="h-4 w-4 text-slate-500" aria-hidden="true" /><input ref={inputRef} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar uma área do observatório…" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" aria-label="Buscar uma área do observatório" /><kbd>Esc</kbd></div><div className="px-4 pt-4"><div id="command-title" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"><Compass className="h-3.5 w-3.5" aria-hidden="true" /> Explorar</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{results.map(item=><div key={item.id} className="command-item"><button type="button" onClick={()=>{jump(item.id);remember(item.id);setCommandOpen(false)}}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-300/10 text-sky-200"><Sparkles className="h-4 w-4" aria-hidden="true"/></span><span className="min-w-0 text-left"><strong>{item.label}</strong><small>{item.description}</small></span></button><button type="button" className="favorite-btn" onClick={()=>toggleFavorite(item.id)} aria-label={(favorites.includes(item.id)?'Remover ':'Fixar ')+item.label}>{favorites.includes(item.id)?'★':'☆'}</button></div>)}</div></div><div className="border-t border-white/10 px-4 py-3 text-xs text-slate-600"><span>Ctrl/⌘ K</span> comandos · <span>?</span> atalhos · <span>G + tecla</span> navegação rápida</div></div></div>}
    {helpOpen && <div className="command-overlay" role="dialog" aria-modal="true" aria-labelledby="shortcut-title"><button className="command-backdrop" type="button" aria-label="Fechar atalhos" onClick={()=>setHelpOpen(false)} /><div ref={modalRef} className="command-panel max-w-lg"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Navegação</div><h2 id="shortcut-title" className="mt-1 text-lg font-black text-white">Atalhos personalizados</h2></div><button type="button" onClick={()=>setHelpOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Fechar"><X className="h-4 w-4"/></button></div><div className="grid gap-2 p-4 sm:grid-cols-2">{navigation.map(item=><button key={item.id} type="button" onClick={()=>{jump(item.id);remember(item.id);setHelpOpen(false)}} className="shortcut-row"><span><strong>{item.label}</strong><small>{item.description}</small></span><kbd>{item.shortcut}</kbd></button>)}</div><div className="border-t border-white/10 p-4"><label className="flex items-center justify-between gap-4 text-xs text-slate-400"><span>Reduzir animações</span><input type="checkbox" checked={reducedMotion} onChange={event=>{const value=event.target.checked;setReducedMotion(value);localStorage.setItem(REDUCED_KEY,value?'1':'0');document.documentElement.classList.toggle('reduced-motion',value)}} /></label><p className="mt-2 text-[11px] leading-5 text-slate-600">Atalhos de uma tecla ficam ativos somente fora de campos de entrada.</p></div></div></div>}
  </>;
}
