export function formatNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits).replace('.', ',')}%`;
}