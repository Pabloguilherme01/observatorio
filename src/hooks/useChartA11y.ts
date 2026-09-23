import { useMemo } from 'react';

export interface ChartA11yDatum {
  readonly label: string;
  readonly value: number;
}

export function useChartA11y(data: readonly ChartA11yDatum[], title: string): string {
  return useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (!data.length || total <= 0) {
      return 'Gráfico sobre ' + title + '. Não há dados numéricos disponíveis para resumir.';
    }

    const details = data.map(item => {
      const percentage = (item.value / total) * 100;
      return item.label + ' totaliza ' +
        item.value.toLocaleString('pt-BR') +
        ' reais, representando ' +
        percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) +
        '% do total';
    });

    return 'Gráfico de dados sobre ' + title + '. ' + details.join('. ') + '.';
  }, [data, title]);
}
