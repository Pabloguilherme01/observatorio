import type { ISODate } from '../types/observatorio';
import { observatorioData } from './observatorioData';
import { sourceRegistry } from './sourceRegistry';

export type HealthLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface DataHealth {
  readonly frescura: HealthLevel;
  readonly proveniencia: HealthLevel;
  readonly cobertura: HealthLevel;
  readonly reconciliacao: HealthLevel;
  readonly automacao: HealthLevel;
  readonly calculadoEm: ISODate;
}

function freshnessScore(referenceDate?: string, now = new Date('2026-09-23T12:00:00-03:00')): HealthLevel {
  if (!referenceDate) return 1;
  const parsed = new Date(referenceDate);
  if (Number.isNaN(parsed.getTime())) return 0;
  const days = Math.max(0, Math.floor((now.getTime() - parsed.getTime()) / 86_400_000));
  if (days <= 7) return 5;
  if (days <= 30) return 4;
  if (days <= 90) return 3;
  if (days <= 365) return 2;
  return 1;
}

function provenanceScore(sourceId: string): HealthLevel {
  const source = sourceRegistry.find(item => item.id === sourceId);
  if (!source) return 0;
  if (source.nature === 'official') return 5;
  if (source.nature === 'secondary') return 3;
  if (source.nature === 'derived') return 2;
  return 1;
}

function coverageScore(sourceId: string): HealthLevel {
  if (sourceId === 'tse-candidatos-2026') return 3;
  if (sourceId.startsWith('tse-')) return 4;
  return 5;
}

function reconciliationScore(sourceId: string): HealthLevel {
  if (sourceId === 'reconciliacao-eleitorado-2026') return 3;
  if (sourceId.includes('tse-') || sourceId.includes('ibge-')) return 4;
  return 3;
}

function automationScore(sourceId: string): HealthLevel {
  if (sourceId === 'tse-candidatos-2026') return 5;
  if (sourceId.startsWith('tse-')) return 4;
  return 3;
}

export function buildDataHealth() {
  const calculatedAt: ISODate = observatorioData.meta.updatedAt;
  const entries = observatorioData.indicators.map(indicator => ({
    id: indicator.id,
    label: indicator.label,
    health: {
      frescura: freshnessScore(indicator.referenceDate),
      proveniencia: provenanceScore(indicator.sourceId),
      cobertura: coverageScore(indicator.sourceId),
      reconciliacao: reconciliationScore(indicator.sourceId),
      automacao: automationScore(indicator.sourceId),
      calculadoEm: calculatedAt,
    } satisfies DataHealth,
  }));
  return {
    schemaVersion: 1,
    calculadoEm: calculatedAt,
    dimensions: ['frescura', 'proveniencia', 'cobertura', 'reconciliacao', 'automacao'] as const,
    entries,
  };
}

export const DATA_HEALTH = buildDataHealth();
