const indicatorStatusLabels: Record<string, string> = {
  current: 'Atual',
  snapshot: 'Recorte datado',
  planned: 'Planejado',
  derived: 'Derivado',
  historical: 'Histórico',
};

export function formatIndicatorStatus(status?: string, fallback?: string) {
  if (!status) return fallback;
  return indicatorStatusLabels[status] ?? status;
}
