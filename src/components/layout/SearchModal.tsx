import { Search, X } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { useEffect, useMemo, useRef, useState } from 'react';

const entries: readonly (readonly [string, string])[] = [
  ['Dashboard', 'dashboard'],
  ['Perfil eleitoral', 'eleitorado'],
  ['Transporte', 'transporte'],
  ['Saneamento e saúde', 'saude'],
  ['Pesquisas', 'politica'],
  ['Candidaturas', 'candidaturas'],
  ['Orçamento', 'orcamento'],
  ['Qualidade dos dados', 'qualidade'],
  ['Fontes e metodologia', 'fontes'],
  ['Exportação', 'exportacao'],
  ['Pesquisa registrada', 'politica'],
  ['HEALGO', 'saude'],
  ['Resumo de leitura', 'resumo'],
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();

const brlMillions = (value: number) => {
  const millions = value / 1_000_000;
  return millions.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' milhões';
};

function fuzzyScore(query: string, text: string): number {
  if (!query) return 1;
  if (text.includes(query)) return 100 + (query.length / Math.max(text.length, 1)) * 10;

  let qi = 0;
  let score = 0;
  for (const char of text) {
    if (char === query[qi]) {
      score += 3;
      qi += 1;
      if (qi === query.length) break;
    } else if (qi > 0) {
      score -= 0.15;
    }
  }
  return qi === query.length ? score : -Infinity;
}

export function SearchModal({ open, onClose }: { readonly open: boolean; readonly onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const activeModalRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      activeModalRef.current = false;
      openerRef.current?.focus?.();
      return;
    }
    openerRef.current = document.activeElement as HTMLElement | null;
    activeModalRef.current = true;
    setQuery('');
    setActiveIndex(0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const handleKey = (event: KeyboardEvent) => {
      // While the search dialog is open it owns the keyboard: stop the
      // global ExperienceShell shortcuts (g-combos, ?, cmd+k stacking).
      if (activeModalRef.current && event.key !== 'Tab') event.stopPropagation();
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, a[href]')).filter(node => !node.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex(index => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(index => Math.max(index - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  const quickAnswer = useMemo(() => {
    const q = normalize(query);
    if (!q || q.length < 4) return null;
    const tokens = q.split(/\s+/).filter(Boolean);
    const hasToken = (...words: string[]) => words.some(word => q.includes(word) || tokens.includes(word));
    const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
    // Only answer when the query is short enough to plausibly be a single fact question.
    if (tokens.length > 5) return null;
    if (hasToken('populacao', 'populacional', 'habitantes')) return { title: 'População 2026', value: population.toLocaleString('pt-BR') + ' habitantes', id: 'dashboard', sourceId: 'ibge-estimativas-2026' };
    if (hasToken('eleitorado', 'eleitores')) return { title: 'Eleitorado 2026', value: d.electoral.electorate.toLocaleString('pt-BR') + ' eleitores', id: 'eleitorado', sourceId: 'tse-eleitorado-2026' };
    if (hasToken('orcamento', 'loa')) return { title: 'LOA 2026', value: 'R$ ' + d.budget.totalBrl.toLocaleString('pt-BR', { maximumFractionDigits: 2 }), id: 'orcamento', sourceId: d.budget.sourceId };
    if (hasToken('esgoto', 'saneamento')) return { title: 'Acesso ao serviço público de esgoto', value: d.sanitation.publicSewerServicePct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: 'sinisa-2024' };
    if (hasToken('tarifa', 'passagem')) {
      const route = d.transport.routes.find(item => item.id === 'brasilia') ?? d.transport.routes[0];
      return route ? { title: 'Tarifa de referência para Brasília', value: route.fareBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por trecho', id: 'transporte', sourceId: route.sourceId } : null;
    }
    if (tokens.includes('pib')) {
      const indicator = d.indicators.find(item => item.id === 'gdp-per-capita-2023');
      return indicator ? { title: 'PIB per capita 2023', value: indicator.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (hasToken('ideb')) {
      const range = d.education?.ideb2025Range;
      return range && d.education ? { title: 'Referência Ideb 2025', value: range[0].toLocaleString('pt-BR') + '–' + range[1].toLocaleString('pt-BR'), id: 'dashboard', sourceId: d.education.sourceId } : null;
    }
    if (hasToken('heal', 'healgo', 'hospital', 'leitos')) {
      const total = (d.health?.currentStatedWardBeds ?? 0) + (d.health?.currentStatedIcuBeds ?? 0);
      return { title: 'HEAL · leitos declarados', value: total.toLocaleString('pt-BR') + ' leitos', id: 'saude', sourceId: 'healgo' };
    }
    return null;
  }, [query]);

  const filtered = useMemo(() => {
    const queryNormalized = normalize(query);
    const fare = Number(d.indicators.find(indicator => indicator.id === 'fare')?.value ?? 0);
    const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
    const electorate = d.electoral.electorate;
    const all: Array<readonly [string, string]> = [
      ...entries,
      ['População 2026: ' + population.toLocaleString('pt-BR'), 'dashboard'],
      ['Eleitorado 2026: ' + electorate.toLocaleString('pt-BR'), 'eleitorado'],
      ['Tarifa Brasília: R$ ' + fare.toFixed(2).replace('.', ','), 'transporte'],
      ['LOA 2026: R$ ' + brlMillions(d.budget.totalBrl), 'orcamento'],
      ...d.sources.map(source => [source.label, 'fontes'] as [string, string]),
      ...d.candidates.map(candidate => [candidate.name, 'candidaturas'] as [string, string]),
      ...d.transport.routes.map(route => [route.label, 'transporte'] as [string, string]),
      ...d.indicators.map(indicator => [indicator.label, 'dashboard'] as [string, string]),
    ];

    return all
      .filter(([label], index, array) => array.findIndex(item => item[0] === label) === index)
      .map(([label, id]) => ({ label, id, score: fuzzyScore(queryNormalized, normalize(label)) }))
      .filter(item => Number.isFinite(item.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(Math.max(filtered.length - 1, 0));
  }, [activeIndex, filtered.length]);

  useEffect(() => {
    const active = document.querySelector<HTMLElement>(`[data-search-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="search-modal-title" onMouseDown={onClose}>
      <div ref={dialogRef} className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#101821] shadow-2xl" onMouseDown={event => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 id="search-modal-title" className="sr-only">Buscar no observatório</h2>
            <input
              ref={inputRef}
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && filtered[activeIndex]) {
                  // jump() handles smooth scroll + reduced motion + history;
                  // plain hash assignment caused abrupt jumps and double focus changes.
                  const id = filtered[activeIndex].id;
                  onClose();
                  window.requestAnimationFrame(() => {
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    window.history.replaceState(null, '', '#' + id);
                    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
                  });
                }
              }}
              placeholder="Buscar seção, fonte ou indicador…"
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              aria-label="Buscar seção, fonte ou indicador"
              aria-controls="search-results"
              role="combobox"
              aria-expanded={filtered.length > 0}
              aria-autocomplete="list"
              aria-activedescendant={filtered[activeIndex] ? 'search-option-' + activeIndex : undefined}
            />
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Fechar busca">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {quickAnswer && <div className="mx-2 mt-2 rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-sky-300/80">Resposta rápida</div>
          <div className="mt-1 text-sm font-black text-white">{quickAnswer.title}</div>
          <div className="mt-1 text-xl font-black text-sky-300">{quickAnswer.value}</div>
          <a href={'#' + quickAnswer.id} onClick={onClose} className="mt-2 inline-flex min-h-10 items-center text-xs font-bold text-slate-300 hover:text-white">Abrir dado e fonte →</a>
        </div>}
        <div className="flex items-center justify-between px-4 py-2 text-[11px] text-slate-500">
          <span id="search-status" role="status" aria-live="polite">{filtered.length} resultado{filtered.length === 1 ? '' : 's'}</span>
          <span>↑↓ navegar · Enter abrir · Esc fechar</span>
        </div>
        <div id="search-results" className="max-h-[55vh] overflow-auto p-2" role="list" aria-label="Resultados da busca">
          {filtered.map((item, index) => (
            <a
              key={item.label + '-' + item.id}
              id={'search-option-' + index}
              href={'#' + item.id}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={onClose}
              data-search-index={index}
              role="option"
              aria-selected={activeIndex === index}
              className={'block rounded-2xl px-4 py-3 text-sm transition ' + (activeIndex === index ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5')}
            >
              {item.label}
              <span className="ml-2 text-xs text-slate-500">#{item.id}</span>
            </a>
          ))}
          {!filtered.length && <div className="px-4 py-8 text-center text-sm text-slate-500">Nenhum resultado encontrado.</div>}
        </div>
      </div>
    </div>
  );
}
