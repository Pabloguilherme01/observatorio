import type { MunicipalIndicator, SourceRef } from '../types/observatorio';
import { formatDate } from '../utils/formatters';

/** A year base is a period, never an invented January 1 capture date. */
export function indicatorReference(indicator: MunicipalIndicator, source?: SourceRef) {
  const date = indicator.referenceDate;
  if (date) return { key: `date:${date}`, label: formatDate(date), precision: 'date' as const };
  const year = indicator.note?.match(/Ano-base\s+(\d{4})/i)?.[1];
  if (year) return { key: `year:${year}`, label: `Ano-base ${year}`, precision: 'year' as const };
  if (source?.referenceDate) return { key: `date:${source.referenceDate}`, label: formatDate(source.referenceDate), precision: 'date' as const };
  return { key: null, label: 'Referência não informada', precision: 'unknown' as const };
}
