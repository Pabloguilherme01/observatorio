import { Search, X } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatCurrency } from '../../utils/formatters';
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
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

const sourceLabel = (sourceId: string) => d.sources.find(source => source.id === sourceId)?.label ?? sourceId;

const brlMillions = (value: number) => (value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' milhões';

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
    } else if (qi > 0) score -= 0.15;
  }
  return qi === query.length ? score : -Infinity;
}

export function SearchModal({ open, onClose }: { readonly open: boolean; readonly onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const filteredLengthRef = useRef(0);

  const openSearch = () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActiveIndex(0);
    const target = window.matchMedia?.('(min-width: 768px)').matches ? inputRef.current : null;
    window.setTimeout(() => target?.focus(), 40);
  };

  const mobileModeHint = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches;


  useEffect(() => {
    if (!open) {
      openerRef.current?.focus?.();
      return;
    }
    openSearch();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex(index => Math.min(index + 1, Math.max(filteredLengthRef.current - 1, 0))); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => Math.max(index - 1, 0)); return; }
      if (event.key === 'Home') { event.preventDefault(); setActiveIndex(0); return; }
      if (event.key === 'End') { event.preventDefault(); setActiveIndex(Math.max(filteredLengthRef.current - 1, 0)); return; }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, a[href]')).filter(node => !node.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  const quickAnswer = useMemo(() => {
    const q = normalize(query);
    if (!q || q.length < 4) return null;
    const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
    if (q.includes('populacao') || q.includes('habitantes')) return { title: 'População 2026', value: population.toLocaleString('pt-BR') + ' habitantes', id: 'dashboard', sourceId: 'ibge-estimativas-2026' };
    if (q.includes('eleitorado') || q.includes('eleitores')) return { title: 'Eleitorado 2026', value: d.electoral.electorate.toLocaleString('pt-BR') + ' eleitores', id: 'eleitorado', sourceId: 'tse-eleitorado-2026' };
    if (q.includes('orcamento') || q.includes('loa')) return { title: 'LOA 2026', value: formatCurrency(Math.round(d.budget.totalBrl)), id: 'orcamento', sourceId: d.budget.sourceId };
    if (q.includes('esgoto')) return { title: 'Acesso ao serviço público de esgoto', value: d.sanitation.publicSewerServicePct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: 'sinisa-2024' };
    if (q.includes('tarifa') || q.includes('passagem') || q.includes('brasilia')) {
      const route = d.transport.routes.find(item => item.id === 'brasilia') ?? d.transport.routes[0];
      return route ? { title: 'Tarifa de referência para Brasília', value: route.fareBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por trecho', id: 'transporte', sourceId: route.sourceId } : null;
    }
    if (q.includes('pib')) {
      const indicator = d.indicators.find(item => item.id === 'gdp-per-capita-2023');
      return indicator ? { title: 'PIB per capita 2023', value: indicator.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('ideb')) {
      const range = d.education?.ideb2025Range;
      return range ? { title: 'Referência Ideb 2025', value: range[0].toLocaleString('pt-BR') + '–' + range[1].toLocaleString('pt-BR'), id: 'dashboard', sourceId: d.education?.sourceId ?? 'qedu-ideb-2025' } : null;
    }
    if (q.includes('heal') || q.includes('hospital')) {
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

  filteredLengthRef.current = filtered.length;

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(Math.max(filtered.length - 1, 0));
  }, [activeIndex, filtered.length]);

  useEffect(() => {
    document.querySelector<HTMLElement>(`[data-search-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  const selectResult = (id: string) => {
    onClose();
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: document.documentElement.classList.contains('reduced-motion') ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', '#' + id);
      window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
    }, 60);
  };

  return (
    <div className="search-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="search-modal-title" onMouseDown={onClose}>
      <div ref={dialogRef} className="search-modal-panel" onMouseDown={event => event.stopPropagation()}>
        <div className="search-modal-head">
          <div className="search-modal-icon"><Search className="h-5 w-5" aria-hidden="true" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 id="search-modal-title" className="text-sm font-black text-white">Buscar no Observatório</h2>
              <span className="search-mode-hint">{mobileModeHint ? 'Toque em um resultado' : 'Digite e escolha'}</span>
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && filtered[activeIndex]) {
                  event.preventDefault();
                  selectResult(filtered[activeIndex].id);
                }
              }}
              placeholder="Ex.: orçamento, transporte, eleitorado, HEAL…"
              className="search-modal-input"
              aria-label="Buscar seção, fonte ou indicador"
              role="combobox"
              aria-expanded={open}
              aria-controls="search-results"
              aria-activedescendant={filtered[activeIndex] ? 'search-result-' + activeIndex : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              inputMode="search"
              enterKeyHint="go"
            />
          </div>
          <button type="button" onClick={onClose} className="search-modal-close" aria-label="Fechar busca"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>

        {quickAnswer && <div className="search-quick-answer">
          <div className="search-kicker">Resposta rápida</div>
          <div className="mt-1 text-sm font-black text-white">{quickAnswer.title}</div>
          <div className="mt-1 text-2xl font-black text-sky-300">{quickAnswer.value}</div>
          <button type="button" onClick={() => selectResult(quickAnswer.id)} className="mt-3 search-quick-action">Abrir dado e fonte</button>
          <span className="mt-2 block text-[10px] text-slate-600">Fonte: {quickAnswer.sourceId}</span>
        </div>}

        <div className="search-meta">
          <span>{filtered.length} resultado{filtered.length === 1 ? '' : 's'}</span>
          <span>Setas navegar · Enter abrir · Esc fechar</span>
        </div>

        <div id="search-results" className="search-results" role="listbox" aria-label="Resultados da busca">
          {filtered.map((item, index) => (
            <button
              key={item.label + '-' + item.id}
              id={'search-result-' + index}
              type="button"
              data-search-index={index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectResult(item.id)}
              className={'search-result-row ' + (activeIndex === index ? 'is-active' : '')}
              role="option"
              aria-selected={activeIndex === index}
            >
              <span className="min-w-0 text-left"><strong>{item.label}</strong><small>#{item.id}</small></span>
              <span className="search-result-enter">↵</span>
            </button>
          ))}
          {!filtered.length && <div className="search-empty">Nenhum resultado encontrado. Tente termos como orçamento, eleitorado, transporte ou saneamento.</div>}
        </div>
      </div>
    </div>
  );
}