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
  readonly census2022Population: number;
  readonly areaKm2: number;
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
    census2022Population: 225693,
    areaKm2: 191.817,
    values: { population: 249978, schooling: 98.1, infantMortality: 11.23, gdpPerCapita: 13567.92 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html',
  },
  {
    name: 'Valparaíso de Goiás',
    ibgeCode: '5221858',
    census2022Population: 198861,
    areaKm2: 61.488,
    values: { population: 223210, schooling: 98.75, infantMortality: 9.63, gdpPerCapita: 18212.92 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/valparaiso-de-goias.html',
  },
  {
    name: 'Luziânia',
    ibgeCode: '5212501',
    census2022Population: 209129,
    areaKm2: 3962.107,
    values: { population: 223596, schooling: 98.56, infantMortality: 11.9, gdpPerCapita: 29956.01 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/luziania.html',
  },
  {
    name: 'Formosa',
    ibgeCode: '5208004',
    census2022Population: 115901,
    areaKm2: 5804.292,
    values: { population: 122613, schooling: 99.01, infantMortality: 14.77, gdpPerCapita: 33806.77 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/formosa.html',
  },
  {
    name: 'Planaltina',
    ibgeCode: '5217609',
    census2022Population: 105031,
    areaKm2: 2558.922,
    values: { population: 113950, schooling: 98.45, infantMortality: 7.49, gdpPerCapita: 18469.82 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/planaltina.html',
  },
  {
    name: 'Novo Gama',
    ibgeCode: '5215231',
    census2022Population: 103804,
    areaKm2: 192.285,
    values: { population: 108219, schooling: 98.88, infantMortality: 13.47, gdpPerCapita: 13005.12 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/novo-gama.html',
  },
  {
    name: 'Santo Antônio do Descoberto',
    ibgeCode: '5219753',
    census2022Population: 72127,
    areaKm2: 943.948,
    values: { population: 75814, schooling: 98.85, infantMortality: 14.67, gdpPerCapita: 13488.69 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/santo-antonio-do-descoberto.html',
  },
  {
    name: 'Alexânia',
    ibgeCode: '5200308',
    census2022Population: 27008,
    areaKm2: 846.876,
    values: { population: 28474, schooling: 97.7, infantMortality: 5.18, gdpPerCapita: 67842.14 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/alexania.html',
  },
];

export const contextualMethodology = 'Comparação apenas descritiva, sem ranking. O conjunto reúne oito municípios de Goiás usados como referências de escala para Águas Lindas; cada indicador mantém seu próprio ano-base, unidade e definição. Valores e fichas foram conferidos nas páginas do IBGE Cidades consultadas em 25/09/2026.';
