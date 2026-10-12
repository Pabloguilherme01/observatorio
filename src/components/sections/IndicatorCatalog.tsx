import { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, Link2, Search, X } from 'lucide-react';
import { buildCanonicalUrl, getSearchParam, replaceCurrentUrl, urlParamKeys } from '../../lib/urlState';
import { copyText } from '../../lib/clipboard';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { observatorioData as data } from '../../data/observatorioData';
import { indicatorReference } from '../../lib/indicatorReference';
import { downloadBlob, toCsv } from '../../lib/export';
import { formatIndicatorStatus } from '../../utils/dataLabels';
import { formatBudgetCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import type { MunicipalIndicator } from '../../types/observatorio';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
const sourceById = new Map(data.sources.map(source => [source.id, source]));
const readQuery = () => (getSearchParam(urlParamKeys.indicatorQuery) ?? '').slice(0, 160);
const readStatus = () => {
  const value = getSearchParam(urlParamKeys.indicatorStatus) ?? '';
  return ['published', 'historical', 'snapshot', 'planned', 'derived'].includes(value) ? value : 'all';
};
const readOrder = () => {
  const value = getSearchParam(urlParamKeys.indicatorOrder);
  return value === 'name' || value === 'year' ? value : 'catalog';
};
const readMissingReference = () => getSearchParam(urlParamKeys.indicatorMissingReference) === '1';
const formatValue = (item: MunicipalIndicator) => typeof item.value === 'string' ? item.value
  : item.unit === '%' ? formatPercent(item.value, 1)
  : item.unit.startsWith('BRL') ? `${formatBudgetCurrency(item.value)}${item.unit.includes('/') ? `/${item.unit.split('/')[1]}` : ''}`
  : `${formatNumber(item.value, 2)} ${item.unit}`;

export function IndicatorCatalog() {
  const [query, setQuery] = useState(readQuery);
  const [status, setStatus] = useState(readStatus);
  const [missingReference, setMissingReference] = useState(readMissingReference);
  const [order, setOrder] = useState(readOrder);
  const [linkStatus, setLinkStatus] = useState('');
  const { mode } = useLanguageMode();
  const [limit, setLimit] = useState(12);
  useEffect(() => {
    const restore = () => { setQuery(readQuery()); setStatus(readStatus()); setMissingReference(readMissingReference()); setOrder(readOrder()); setLimit(12); };
    const onNavigate = (event: Event) => { if ((event as CustomEvent<string>).detail === 'dados') restore(); };
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    window.addEventListener('observatorio:navigate', onNavigate);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
      window.removeEventListener('observatorio:navigate', onNavigate);
    };
  }, []);
  useEffect(() => {
    if (window.location.hash === '#dados') replaceCurrentUrl({ [urlParamKeys.indicatorQuery]: query.trim() || null, [urlParamKeys.indicatorStatus]: status === 'all' ? null : status, [urlParamKeys.indicatorOrder]: order === 'catalog' ? null : order, [urlParamKeys.indicatorMissingReference]: missingReference ? '1' : null });
    setLinkStatus('');
  }, [query, status, missingReference, order]);
  const copySelection = async () => {
    const url = buildCanonicalUrl({ [urlParamKeys.indicatorQuery]: query.trim() || null, [urlParamKeys.indicatorStatus]: status === 'all' ? null : status, [urlParamKeys.indicatorOrder]: order === 'catalog' ? null : order, [urlParamKeys.indicatorMissingReference]: missingReference ? '1' : null, [urlParamKeys.readingMode]: mode }, 'dados');
    setLinkStatus(await copyText(url) ? 'Link da seleção copiado.' : 'Não foi possível copiar o link automaticamente.');
  };
  const matches = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    const selected = data.indicators.filter(item => {
      const source = sourceById.get(item.sourceId);
      const text = normalize(`${item.label} ${item.note ?? ''} ${source?.label ?? ''}`);
      return tokens.every(token => text.includes(token))
        && (status === 'all' || item.status === status)
        && (!missingReference || !indicatorReference(item, source).key);
    });
    if (order === 'catalog') return selected;
    const byName = (a: MunicipalIndicator, b: MunicipalIndicator) => a.label.localeCompare(b.label, 'pt-BR');
    const year = (item: MunicipalIndicator) => {
      const key = indicatorReference(item, sourceById.get(item.sourceId)).key;
      return key ? Number(key.split(':')[1].slice(0, 4)) : 0;
    };
    return selected.sort((a, b) => order === 'year' ? year(b) - year(a) || byName(a, b) : byName(a, b));
  }, [query, status, missingReference, order]);

  const exportSelection = () => {
    const rows = matches.map(item => {
      const source = sourceById.get(item.sourceId);
      return [item.id, item.label, item.value, item.unit, item.status, indicatorReference(item, source).label, source?.label, source?.resourceUrl ?? source?.url, item.note];
    });
    downloadBlob('observatorio-indicadores-filtrados.csv', toCsv([
      ['id', 'indicador', 'valor', 'unidade', 'natureza', 'referencia', 'fonte', 'url_fonte', 'nota'], ...rows,
    ]), 'text/csv;charset=utf-8');
  };

  return (
    <section className="indicator-catalog" aria-labelledby="catalog-title">
      <div className="civic-section-heading">
        <div><span className="civic-eyebrow">Pesquise e leve a fonte junto</span><h3 id="catalog-title">Catálogo de indicadores</h3><p>Busque pelo assunto ou pela instituição. A data de publicação do site não substitui a referência de cada dado.</p></div>
        <div className="citizen-catalog-actions"><button type="button" className="civic-search-button" onClick={() => void copySelection()}><Link2 aria-hidden="true" />Copiar link da seleção</button><button type="button" className="civic-search-button" onClick={exportSelection} disabled={!matches.length}><Download aria-hidden="true" /> Baixar seleção CSV</button></div>
      </div>
      <p role="status" aria-live="polite" className="citizen-catalog-link-status">{linkStatus}</p>
      <div className="catalog-filters">
        <label><span>Assunto ou fonte</span><div className="catalog-search"><Search aria-hidden="true" /><input type="search" maxLength={160} value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }} placeholder="Ex.: água, educação, IBGE" aria-label="Pesquisar indicadores" /></div></label>
        <label><span>Natureza do indicador</span><select value={status} onChange={event => { setStatus(event.target.value); setLimit(12); }}>
          <option value="all">Todos os tipos</option><option value="published">Publicado no conjunto</option><option value="historical">Histórico</option><option value="snapshot">Registro datado</option><option value="planned">Planejado</option><option value="derived">Calculado</option>
        </select></label>
        <label><span>Ordenar indicadores</span><select value={order} onChange={event => { setOrder(event.target.value); setLimit(12); }}>
          <option value="catalog">Ordem do catálogo</option><option value="name">Nome de A a Z</option><option value="year">Ano de referência mais recente</option>
        </select></label>
        <label className="catalog-missing"><input type="checkbox" checked={missingReference} onChange={event => { setMissingReference(event.target.checked); setLimit(12); }} /> Apenas sem referência temporal</label>
      </div>
      {order === 'year' && <p>Ordenação pelo ano de referência, sem comparar valores de unidades diferentes. No mesmo ano, os indicadores seguem o nome; dados sem período informado ficam ao final.</p>}
      <div className="catalog-result-status"><p role="status">{matches.length} de {data.indicators.length} indicadores · exibindo {Math.min(limit, matches.length)}</p>
        {(query || status !== 'all' || missingReference || order !== 'catalog') && <button type="button" onClick={() => { setQuery(''); setStatus('all'); setMissingReference(false); setOrder('catalog'); setLimit(12); }}><X aria-hidden="true" /> Limpar filtros</button>}
      </div>
      {matches.length ? <div className="catalog-grid">
        {matches.slice(0, limit).map(item => {
          const source = sourceById.get(item.sourceId);
          const reference = indicatorReference(item, source);
          return <article key={item.id} className="catalog-card">
            <span className="catalog-type">{formatIndicatorStatus(item.status, 'Dado público')}</span>
            <h4>{item.label}</h4><strong className="catalog-value">{formatValue(item)}</strong>
            <dl><div><dt>Referência</dt><dd>{reference.label}</dd></div><div><dt>Fonte</dt><dd>{source?.label ?? 'Fonte não registrada'}</dd></div></dl>
            {item.note && <details><summary>Contexto e limites</summary><p>{item.note}</p></details>}
            {source && <a href={source.resourceUrl ?? source.url} target="_blank" rel="noopener noreferrer">Conferir na fonte <ExternalLink aria-hidden="true" /></a>}
          </article>;
        })}
      </div> : <p className="catalog-empty">Nenhum indicador encontrado. Tente outra palavra ou limpe os filtros.</p>}
      {matches.length > limit && <button type="button" className="civic-search-button catalog-load-more" onClick={() => setLimit(value => value + 12)}>Mostrar mais 12 indicadores</button>}
    </section>
  );
}
