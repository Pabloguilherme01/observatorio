import { observatorioData as d } from '../../../data/observatorioData';
import { formatDate } from '../../../utils/formatters';
import { formatIndicatorStatus } from '../../../utils/dataLabels';
import { destinationLabel, resultIcon, sourceForId, sourceLabel, type ResultKind, type SearchResultItem } from './searchResultMeta';

const resultGroups: readonly { key: ResultKind; label: string }[] = [
  { key: 'primary', label: 'Resultados principais' },
  { key: 'data', label: 'Estatísticas e dados' },
  { key: 'source', label: 'Fontes oficiais' },
  { key: 'transport', label: 'Transporte' },
  { key: 'public', label: 'Serviços públicos' },
];

interface SearchResultGroupsProps {
  readonly items: readonly SearchResultItem[];
  readonly activeIndex: number;
  readonly onActiveIndexChange: (index: number) => void;
  readonly onSelect: (id: string, label?: string, kind?: ResultKind, serviceQuery?: string) => void;
}

export function SearchResultGroups({
  items,
  activeIndex,
  onActiveIndexChange,
  onSelect,
}: SearchResultGroupsProps) {
  return resultGroups.map(group => {
    const groupItems = items.filter(item => item.kind === group.key);
    if (!groupItems.length) return null;

    return (
      <section key={group.key} className="search-result-group" aria-labelledby={'search-group-' + group.key}>
        <h3 id={'search-group-' + group.key} className="search-result-group-title">{group.label}</h3>
        <div className="search-result-group-list">
          {groupItems.map(item => {
            const Icon = resultIcon(item.id);
            const index = items.indexOf(item);
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
                onMouseEnter={() => onActiveIndexChange(index)}
                onClick={() => onSelect(item.id, item.label, item.kind, item.serviceQuery)}
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
}
