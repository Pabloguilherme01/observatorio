export type ContextMetricId = 'population' | 'populationGrowth' | 'density' | 'schooling' | 'infantMortality' | 'gdpPerCapita';

export interface ContextMetric {
  readonly id: ContextMetricId;
  readonly label: string;
  readonly unit: string;
  readonly year: number;
  readonly description: string;
  readonly nature: 'published' | 'derived';
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
    nature: 'published',
  },
  {
    id: 'populationGrowth',
    label: 'Variação populacional 2022–2026',
    unit: '%',
    year: 2026,
    description: 'Variação percentual entre a população do Censo 2022 e a estimativa de 2026. É um cálculo derivado a partir dos dois valores publicados pelo IBGE.',
    nature: 'derived',
  },
  {
    id: 'density',
    label: 'Densidade estimada 2026',
    unit: 'hab/km²',
    year: 2026,
    description: 'Estimativa de habitantes por quilômetro quadrado calculada com a população de 2026 e a área territorial registrada pelo IBGE.',
    nature: 'derived',
  },
  {
    id: 'schooling',
    label: 'Escolarização 6–14 anos',
    unit: '%',
    year: 2022,
    description: 'Percentual de crianças e adolescentes de 6 a 14 anos matriculados no ensino regular.',
    nature: 'published',
  },
  {
    id: 'infantMortality',
    label: 'Mortalidade infantil',
    unit: 'óbitos por mil nascidos vivos',
    year: 2025,
    description: 'Óbitos de menores de 1 ano por mil nascidos vivos, conforme o indicador exibido pelo IBGE.',
    nature: 'published',
  },
  {
    id: 'gdpPerCapita',
    label: 'PIB per capita',
    unit: 'R$ por habitante',
    year: 2023,
    description: 'Produto Interno Bruto por habitante no ano-base indicado pelo IBGE.',
    nature: 'published',
  },
];

export const contextualMunicipalities: readonly ContextMunicipality[] = [
  {
    name: 'Águas Lindas de Goiás',
    ibgeCode: '5200258',
    census2022Population: 225693,
    areaKm2: 191.817,
    values: { population: 249978, populationGrowth: ((249978 - 225693) / 225693) * 100, density: 249978 / 191.817, schooling: 98.1, infantMortality: 11.23, gdpPerCapita: 13567.92 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html',
  },
  {
    name: 'Valparaíso de Goiás',
    ibgeCode: '5221858',
    census2022Population: 198861,
    areaKm2: 61.488,
    values: { population: 223210, populationGrowth: ((223210 - 198861) / 198861) * 100, density: 223210 / 61.488, schooling: 98.75, infantMortality: 9.63, gdpPerCapita: 18212.92 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/valparaiso-de-goias.html',
  },
  {
    name: 'Luziânia',
    ibgeCode: '5212501',
    census2022Population: 209129,
    areaKm2: 3962.107,
    values: { population: 223596, populationGrowth: ((223596 - 209129) / 209129) * 100, density: 223596 / 3962.107, schooling: 98.56, infantMortality: 11.9, gdpPerCapita: 29956.01 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/luziania.html',
  },
  {
    name: 'Formosa',
    ibgeCode: '5208004',
    census2022Population: 115901,
    areaKm2: 5804.292,
    values: { population: 122613, populationGrowth: ((122613 - 115901) / 115901) * 100, density: 122613 / 5804.292, schooling: 99.01, infantMortality: 14.77, gdpPerCapita: 33806.77 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/formosa.html',
  },
  {
    name: 'Planaltina',
    ibgeCode: '5217609',
    census2022Population: 105031,
    areaKm2: 2558.922,
    values: { population: 113950, populationGrowth: ((113950 - 105031) / 105031) * 100, density: 113950 / 2558.922, schooling: 98.45, infantMortality: 7.49, gdpPerCapita: 18469.82 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/planaltina.html',
  },
  {
    name: 'Novo Gama',
    ibgeCode: '5215231',
    census2022Population: 103804,
    areaKm2: 192.285,
    values: { population: 108219, populationGrowth: ((108219 - 103804) / 103804) * 100, density: 108219 / 192.285, schooling: 98.88, infantMortality: 13.47, gdpPerCapita: 13005.12 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/novo-gama.html',
  },
  {
    name: 'Santo Antônio do Descoberto',
    ibgeCode: '5219753',
    census2022Population: 72127,
    areaKm2: 943.948,
    values: { population: 75814, populationGrowth: ((75814 - 72127) / 72127) * 100, density: 75814 / 943.948, schooling: 98.85, infantMortality: 14.67, gdpPerCapita: 13488.69 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/santo-antonio-do-descoberto.html',
  },
  {
    name: 'Alexânia',
    ibgeCode: '5200308',
    census2022Population: 27008,
    areaKm2: 846.876,
    values: { population: 28474, populationGrowth: ((28474 - 27008) / 27008) * 100, density: 28474 / 846.876, schooling: 97.7, infantMortality: 5.18, gdpPerCapita: 67842.14 },
    url: 'https://www.ibge.gov.br/cidades-e-estados/go/alexania.html',
  },
];

export const contextualMethodology = 'Comparação apenas descritiva, sem ranking. O conjunto reúne oito municípios de Goiás usados como referências de escala para Águas Lindas; cada indicador mantém seu próprio ano-base, unidade e definição. Variação populacional e densidade 2026 são cálculos derivados dos valores publicados pelo IBGE. Valores e fichas foram conferidos nas páginas do IBGE Cidades consultadas em 25/09/2026.';
