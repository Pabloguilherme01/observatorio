export type ReadingMode = 'summary' | 'simple' | 'guided' | 'technical';

const GUIDED_ONLY_DESTINATIONS = new Set(['aprendizado-guiado']);

const TECHNICAL_ONLY_DESTINATIONS = new Set([
  'contexto',
  'orcamento-impacto',
  'qualidade',
  'evidencias',
  'mapa-evidencias',
]);

const SUMMARY_HIDDEN_DESTINATIONS = new Set([
  'demografia',
  'transporte',
  'saude',
  'quiz',
]);

export function modeForDestination(target: string, current: ReadingMode): ReadingMode {
  if (!target) return current;
  if (GUIDED_ONLY_DESTINATIONS.has(target)) return 'guided';
  if (TECHNICAL_ONLY_DESTINATIONS.has(target)) return 'technical';
  if (SUMMARY_HIDDEN_DESTINATIONS.has(target) && current === 'summary') return 'simple';
  return current;
}

export function fallbackDestinationForMode(target: string, mode: ReadingMode): string | null {
  if (!target) return null;
  if (GUIDED_ONLY_DESTINATIONS.has(target) && mode !== 'guided') return 'resumo';
  if (mode === 'technical') return null;

  if (mode === 'summary') {
    return TECHNICAL_ONLY_DESTINATIONS.has(target) || SUMMARY_HIDDEN_DESTINATIONS.has(target)
      ? 'resumo'
      : null;
  }

  if (!TECHNICAL_ONLY_DESTINATIONS.has(target)) return null;
  if (target === 'contexto') return 'dashboard';
  if (target === 'orcamento-impacto') return 'orcamento';
  return 'fontes';
}
