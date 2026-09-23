import { Search, X } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { useEffect, useMemo, useRef, useState } from 'react';

const entries: readonly (readonly [string, string])[] = [
  ['Dashboard', 'dashboard'],
  ['Perfil eleitoral', 'eleitorado'],
  ['Transporte', 'transporte'],
  ['Saneamento e saúde', 'saude'],
  ['Pesquisas', 'politica'],
  ['Orçamento', 'orcamento'],
  ['Fontes e metodologia', 'fontes'],
  ['Eleitorado: 125.062', 'eleitorado'], ['População 2026: 249.978', 'dashboard'], ['Tarifa Brasília: R$ 11,45', 'transporte'], ['LOA 2026: R$ 771,3 milhões', 'orcamento'], ['Pesquisa GO-04133/2026', 'politica'], ['Fontes e metodologia', 'fontes'],
];

const dataEntries = [
  ...d.sources.map(source => [source.label, 'fontes'] as const),
  ...d.candidates.map(candidate => [candidate.name, 'politica'] as const),
  ...d.transport.routes.map(route => [route.label, 'transporte'] as const),
];

export function SearchModal({ open, onClose }: { readonly open: boolean; readonly onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    window.setTimeout(() => inputRef.current?.focus(), 0);
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const filtered = useMemo(() => [...entries, ...dataEntries].filter(([label], index, all) => all.findIndex(item => item[0] === label) === index && label.toLowerCase().includes(query.trim().toLowerCase())), [query]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Buscar no observatório" onMouseDown={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#101821] shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar seção..." className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500" aria-label="Buscar seção" />
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Fechar busca"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[50vh] overflow-auto p-2">
          {filtered.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={onClose} className="block rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/5">
              {label}
              <span className="ml-2 text-xs text-slate-500">#{id}</span>
            </a>
          ))}
          {!filtered.length && <div className="px-4 py-8 text-center text-sm text-slate-500">Nenhuma seção encontrada.</div>}
        </div>
      </div>
    </div>
  );
}