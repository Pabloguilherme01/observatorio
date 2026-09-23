import type { DataNature, ISODate } from '../types/observatorio';

export type ProvenanceType = 'OFICIAL' | 'DERIVADO' | 'ESTIMATIVA' | 'SECUNDARIO';

export interface ProvenanceData {
  readonly valueId: string;
  readonly fonte: string;
  readonly fonteUrl: string;
  readonly referencia: string;
  readonly publicacao?: ISODate;
  readonly capturadoEm: ISODate;
  readonly checksum?: string;
  readonly tipo: ProvenanceType;
  readonly transformacao?: string;
  readonly limitacoes?: readonly string[];
  readonly snapshotId?: string;
  readonly rawUrl?: string;
}

const natureToType: Record<DataNature, ProvenanceType> = {
  official: 'OFICIAL',
  secondary: 'SECUNDARIO',
  derived: 'DERIVADO',
  legacy: 'SECUNDARIO',
};

export const PROVENANCE: Readonly<Record<string, ProvenanceData>> = {
  'populacao-aguas-lindas': {
    valueId: 'populacao-aguas-lindas',
    fonte: 'IBGE — Estimativas da População 2026',
    fonteUrl: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9103-estimativas-de-populacao.html',
    referencia: '2026-07-01',
    publicacao: '2026-08-28',
    capturadoEm: '2026-09-23',
    tipo: 'ESTIMATIVA',
    limitacoes: ['Estimativa municipal, não Censo.'],
  },
  'densidade-2026': {
    valueId: 'densidade-2026',
    fonte: 'IBGE — população estimada + área territorial',
    fonteUrl: 'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html',
    referencia: '2026-07-01',
    capturadoEm: '2026-09-23',
    tipo: 'DERIVADO',
    transformacao: '249.978 ÷ 191,817 km² = 1.303,18 hab/km²',
    limitacoes: ['Não é o indicador oficial de densidade do Censo 2022.'],
  },
  'eleitorado-2026': {
    valueId: 'eleitorado-2026',
    fonte: 'TSE — Eleitorado 2026 / dados abertos',
    fonteUrl: 'https://dadosabertos.tse.jus.br/dataset/groups/eleitorado-2026',
    referencia: '2026-07-15',
    capturadoEm: '2026-09-23',
    tipo: 'OFICIAL',
    limitacoes: ['Snapshot local da base utilizada nesta edição.'],
  },
  'loa-2026': {
    valueId: 'loa-2026',
    fonte: 'Lei Municipal 1.847/2026 — LOA',
    fonteUrl: 'https://legislacao.aguaslindasdegoias.go.gov.br/leis/1654',
    referencia: '2026',
    capturadoEm: '2026-09-23',
    tipo: 'OFICIAL',
  },
  'saneamento-2024': {
    valueId: 'saneamento-2024',
    fonte: 'Instituto Água e Saneamento — SINISA 2024',
    fonteUrl: 'https://www.aguaesaneamento.org.br/municipios-e-saneamento/go/aguas-lindas-de-goias',
    referencia: '2024',
    capturadoEm: '2026-09-23',
    tipo: 'SECUNDARIO',
    limitacoes: ['Painel secundário que reproduz indicadores do SINISA.'],
  },
};

export function provenanceFromSource(
  valueId: string,
  source: {
    readonly label: string;
    readonly url: string;
    readonly nature: DataNature;
    readonly referenceDate?: ISODate;
    readonly publishedAt?: ISODate;
    readonly note?: string;
  },
  capturedAt: ISODate,
  overrides: Partial<Omit<ProvenanceData, 'valueId' | 'fonte' | 'fonteUrl' | 'referencia' | 'capturadoEm' | 'tipo'>> = {},
): ProvenanceData {
  return {
    valueId,
    fonte: source.label,
    fonteUrl: source.url,
    referencia: source.referenceDate ?? 'sem data registrada',
    publicacao: source.publishedAt,
    capturadoEm: capturedAt,
    tipo: natureToType[source.nature],
    limitacoes: source.note ? [source.note] : undefined,
    ...overrides,
  };
}

export function getProvenance(valueId: string): ProvenanceData | undefined {
  return PROVENANCE[valueId];
}
