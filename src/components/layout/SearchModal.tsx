import '../../assets/styles/search-modal.css';
import { BarChart3, BookOpen, Bookmark, BusFront, Check, Clipboard, Database, Droplets, ExternalLink, FileCheck2, Landmark, Search, ShieldCheck, Users, Vote, WalletCards, X } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { navigation } from '../../config/navigation';
import { formatDate } from '../../utils/formatters';
import { formatIndicatorStatus } from '../../utils/dataLabels';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { publicServiceSearchEntries } from '../../data/publicServiceSearch';
import { navigateToSection } from '../../lib/sectionNavigation';
import { clearRecentSections, getRecentSections } from '../../lib/recentSections';
import { copyText } from '../../lib/clipboard';
import { clearSavedIndicators, getSavedIndicators, type SavedIndicator } from '../../lib/savedIndicators';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { resolveQuickAnswer } from './searchQuickAnswer';

type ResultKind = 'primary' | 'data' | 'source' | 'candidate' | 'transport' | 'public';

type SearchEntry = readonly [string, string, ResultKind, string?];

const entries: readonly SearchEntry[] = [
  ['Indicadores', 'dashboard', 'primary'],
  ['Comparar municípios', 'contexto', 'primary'],
  ['Atualizações públicas', 'dados', 'primary'],
  ['Perfil eleitoral', 'eleitorado', 'primary'],
  ['Transporte', 'transporte', 'primary'],
  ['Simulador de bolso · Transporte', 'transporte', 'transport'],
  ['Teste seus conhecimentos', 'quiz', 'primary'],
  ['Aprendizado guiado · passo a passo', 'aprendizado-guiado', 'primary'],
  ['Saneamento e saúde', 'saude', 'primary'],
  ['Pesquisas', 'politica', 'primary'],
  ['Candidaturas', 'candidaturas', 'primary'],
  ['Orçamento', 'orcamento', 'primary'],
  ['Qualidade dos dados', 'qualidade', 'primary'],
  ['Como sabemos · fontes e método', 'fontes', 'primary'],
  ['Baixar dados', 'exportacao', 'primary'],
  ['Pesquisa registrada', 'politica', 'primary'],
  ['HEALGO', 'saude', 'primary'],
  ['Resumo principal', 'resumo', 'primary'],
  ...publicServiceSearchEntries,
];

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

const normalizeSearchQuery = (value: string) => {
  const normalized = normalize(value);
  if (normalized === 'resumo executivo') return 'resumo principal';
  if (normalized === 'quiz') return 'teste seus conhecimentos';
  return normalized;
};


const sourceForId = (sourceId?: string) => sourceId ? d.sources.find(source => source.id === sourceId) : undefined;
const sourceLabel = (sourceId?: string) => sourceId ? (sourceForId(sourceId)?.label ?? sourceId) : 'Conjunto publicado pelo Observatório';
const destinationLabel = (id: string) => navigation.find(item => item.id === id)?.label ?? ({ resumo: 'Resumo', 'aprendizado-guiado': 'Aprendizado guiado', saude: 'Saúde e serviços', candidaturas: 'Candidaturas', exportacao: 'Baixar dados', acao: 'Serviços públicos', contexto: 'Comparação municipal', dados: 'Atualizações públicas' }[id] ?? 'Seção do observatório');

const brlMillions = (value: number) => (value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' milhões';

const indicatorDestination = (id: string) => {
  if (id === 'fare' || id.includes('transport')) return 'transporte';
  if (id.includes('water') || id.includes('sewer') || id.includes('sanitation') || id.includes('waste') || id.includes('hydrometer') || id.includes('infant-mortality')) return 'saude';
  if (id.includes('budget') || id.includes('revenue') || id.includes('expense')) return 'orcamento';
  if (id.includes('electorate')) return 'eleitorado';
  return 'dashboard';
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
    } else if (qi > 0) score -= 0.15;
  }
  return qi === query.length ? score : -Infinity;
}

export function SearchModal({ open, onClose, initialShortcutGuideOpen = false }: { readonly open: boolean; readonly onClose: () => void; readonly initialShortcutGuideOpen?: boolean }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [shortcutGuideOpen, setShortcutGuideOpen] = useState(false);
  const [recentSections, setRecentSections] = useState<string[]>([]);
  const [savedIndicators, setSavedIndicators] = useState<SavedIndicator[]>([]);
  const [quickAnswerCopied, setQuickAnswerCopied] = useState(false);
  const [quickAnswerCopyError, setQuickAnswerCopyError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const filteredLengthRef = useRef(0);

  const openSearch = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setShortcutGuideOpen(initialShortcutGuideOpen);
    setRecentSections(getRecentSections());
    setSavedIndicators(getSavedIndicators());
    setQuickAnswerCopied(false);
    setQuickAnswerCopyError(false);
  }, [initialShortcutGuideOpen]);

  const getInitialFocus = useCallback(
    () => window.matchMedia?.('(min-width: 768px)').matches ? inputRef.current : closeButtonRef.current,
    [],
  );

  const mobileModeHint = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches;


  useDialogFocus({
    open,
    dialogRef,
    getInitialFocus,
    restoreSelector: '[data-search-trigger="primary"]',
    onEscape: onClose,
  });

  useEffect(() => {
    if (!open) return;
    openSearch();
    const handleKey = (event: KeyboardEvent) => {
      const editingQuery = event.target === inputRef.current;
      if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex(index => Math.min(index + 1, Math.max(filteredLengthRef.current - 1, 0))); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => Math.max(index - 1, 0)); return; }
      if (!editingQuery && event.key === 'Home') { event.preventDefault(); setActiveIndex(0); return; }
      if (!editingQuery && event.key === 'End') { event.preventDefault(); setActiveIndex(Math.max(filteredLengthRef.current - 1, 0)); return; }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, openSearch]);

  const quickAnswer = useMemo(() => resolveQuickAnswer(query), [query]);

  const quickSource = quickAnswer ? sourceForId(quickAnswer.sourceId) : null;
  const quickAnswerCopyText = quickAnswer ? [
    `${quickAnswer.title}: ${quickAnswer.value}.`,
    `Fonte: ${sourceLabel(quickAnswer.sourceId)}.`,
    quickAnswer.note ? `Nota: ${quickAnswer.note}` : '',
    quickSource?.url ? `URL: ${quickSource.url}` : '',
  ].filter(Boolean).join(' ') : '';

  const copyQuickAnswer = async () => {
    if (!quickAnswerCopyText) return;
    const copied = await copyText(quickAnswerCopyText);
    setQuickAnswerCopied(copied);
    setQuickAnswerCopyError(!copied);
  };

  useEffect(() => {
    setQuickAnswerCopied(false);
    setQuickAnswerCopyError(false);
  }, [query]);

  const filtered = useMemo(() => {
    const queryNormalized = normalizeSearchQuery(query);
    const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
    const electorate = d.electoral.electorate;
    const all: SearchEntry[] = [
      ...entries,
      ['População 2026: ' + population.toLocaleString('pt-BR'), 'dashboard', 'data'],
      ['Eleitorado 2026: ' + electorate.toLocaleString('pt-BR'), 'eleitorado', 'data'],
      ['LOA 2026: R$ ' + brlMillions(d.budget.totalBrl), 'orcamento', 'data'],
      ...d.sources.map(source => [source.label, 'fontes', 'source'] as SearchEntry),
      ...d.candidates.map(candidate => [candidate.name, 'candidaturas', 'candidate'] as SearchEntry),
      ...d.transport.routes.map(route => [route.label, 'transporte', 'transport'] as SearchEntry),
      ...d.indicators.map(indicator => [indicator.label, indicatorDestination(indicator.id), 'data', indicator.id] as SearchEntry),
    ];
    const seen = new Set<string>();
    return all
      .filter(([label]) => {
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      })
      .map(([label, id, kind, serviceQuery]) => ({ label, id, kind, serviceQuery, score: fuzzyScore(queryNormalized, normalize(label)) }))
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

  const resultGroups: Array<{ key: ResultKind; label: string }> = [
    { key: 'primary', label: 'Resultados principais' },
    { key: 'data', label: 'Estatísticas e dados' },
    { key: 'source', label: 'Fontes oficiais' },
    { key: 'candidate', label: 'Candidaturas' },
    { key: 'transport', label: 'Transporte' },
    { key: 'public', label: 'Serviços públicos' },
  ];

  const resultIcon = (id: string) => {
    if (id === 'eleitorado') return Users;
    if (id === 'transporte') return BusFront;
    if (id === 'saude') return Droplets;
    if (id === 'politica') return Vote;
    if (id === 'candidaturas') return FileCheck2;
    if (id === 'orcamento') return WalletCards;
    if (id === 'fontes') return Database;
    if (id === 'qualidade') return ShieldCheck;
    if (id === 'exportacao') return BookOpen;
    if (id === 'acao') return Landmark;
    return BarChart3;
  };

  const renderResults = (items: typeof filtered) => resultGroups.map(group => {
    const groupItems = items.filter(item => item.kind === group.key);
    if (!groupItems.length) return null;
    return (
      <section key={group.key} className="search-result-group" aria-labelledby={'search-group-' + group.key}>
        <h3 id={'search-group-' + group.key} className="search-result-group-title">{group.label}</h3>
        <div className="search-result-group-list">
          {groupItems.map(item => {
            const Icon = resultIcon(item.id);
            const index = filtered.indexOf(item);
            const indicator = item.kind === 'data' && item.serviceQuery
              ? d.indicators.find(entry => entry.id === item.serviceQuery)
              : undefined;
            const indicatorSource = indicator ? sourceForId(indicator.sourceId) : undefined;
            const indicatorReferenceDate = indicator?.referenceDate ?? indicatorSource?.referenceDate;
            const indicatorContext = indicator
              ? [
                  destinationLabel(item.id),
                  formatIndicatorStatus(indicator.status),
                  indicatorReferenceDate ? `ref. ${formatDate(indicatorReferenceDate)}` : 'referência não informada',
                  sourceLabel(indicator.sourceId),
                ].filter(Boolean).join(' · ')
              : destinationLabel(item.id);
            return (
              <button
                key={item.label + '-' + item.id}
                id={'search-result-' + index}
                type="button"
                data-search-index={index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectResult(item.id, item.label, item.kind, item.serviceQuery)}
                className={'search-result-row ' + (activeIndex === index ? 'is-active' : '')}
                role="option"
                aria-selected={activeIndex === index}
              >
                <span className="search-result-icon"><Icon aria-hidden="true" /></span>
                <span className="min-w-0 flex-1 text-left">
                  <strong>{item.label}</strong>
                  <small>{indicatorContext}</small>
                </span>
                <span className="search-result-enter" aria-hidden="true">{activeIndex === index ? '↵' : '›'}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  });

  const selectResult = (id: string, label?: string, kind?: ResultKind, serviceQuery?: string) => {
    onClose();
    const knownDestination = ['resumo', 'aprendizado-guiado', 'contexto', 'dados', 'saude', 'candidaturas', 'politica', 'qualidade', 'exportacao', 'acao'].includes(id) || navigation.some(item => item.id === id);
    const target = knownDestination ? id : (document.getElementById(id) ? id : 'dashboard');
    const publicServiceQuery = kind === 'public' && label ? (serviceQuery ?? label) : null;
    if (publicServiceQuery) {
      const currentState = typeof window.history.state === 'object' && window.history.state !== null
        ? window.history.state
        : {};
      navigateToSection('acao', {
        state: { ...currentState, publicServiceQuery },
        searchParams: { servico: publicServiceQuery },
      });
      window.dispatchEvent(new CustomEvent('observatorio:public-service-search', { detail: publicServiceQuery }));
      return;
    }

    navigateToSection(target);
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
                  selectResult(filtered[activeIndex].id, filtered[activeIndex].label, filtered[activeIndex].kind, filtered[activeIndex].serviceQuery);
                }
              }}
              placeholder="Ex.: medicamentos, orçamento, transporte, eleitorado…"
              className="search-modal-input"
              aria-label="Buscar dado, serviço, fonte ou seção"
              role="combobox"
              aria-expanded={open}
              aria-controls="search-results"
              aria-describedby="search-result-status"
              aria-activedescendant={filtered[activeIndex] ? 'search-result-' + activeIndex : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              inputMode="search"
              enterKeyHint="go"
            />
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="search-modal-close" aria-label="Fechar busca"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>

        {quickAnswer && <div className="search-quick-answer">
          <div className="search-kicker">Resposta rápida</div>
          <div className="mt-1 text-sm font-black text-white">{quickAnswer.title}</div>
          <div className="mt-1 text-2xl font-black text-sky-300">{quickAnswer.value}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => selectResult(quickAnswer.id)} className="search-quick-action">Abrir seção e contexto</button>
            <button type="button" onClick={copyQuickAnswer} className="search-quick-action">
              {quickAnswerCopied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />}
              {quickAnswerCopied ? 'Resposta copiada' : 'Copiar resposta'}
            </button>
            {quickSource?.url && (
              <a href={quickSource.url} target="_blank" rel="noopener noreferrer" className="search-quick-action">
                Fonte oficial <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
          {quickAnswer.note && <p className="mt-2 text-[11px] leading-5 text-slate-500">{quickAnswer.note}</p>}
          {quickAnswerCopyError && <p className="mt-2 text-[11px] text-amber-300" role="status">Não foi possível copiar a resposta. Tente novamente.</p>}
          <span className="sr-only" role="status" aria-live="polite">{quickAnswerCopied ? 'Resposta rápida copiada.' : ''}</span>
          <span className="mt-2 block text-[10px] text-slate-600">Fonte: {sourceLabel(quickAnswer.sourceId)}</span>
        </div>}

        {!query && recentSections.length > 0 && (
          <section className="search-result-group" aria-labelledby="search-recent-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id="search-recent-title" className="search-result-group-title">Áreas recentes</h3>
                <p className="mt-1 text-[10px] text-slate-600">Salvo somente neste dispositivo.</p>
              </div>
              <button
                type="button"
                className="search-clear-query"
                onClick={() => {
                  clearRecentSections();
                  setRecentSections([]);
                  inputRef.current?.focus();
                }}
              >
                Limpar recentes
              </button>
            </div>
            <div className="search-result-group-list">
              {recentSections.map(id => {
                const item = navigation.find(entry => entry.id === id);
                if (!item) return null;
                const Icon = resultIcon(item.id);
                return (
                  <button
                    key={'recent-' + item.id}
                    type="button"
                    className="search-result-row"
                    onClick={() => selectResult(item.id)}
                  >
                    <span className="search-result-icon"><Icon aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1 text-left">
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span className="search-result-enter" aria-hidden="true">›</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {!query && savedIndicators.length > 0 && (
          <section className="search-result-group" aria-labelledby="search-saved-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id="search-saved-title" className="search-result-group-title">Leituras salvas</h3>
                <p className="mt-1 text-[10px] text-slate-600">Disponíveis somente neste dispositivo.</p>
              </div>
              <button type="button" className="search-clear-query" onClick={() => { clearSavedIndicators(); setSavedIndicators([]); inputRef.current?.focus(); }}>Limpar salvos</button>
            </div>
            <div className="search-result-group-list">
              {savedIndicators.map(item => (
                <a key={item.id} href={item.url} onClick={onClose} className="search-result-row">
                  <span className="search-result-icon"><Bookmark aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1 text-left"><strong>{item.title}</strong><small>Abrir indicador salvo</small></span>
                  <span className="search-result-enter" aria-hidden="true">›</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="search-meta">
          <span>{filtered.length} resultado{filtered.length === 1 ? '' : 's'}</span>
          <span id="search-result-status" className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {query
              ? (filtered.length
                  ? filtered.length + ' resultado' + (filtered.length === 1 ? '' : 's') + ' para ' + query
                  : 'Nenhum resultado para ' + query)
              : filtered.length + ' resultados disponíveis'}
          </span>
          <div className="search-meta-actions">
            {query && <button type="button" className="search-clear-query" onClick={() => { setQuery(''); setActiveIndex(0); inputRef.current?.focus(); }}>Limpar busca</button>}
            <span>Setas navegar · Enter abrir · Esc fechar</span>
          </div>
        </div>

        <details className="search-shortcut-guide" open={shortcutGuideOpen} onToggle={event => setShortcutGuideOpen(event.currentTarget.open)}>
          <summary>Atalhos de teclado</summary>
          <div className="search-shortcut-grid">
            <span><kbd>/</kbd><small>Abrir busca</small></span>
            <span><kbd>?</kbd><small>Abrir ajuda</small></span>
            <span><kbd>Alt M</kbd><small>Alternar leitura</small></span>
            {navigation.map(item => (
              <span key={item.id}><kbd>{item.shortcut}</kbd><small>{item.shortLabel}</small></span>
            ))}
          </div>
        </details>

        <div id="search-results" className="search-results" role="listbox" aria-label="Resultados da busca">
          {renderResults(filtered)}
          {!filtered.length && <div className="search-empty"><p>Nenhum resultado encontrado.</p><p className="mt-1 text-[11px] text-slate-600">Tente medicamentos, orçamento, eleitorado, transporte, saneamento ou saúde.</p><button type="button" className="search-empty-action" onClick={() => setQuery('')}>Limpar busca</button></div>}
        </div>
      </div>
    </div>
  );
}