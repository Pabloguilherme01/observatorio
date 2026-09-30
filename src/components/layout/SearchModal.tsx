import '../../assets/styles/search-modal.css';
import { BarChart3, BookOpen, BusFront, Check, Clipboard, Database, Droplets, ExternalLink, FileCheck2, Landmark, Search, ShieldCheck, Users, Vote, WalletCards, X } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { navigation } from '../../config/navigation';
import { formatBudgetCurrency } from '../../utils/formatters';
import { useEffect, useMemo, useRef, useState } from 'react';
import { publicServiceSearchEntries } from '../../data/publicServiceSearch';
import { navigateToSection } from '../../lib/sectionNavigation';
import { clearRecentSections, getRecentSections } from '../../lib/recentSections';
import { copyText } from '../../lib/clipboard';

type ResultKind = 'primary' | 'data' | 'source' | 'candidate' | 'transport' | 'public';

type SearchEntry = readonly [string, string, ResultKind, string?];

interface QuickAnswer {
  readonly title: string;
  readonly value: string;
  readonly id: string;
  readonly sourceId?: string;
  readonly note?: string;
}

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

const hasTerm = (query: string, term: string) =>
  query.split(/\s+/).includes(term);

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
  const [quickAnswerCopied, setQuickAnswerCopied] = useState(false);
  const [quickAnswerCopyError, setQuickAnswerCopyError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const filteredLengthRef = useRef(0);
  const focusTimerRef = useRef<number | null>(null);
  const hasOpenedRef = useRef(false);

  const openSearch = () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActiveIndex(0);
    setShortcutGuideOpen(initialShortcutGuideOpen);
    setRecentSections(getRecentSections());
    setQuickAnswerCopied(false);
    setQuickAnswerCopyError(false);
    const desktop = window.matchMedia?.('(min-width: 768px)').matches;
    const target = desktop ? inputRef.current : closeButtonRef.current;
    if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
    focusTimerRef.current = window.setTimeout(() => {
      focusTimerRef.current = null;
      target?.focus();
    }, 40);
  };

  const mobileModeHint = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches;


  useEffect(() => {
    if (!open) {
      if (!hasOpenedRef.current) return;
      hasOpenedRef.current = false;
      const opener = openerRef.current;
      const fallback = document.querySelector<HTMLElement>('[data-search-trigger="primary"]');
      const canRestoreOpener = Boolean(opener?.isConnected && opener !== document.body && opener.tabIndex >= 0);
      if (canRestoreOpener) opener?.focus();
      else fallback?.focus();
      return;
    }
    hasOpenedRef.current = true;
    openSearch();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      const editingQuery = event.target === inputRef.current;
      if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex(index => Math.min(index + 1, Math.max(filteredLengthRef.current - 1, 0))); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => Math.max(index - 1, 0)); return; }
      if (!editingQuery && event.key === 'Home') { event.preventDefault(); setActiveIndex(0); return; }
      if (!editingQuery && event.key === 'End') { event.preventDefault(); setActiveIndex(Math.max(filteredLengthRef.current - 1, 0)); return; }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, a[href], summary')).filter(node => !node.hasAttribute('disabled'));
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
      if (focusTimerRef.current) {
        window.clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    };
  }, [open, onClose, initialShortcutGuideOpen]);

  const quickAnswer = useMemo<QuickAnswer | null>(() => {
    const q = normalizeSearchQuery(query);
    if (!q || q.length < 4) return null;
    const sourceCount = d.sources.length;
    const indicatorCount = d.indicators.length;
    const datedSources = d.sources.filter(source => source.referenceDate || source.publishedAt).length;
    if ((hasTerm(q, 'internacao') || hasTerm(q, 'internacoes')) && hasTerm(q, 'agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-related-hospitalizations');
      return indicator ? { title: 'Internações por doenças relacionadas à água', value: Number(indicator.value).toLocaleString('pt-BR') + ' internações', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((hasTerm(q, 'obito') || hasTerm(q, 'obitos') || hasTerm(q, 'morte') || hasTerm(q, 'mortes')) && hasTerm(q, 'agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-related-deaths');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' óbitos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('quantos') || q.includes('total')) && q.includes('indicadores')) {
      return { title: 'Indicadores publicados', value: indicatorCount.toLocaleString('pt-BR') + ' indicadores', id: 'dados', note: 'Contagem do conjunto normalizado exibido pelo Observatório; não representa o total de indicadores existentes nas fontes originais.' };
    }
    if ((q.includes('quantas') || q.includes('total')) && q.includes('fontes')) {
      return { title: 'Fontes registradas', value: sourceCount.toLocaleString('pt-BR') + ' fontes', id: 'dados', note: 'Contagem do catálogo de fontes registrado no conjunto publicado.' };
    }
    if (q.includes('cobertura') && q.includes('fontes')) {
      const coverage = sourceCount ? (datedSources / sourceCount) * 100 : 0;
      return { title: 'Cobertura temporal das fontes', value: coverage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'dados', note: 'Percentual de fontes registradas com data de referência ou publicação.' };
    }
    const population = d.populationSeries.find(point => point.year === 2026)?.value ?? 0;
    if ((q.includes('crescimento') || q.includes('variacao') || q.includes('aumento')) && q.includes('populacao')) {
      const indicator = d.indicators.find(item => item.id === 'population-growth-2022-2026');
      return indicator ? { title: 'Variação da população 2022–2026', value: '+' + Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('diferenca') || q.includes('variacao')) && q.includes('habitantes')) {
      const indicator = d.indicators.find(item => item.id === 'population-change-2022-2026');
      return indicator ? { title: 'Diferença populacional 2022–2026', value: '+' + Number(indicator.value).toLocaleString('pt-BR') + ' habitantes', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('populacao') || q.includes('habitantes')) return { title: 'População 2026', value: population.toLocaleString('pt-BR') + ' habitantes', id: 'dashboard', sourceId: 'ibge-estimativas-2026' };
    if (q.includes('densidade')) {
      const indicator = d.indicators.find(item => item.id === 'density');
      return indicator ? { title: 'Densidade estimada 2026', value: Math.round(Number(indicator.value)).toLocaleString('pt-BR') + ' hab/km²', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if ((q.includes('empresas') || q.includes('empresa')) && (q.includes('novas') || q.includes('novos') || q.includes('abertas'))) {
      const indicator = d.indicators.find(item => item.id === 'companies-new');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' empresas', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('empresas') || q.includes('empresa')) {
      const indicator = d.indicators.find(item => item.id === 'companies');
      return indicator ? { title: 'Empresas ativas', value: indicator.value.toLocaleString('pt-BR') + ' empresas', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('emprego') || q.includes('caged') || q.includes('postos')) {
      const indicator = d.indicators.find(item => item.id === 'cagedBalance');
      return indicator ? { title: 'Saldo celetista até jul/2026', value: Number(indicator.value).toLocaleString('pt-BR') + ' postos', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if ((q.includes('diferenca') || q.includes('saldo')) && q.includes('receita') && q.includes('despesa') && (q.includes('habitante') || q.includes('per capita'))) {
      const indicator = d.indicators.find(item => item.id === 'revenue-expense-difference-per-capita-2025');
      return indicator ? { title: 'Diferença receita–despesa por habitante 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('diferenca') || q.includes('saldo')) && q.includes('receita') && q.includes('despesa')) {
      const indicator = d.indicators.find(item => item.id === 'revenue-expense-difference-2025');
      return indicator ? { title: 'Receitas realizadas − despesas empenhadas 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('receita') || q.includes('receitas')) && (q.includes('habitante') || q.includes('per capita'))) {
      const indicator = d.indicators.find(item => item.id === 'revenue-per-capita-2025');
      return indicator ? { title: 'Receitas realizadas por habitante 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('despesa') || q.includes('despesas')) && (q.includes('habitante') || q.includes('per capita'))) {
      const indicator = d.indicators.find(item => item.id === 'expenses-per-capita-2025');
      return indicator ? { title: 'Despesas empenhadas por habitante 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('receita') || q.includes('receitas')) {
      const indicator = d.indicators.find(item => item.id === 'revenue-2025');
      return indicator ? { title: 'Receitas brutas realizadas 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'orcamento', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('despesa') || q.includes('despesas')) {
      const indicator = d.indicators.find(item => item.id === 'expenses-2025');
      return indicator ? { title: 'Despesas brutas empenhadas 2025', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'orcamento', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('pessoal ocupado') || q.includes('trabalhadores formais')) {
      const indicator = d.indicators.find(item => item.id === 'formal-workers');
      return indicator ? { title: 'Pessoal ocupado', value: Number(indicator.value).toLocaleString('pt-BR') + ' pessoas', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('salario formal') || q.includes('salário formal')) {
      const indicator = d.indicators.find(item => item.id === 'formal-salary');
      return indicator ? { title: 'Salário médio mensal formal', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' salários mínimos', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('mortalidade infantil')) {
      const indicator = d.indicators.find(item => item.id === 'infant-mortality');
      return indicator ? { title: 'Mortalidade infantil', value: indicator.value.toLocaleString('pt-BR') + ' óbitos por mil', id: 'saude', sourceId: indicator.sourceId } : null;
    }
    if (q.includes('escolarizacao') || q.includes('escolarização')) {
      const indicator = d.indicators.find(item => item.id === 'schooling-6-14');
      return indicator ? { title: 'Escolarização de 6 a 14 anos', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('arborizacao') || q.includes('arborização')) {
      const indicator = d.indicators.find(item => item.id === 'street-arborization');
      return indicator ? { title: 'Arborização de vias públicas', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('sem') || q.includes('falta')) && q.includes('agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-access-gap-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('sem') || q.includes('fora')) && q.includes('esgoto') && q.includes('servico')) {
      const indicator = d.indicators.find(item => item.id === 'public-sewer-service-gap-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('esgoto') && q.includes('sem') && q.includes('coleta')) {
      const indicator = d.indicators.find(item => item.id === 'sewer-collection-gap-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('esgoto') && q.includes('sem') && q.includes('tratamento')) {
      const indicator = d.indicators.find(item => item.id === 'sewer-treatment-gap-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('perda') && q.includes('agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-distribution-loss-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('hidrometr')) {
      const indicator = d.indicators.find(item => item.id === 'hydrometering-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('consumo') && q.includes('agua')) {
      const indicator = d.indicators.find(item => item.id === 'water-consumption-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' L/pessoa/dia', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('tarifa') && q.includes('agua')) {
      const indicator = d.indicators.find(item => item.id === 'average-water-tariff-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '/m³', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('lixo') || q.includes('residuo') || q.includes('residuos')) {
      const indicator = d.indicators.find(item => item.id === 'household-waste-collection-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (hasTerm(q, 'agua') || q.includes('abastecimento')) {
      const indicator = d.indicators.find(item => item.id === 'water-access-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('eleitorado') || q.includes('eleitores')) return { title: 'Eleitorado 2026', value: d.electoral.electorate.toLocaleString('pt-BR') + ' eleitores', id: 'eleitoral360', sourceId: 'tse-eleitorado-2026' };
    if ((q.includes('orcamento') || q.includes('loa')) && (q.includes('habitante') || q.includes('per capita')) && q.includes('educacao')) {
      const indicator = d.indicators.find(item => item.id === 'budget-education-per-capita-2026');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && (q.includes('habitante') || q.includes('per capita')) && q.includes('saude')) {
      const indicator = d.indicators.find(item => item.id === 'budget-health-per-capita-2026');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && (q.includes('habitante') || q.includes('per capita')) && q.includes('saneamento')) {
      const indicator = d.indicators.find(item => item.id === 'budget-sanitation-per-capita-2026');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && q.includes('educacao')) {
      const indicator = d.indicators.find(item => item.id === 'budget-education-share-2026');
      return indicator ? { title: 'Educação na LOA 2026', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && q.includes('saude')) {
      const indicator = d.indicators.find(item => item.id === 'budget-health-share-2026');
      return indicator ? { title: 'Saúde na LOA 2026', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && q.includes('saneamento')) {
      const indicator = d.indicators.find(item => item.id === 'budget-sanitation-share-2026');
      return indicator ? { title: 'Saneamento na LOA 2026', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('matriculas municipais') || (q.includes('matricula') && q.includes('municipal'))) {
      const indicator = d.indicators.find(item => item.id === 'municipal-enrollment-share-2025');
      return indicator ? { title: 'Matrículas municipais na educação básica', value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('orcamento') || q.includes('loa')) && (q.includes('habitante') || q.includes('per capita'))) {
      const indicator = d.indicators.find(item => item.id === 'budget-per-capita-2026');
      return indicator ? { title: 'LOA 2026 por habitante', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por habitante', id: 'orcamento', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('orcamento') || q.includes('loa')) return { title: 'LOA 2026', value: formatBudgetCurrency(d.budget.totalBrl), id: 'orcamento', sourceId: d.budget.sourceId };
    if (q.includes('coleta') && q.includes('esgoto')) {
      const indicator = d.indicators.find(item => item.id === 'sewer-collection-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('tratamento') && q.includes('esgoto')) {
      const indicator = d.indicators.find(item => item.id === 'sewer-treatment-generated-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('esgoto')) {
      const indicator = d.indicators.find(item => item.id === 'public-sewer-service-2024');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('custo') || q.includes('mensal')) && q.includes('brasilia')) {
      const indicator = d.indicators.find(item => item.id === 'transport-monthly-brasilia-default');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por pessoa/mês', id: 'transporte', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('custo') || q.includes('mensal')) && q.includes('taguatinga')) {
      const indicator = d.indicators.find(item => item.id === 'transport-monthly-taguatinga-default');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por pessoa/mês', id: 'transporte', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('custo') || q.includes('mensal')) && q.includes('ceilandia')) {
      const indicator = d.indicators.find(item => item.id === 'transport-monthly-ceilandia-default');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por pessoa/mês', id: 'transporte', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('transporte') || q.includes('brasilia')) && q.includes('salario')) {
      const indicator = d.indicators.find(item => item.id === 'transport-brasilia-min-wage-share-default');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', id: 'transporte', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
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
    if ((q.includes('ept') || q.includes('educacao profissional') || q.includes('educacao tecnica') || q.includes('ensino tecnico')) && (q.includes('matricula') || q.includes('tecnica') || q.includes('tecnico') || q === 'ept')) {
      const indicator = d.indicators.find(item => item.id === 'ept-technical-2025');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' matrículas', id: 'dashboard', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('matricula') || q.includes('matriculas') || q.includes('educacao basica')) {
      const indicator = d.indicators.find(item => item.id === 'basic-enrollments-2025');
      return indicator ? { title: 'Matrículas na educação básica 2025', value: Number(indicator.value).toLocaleString('pt-BR') + ' matrículas', id: 'dashboard', sourceId: indicator.sourceId } : null;
    }
    if ((q.includes('saneamento') && (q.includes('per capita') || q.includes('por pessoa'))) || (q.includes('investimento') && q.includes('saneamento') && q.includes('habitante'))) {
      const indicator = d.indicators.find(item => item.id === 'sanitation-investment-per-capita');
      return indicator ? { title: 'Investimento em saneamento por pessoa', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' por pessoa', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('esgotamento') && q.includes('adequado')) {
      const indicator = d.indicators.find(item => item.id === 'adequate-sewerage');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('investimento') && q.includes('saneamento')) {
      const indicator = d.indicators.find(item => item.id === 'sanitation-investment');
      return indicator ? { title: 'Investimento em saneamento', value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'saude', sourceId: indicator.sourceId } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && (q.includes('planej') || q.includes('298'))) {
      const indicator = d.indicators.find(item => item.id === 'heal-planned-beds');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' leitos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && (q.includes('inaugur') || q.includes('164'))) {
      const indicator = d.indicators.find(item => item.id === 'heal-opening-beds');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' leitos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && q.includes('investimento')) {
      const indicator = d.indicators.find(item => item.id === 'heal-opening-investment');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && q.includes('atendimento')) {
      const indicator = d.indicators.find(item => item.id === 'heal-first-year-attendances');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + '+ atendimentos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if ((q.includes('heal') || q.includes('hospital')) && (q.includes('por leito') || q.includes('leito de referencia'))) {
      const indicator = d.indicators.find(item => item.id === 'heal-attendances-per-opening-bed');
      return indicator ? { title: indicator.label, value: Math.floor(Number(indicator.value)).toLocaleString('pt-BR') + '+ atendimentos/leito', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    if (q.includes('heal') || q.includes('hospital')) {
      const indicator = d.indicators.find(item => item.id === 'heal-current-stated-beds');
      return indicator ? { title: indicator.label, value: Number(indicator.value).toLocaleString('pt-BR') + ' leitos', id: 'saude', sourceId: indicator.sourceId, note: indicator.note } : null;
    }
    return null;
  }, [query]);

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
      ...d.indicators.map(indicator => [indicator.label, indicatorDestination(indicator.id), 'data'] as SearchEntry),
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
                  <small>{destinationLabel(item.id)}</small>
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
