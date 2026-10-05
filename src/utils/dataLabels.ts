const indicatorStatusLabels: Record<string, string> = {
  current: 'Atual',
  snapshot: 'Recorte datado',
  planned: 'Planejado',
  derived: 'Derivado',
  historical: 'Histórico',
  legacy: 'Legado',
};

export function formatIndicatorStatus(status?: string, fallback?: string) {
  if (!status) return fallback;
  return indicatorStatusLabels[status] ?? status;
}
