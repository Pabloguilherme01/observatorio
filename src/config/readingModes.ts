export type ReadingMode = 'summary' | 'simple' | 'technical';

const TECHNICAL_ONLY_DESTINATIONS = new Set([
  'contexto',
  'politica',
  'linha-do-tempo',
  'orcamento-impacto',
  'qualidade',
  'evidencias',
  'mapa-evidencias',
  'mudancas-snapshot',
]);

const SUMMARY_HIDDEN_DESTINATIONS = new Set([
  'eleitorado',
  'demografia',
  'transporte',
  'saude',
  'candidaturas',
  'eleitoral360',
  'quiz',
]);

export function modeForDestination(target: string, current: ReadingMode): ReadingMode {
  if (!target) return current;
  if (TECHNICAL_ONLY_DESTINATIONS.has(target)) return 'technical';
  if (SUMMARY_HIDDEN_DESTINATIONS.has(target) && current === 'summary') return 'simple';
  return current;
}

export function fallbackDestinationForMode(target: string, mode: ReadingMode): string | null {
  if (!target || mode === 'technical') return null;

  if (mode === 'summary') {
    return TECHNICAL_ONLY_DESTINATIONS.has(target) || SUMMARY_HIDDEN_DESTINATIONS.has(target)
      ? 'resumo'
      : null;
  }

  if (!TECHNICAL_ONLY_DESTINATIONS.has(target)) return null;
  if (target === 'contexto') return 'dashboard';
  if (target === 'politica' || target === 'linha-do-tempo') return 'eleitoral360';
  if (target === 'orcamento-impacto') return 'orcamento';
  return 'fontes';
}
