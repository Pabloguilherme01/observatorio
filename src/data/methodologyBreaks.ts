export interface MethodologyBreak {
  readonly id: string;
  readonly fonte: string;
  readonly anos: readonly string[];
  readonly aviso: string;
  readonly fonteUrl: string;
}

export const METHODOLOGY_BREAKS: readonly MethodologyBreak[] = [
  {
    id: 'ips-series-break',
    fonte: 'IPS Brasil',
    anos: ['2024', '2025', '2026'],
    aviso: 'Resultados não são estritamente comparáveis entre anos sem tratamento metodológico específico.',
    fonteUrl: 'https://ipsbrasil.org.br/conheca/metodologia',
  },
];
