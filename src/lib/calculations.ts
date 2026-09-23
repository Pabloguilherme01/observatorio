export function percentageChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

export function ratioAsPercent(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export function healthCapacity(attendances: number, beds: number): number | null {
  if (beds <= 0) return null;
  return attendances / beds;
}