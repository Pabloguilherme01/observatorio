import '../../assets/styles/indicator-comparator.css';
import { useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, ExternalLink, Scale } from 'lucide-react';
import { observatorioData as data } from '../../data/observatorioData';
import type { MunicipalIndicator } from '../../types/observatorio';
import { formatIndicatorStatus } from '../../utils/dataLabels';
import { formatBudgetCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { copyText } from '../../lib/clipboard';
import { indicatorReference } from '../../lib/indicatorReference';

const comparableIndicators = data.indicators.filter(
  (indicator): indicator is MunicipalIndicator & { readonly value: number } =>
    typeof indicator.value === 'number' && Number.isFinite(indicator.value),
);

const initialLeft = comparableIndicators.some(indicator => indicator.id === 'water-access-2024')
  ? 'water-access-2024'
  : comparableIndicators[0]?.id ?? '';
const initialRight = comparableIndicators.some(indicator => indicator.id === 'sewer-collection-2024')
  ? 'sewer-collection-2024'
  : comparableIndicators.find(indicator => indicator.id !== initialLeft)?.id ?? initialLeft;

function formatIndicatorValue(indicator: MunicipalIndicator & { readonly value: number }): string {
  const value = indicator.value;
  switch (indicator.unit) {
    case '%': return formatPercent(value, 1);
    case 'BRL': return formatBudgetCurrency(value);
    case 'BRL/trecho': return `${formatBudgetCurrency(value)} por trecho`;
    case 'BRL/mês': return `${formatBudgetCurrency(value)} por mês`;
    case 'BRL/m³': return `${formatBudgetCurrency(value)} por m³`;
    case 'BRL/habitante': return `${formatBudgetCurrency(value)} por habitante`;
    case 'hab/km²': return `${formatNumber(value, 2)} hab/km²`;
    case 'L/pessoa/dia': return `${formatNumber(value, 1)} L/pessoa/dia`;
    default: return `${formatNumber(value)} ${indicator.unit}`;
  }
}

function IndicatorCard({ indicator, side }: { readonly indicator: MunicipalIndicator & { readonly value: number }; readonly side: 'A' | 'B' }) {
  const source = data.sources.find(item => item.id === indicator.sourceId);
  const sourceUrl = source?.resourceUrl ?? source?.url;

  return (
    <article className="indicator-compare-card" aria-label={`Indicador ${side}: ${indicator.label}`}>
      <div className="indicator-compare-card-kicker">Indicador {side}</div>
      <h4>{indicator.label}</h4>
      <p className="indicator-compare-value">{formatIndicatorValue(indicator)}</p>
      <dl className="indicator-compare-meta">
        <div><dt>Unidade</dt><dd>{indicator.unit}</dd></div>
        <div><dt>Referência</dt><dd>{indicatorReference(indicator, source).label}</dd></div>
        <div><dt>Natureza</dt><dd>{formatIndicatorStatus(indicator.status, 'Dado público')}</dd></div>
        <div><dt>Fonte</dt><dd>{source?.label ?? 'Fonte registrada no conjunto de dados'}</dd></div>
      </dl>
      {indicator.note && <p className="indicator-compare-note">{indicator.note}</p>}
      {sourceUrl && (
        <a className="indicator-compare-source" href={sourceUrl} target="_blank" rel="noreferrer">
          Abrir fonte <ExternalLink aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

export function IndicatorComparator() {
  const getInitialPair = () => {
    if (typeof window === 'undefined') return [initialLeft, initialRight] as const;
    const params = new URLSearchParams(window.location.search);
    const sharedLeft = params.get('comparar');
    const sharedRight = params.get('com');
    const validLeft = comparableIndicators.some(indicator => indicator.id === sharedLeft);
    const validRight = comparableIndicators.some(indicator => indicator.id === sharedRight);
    return validLeft && validRight && sharedLeft !== sharedRight
      ? [sharedLeft, sharedRight] as const
      : [initialLeft, initialRight] as const;
  };
  const [initialPair] = useState(getInitialPair);
  const [leftId, setLeftId] = useState(initialPair[0]);
  const [rightId, setRightId] = useState(initialPair[1]);
  const [shareMessage, setShareMessage] = useState('');
  const left = comparableIndicators.find(indicator => indicator.id === leftId) ?? comparableIndicators[0];
  const right = comparableIndicators.find(indicator => indicator.id === rightId)
    ?? comparableIndicators.find(indicator => indicator.id !== left?.id)
    ?? left;

  const alignment = useMemo(() => {
    if (!left || !right) return null;
    const leftPeriod = indicatorReference(left, data.sources.find(source => source.id === left.sourceId));
    const rightPeriod = indicatorReference(right, data.sources.find(source => source.id === right.sourceId));
    return {
      unit: left.unit === right.unit,
      date: Boolean(leftPeriod.key && leftPeriod.key === rightPeriod.key),
      source: left.sourceId === right.sourceId,
    };
  }, [left, right]);

  if (!left || !right || !alignment) return null;

  const matchedCount = Number(alignment.unit) + Number(alignment.date) + Number(alignment.source);
  const percentageScale = [left, right].every(item => item.unit === '%' && item.value >= 0 && item.value <= 100);
  const relation = matchedCount === 3
    ? 'Unidade, referência temporal e fonte coincidem. Isso não garante equivalência: confira a definição e o denominador de cada indicador.'
    : 'Há diferenças de unidade, data ou fonte. Use a comparação para entender o contexto; não subtraia nem ordene os valores como se fossem equivalentes.';

  const copyComparisonLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('comparar', left.id);
    url.searchParams.set('com', right.id);
    url.hash = 'dashboard';
    const copied = await copyText(url.toString());
    setShareMessage(copied ? 'Link da comparação copiado.' : 'Não foi possível copiar. Copie o endereço da página.');
  };

  return (
    <section className="indicator-comparator" aria-labelledby="indicator-comparator-title">
      <div className="indicator-comparator-heading">
        <div className="indicator-comparator-icon" aria-hidden="true"><Scale /></div>
        <div>
          <span>Ferramenta de leitura</span>
          <h3 id="indicator-comparator-title">Compare dois indicadores</h3>
          <p>Escolha os dados e confira unidade, período, natureza e fonte lado a lado.</p>
        </div>
      </div>

      <div className="indicator-compare-selectors">
        <label>
          <span>Primeiro indicador</span>
          <select value={left.id} onChange={event => setLeftId(event.target.value)} aria-label="Escolha o primeiro indicador">
            {comparableIndicators.map(indicator => (
              <option key={indicator.id} value={indicator.id} disabled={indicator.id === right.id}>{indicator.label}</option>
            ))}
          </select>
        </label>
        <div className="indicator-compare-connector" aria-hidden="true"><ArrowLeftRight /></div>
        <label>
          <span>Segundo indicador</span>
          <select value={right.id} onChange={event => setRightId(event.target.value)} aria-label="Escolha o segundo indicador">
            {comparableIndicators.map(indicator => (
              <option key={indicator.id} value={indicator.id} disabled={indicator.id === left.id}>{indicator.label}</option>
            ))}
          </select>
        </label>
      </div>

      <figure className="indicator-scale" aria-labelledby="indicator-scale-title">
        <figcaption id="indicator-scale-title">{percentageScale ? 'Cada percentual na escala de 0 a 100%' : 'Leitura visual indisponível para esta seleção'}</figcaption>
        {percentageScale ? <>
          <p>As barras mostram cada percentual. Os universos podem ser diferentes; a distância entre as barras não representa melhora, piora ou diferença comparável.</p>
          {[left, right].map((item, index) => <div className="indicator-scale-row" key={item.id}>
            <div><span>{index === 0 ? 'A' : 'B'} · {item.label}</span><strong>{formatIndicatorValue(item)}</strong></div>
            <div className="indicator-scale-track" aria-hidden="true"><span style={{ width: `${item.value}%` }} /></div>
            <small>{indicatorReference(item, data.sources.find(source => source.id === item.sourceId)).label}</small>
          </div>)}
          <div className="indicator-scale-axis" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div>
        </> : <p>Use os valores e referências abaixo. Uma escala comum para unidades diferentes ou valores fora de 0 a 100% poderia sugerir uma comparação inválida.</p>}
      </figure>

      <div className="indicator-compare-results" aria-live="polite">
        <IndicatorCard indicator={left} side="A" />
        <IndicatorCard indicator={right} side="B" />
      </div>

      <div className="indicator-compare-share">
        <button type="button" onClick={copyComparisonLink}>
          <Copy aria-hidden="true" /> Copiar link desta comparação
        </button>
        <span aria-live="polite">{shareMessage}</span>
      </div>

      <p className={`indicator-compare-guidance ${matchedCount === 3 ? 'is-aligned' : ''}`}>
        <strong>{matchedCount === 3 ? 'Pontos de referência alinhados' : 'Confira antes de comparar'}</strong>
        <span>{relation}</span>
      </p>
    </section>
  );
}
