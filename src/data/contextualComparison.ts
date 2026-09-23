export type ContextMetricId = 'population' | 'schooling' | 'infantMortality' | 'gdpPerCapita';

export interface ContextMetric {
  readonly id: ContextMetricId;
  readonly label: string;
  readonly unit: string;
  readonly year: number;
  readonly description: string;
}

export interface ContextMunicipality {
  readonly name: string;
  readonly ibgeCode: string;
  readonly values: Readonly<Record<ContextMetricId, number>>;
  readonly url: string;
}

export const contextualMetrics: readonly ContextMetric[] = [
  {
    id: 'population',
    label: 'População estimada',
    unit: 'habitantes',
    year: 2026,
    description: 'Estimativa populacional publicada pelo IBGE com referência em 1º de julho.',
  },
  {
    id: 'schooling',
    label: 'Escolarização 6–14 anos',
    unit: '%',
    year: 2022,
    description: 'Percentual de crianças e adolescentes de 6 a 14 anos matriculados no ensino regular.',
  },
  {
    id: 'infantMortality',
    label: 'Mortalidade infantil',
    unit: 'óbitos por mil nascidos vivos',
    year: 2025,
    description: 'Óbitos de menores de 1 ano por mil nascidos vivos, conforme o indicador exibido pelo IBGE.',
  },
  {
    id: 'gdpPerCapita',
    label: 'PIB per capita',
    unit: 'R$ por habitante',
    year: 2023,
    description: 'Produto Interno Bruto por habitante no ano-base indicado pelo IBGE.',
  },
];

export const contextualMunicipalities: readonly ContextMunicipality[] = [
  {
    name: 'Águas Lindas de Goiás',
    ibgeCode: '5200258',
    values: { population: 249978, schooling: 98.1, infantMortality: 11.23, gdpPerCapita: 13567.92 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html',
  },
  {
    name: 'Valparaíso de Goiás',
    ibgeCode: '5221858',
    values: { population: 223210, schooling: 98.75, infantMortality: 9.63, gdpPerCapita: 18212.92 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/valparaiso-de-goias.html',
  },
  {
    name: 'Santo Antônio do Descoberto',
    ibgeCode: '5219753',
    values: { population: 75814, schooling: 98.85, infantMortality: 14.67, gdpPerCapita: 13488.69 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/santo-antonio-do-descoberto.html',
  },
];

export const contextualMethodology = 'Comparação apenas descritiva, sem ranking. Os municípios foram selecionados como referências do Entorno do DF; os anos-base e definições permanecem visíveis em cada indicador.';
