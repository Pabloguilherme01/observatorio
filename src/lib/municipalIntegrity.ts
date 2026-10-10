import type { ObservatoryData } from '../types/observatorio.js';

export function municipalIntegrity(data: ObservatoryData) {
  const sources = new Set(data.sources.map(source => source.id));
  const unresolvedSources = new Set<string>();
  const inspect = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
      if (/sourceId$/i.test(key) && typeof item === 'string' && !sources.has(item)) unresolvedSources.add(item);
      else if (/sourceIds$/i.test(key) && Array.isArray(item)) item.forEach(id => { if (typeof id !== 'string' || !sources.has(id)) unresolvedSources.add(String(id)); });
      else inspect(item);
    }
  };
  inspect(data);
  const uniqueIndicators = new Set(data.indicators.map(item => item.id)).size === data.indicators.length;
  const uniqueSources = sources.size === data.sources.length;
  const validValues = data.indicators.every(item => typeof item.value === 'string' || Number.isFinite(item.value));
  const publicationDate = new Date(data.meta.updatedAt + 'T00:00:00Z');
  const validPublication = /^\d{4}-\d{2}-\d{2}$/.test(data.meta.updatedAt) && Number.isFinite(publicationDate.getTime()) && publicationDate.toISOString().slice(0,10) === data.meta.updatedAt && Boolean(data.meta.municipality);
  const validStructure = data.sources.length > 0 && data.indicators.length > 0 && data.populationSeries.length > 0 && data.indicators.every(item => Boolean(item.id && item.label && item.unit)) && data.sources.every(source => { try { return Boolean(source.id && source.label && source.institution) && new URL(source.url).protocol === 'https:'; } catch { return false; } });
  return { valid: validStructure && uniqueIndicators && uniqueSources && validValues && validPublication && unresolvedSources.size === 0,
    validStructure, uniqueIndicators, uniqueSources, validValues, validPublication, unresolvedSources: [...unresolvedSources] };
}
