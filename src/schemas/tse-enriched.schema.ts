import { z } from 'zod';

export const ProvenanceSchema = z.object({
  fonte: z.string().min(1),
  urlOriginal: z.string().url(),
  capturaEm: z.string().datetime(),
  snapshotId: z.string().min(8),
  arquivoOrigem: z.string().min(1),
});

export const DoadorSchema = z.object({
  nome: z.string().min(1),
  cpfCnpjParcial: z.string().min(1),
  valor: z.number().nonnegative(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tipo: z.enum(['PF', 'PJ', 'Partido', 'Fundo', 'OUTRO']),
  reciboEleitoral: z.string().optional(),
});

export const FornecedorSchema = z.object({
  nome: z.string().min(1),
  cnpj: z.string().min(1),
  valor: z.number().nonnegative(),
  tipoDespesa: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  documentoUrl: z.string().url().optional(),
});

export const ContasCandidatoSchema = z.object({
  candidatoId: z.string().min(1),
  nomeCandidato: z.string().min(1),
  cnpjCampanha: z.string().optional(),
  receitas: z.object({
    total: z.number().nonnegative(),
    qtdDoadores: z.number().int().nonnegative(),
    lista: z.array(DoadorSchema),
  }),
  despesas: z.object({
    total: z.number().nonnegative(),
    qtdFornecedores: z.number().int().nonnegative(),
    lista: z.array(FornecedorSchema),
  }),
  saldo: z.number(),
  documentoUrl: z.string().url().optional(),
  statusPrestacao: z.enum(['NAO_ENVIADA', 'PARCIAL', 'FINAL', 'JULGADA', 'NAO_CLASSIFICADA']),
  proveniencia: ProvenanceSchema,
});

export const TSEContasFileSchema = z.object({
  versao: z.literal('1.0.0'),
  estado: z.enum(['not_ingested', 'first_capture', 'synced', 'stale', 'failed']),
  geradoEm: z.string().datetime(),
  sourceUrl: z.string().url(),
  sourceHash: z.string().min(8),
  totalCandidatosComContas: z.number().int().nonnegative(),
  contas: z.array(ContasCandidatoSchema),
});
export type TSEContasFile = z.infer<typeof TSEContasFileSchema>;

export const PesquisaEleitoralSchema = z.object({
  idPesquisa: z.string().min(1),
  registroTSE: z.string().min(1),
  instituto: z.string().min(1),
  contratante: z.string().optional(),
  pagante: z.string().optional(),
  municipio: z.string().min(1),
  uf: z.string().length(2),
  dataRegistro: z.string(),
  periodoColeta: z.object({ inicio: z.string(), fim: z.string() }),
  amostra: z.number().int().positive(),
  margemErro: z.number().nonnegative().optional(),
  nivelConfianca: z.number().nonnegative().optional(),
  tipo: z.string().min(1),
  questionarioUrl: z.string().url().optional(),
  notaFiscalUrl: z.string().url().optional(),
  detalhamentoBairro: z.boolean(),
  proveniencia: ProvenanceSchema,
});
export const TSEPesquisasFileSchema = z.object({
  versao: z.literal('1.0.0'),
  estado: z.enum(['not_ingested', 'first_capture', 'synced', 'stale', 'failed']),
  geradoEm: z.string().datetime(),
  sourceUrl: z.string().url(),
  sourceHash: z.string().min(8),
  totalPesquisas: z.number().int().nonnegative(),
  pesquisas: z.array(PesquisaEleitoralSchema),
});
export type TSEPesquisasFile = z.infer<typeof TSEPesquisasFileSchema>;

export const EventoProcessualSchema = z.object({
  data: z.string().datetime(),
  tipo: z.string().min(1),
  descricao: z.string().min(1),
  relator: z.string().optional(),
  documentoUrl: z.string().url().optional(),
});
export const ProcessoEleitoralSchema = z.object({
  numeroProcesso: z.string().min(1),
  classe: z.string().min(1),
  assunto: z.string().min(1),
  candidatoId: z.string().optional(),
  municipio: z.string().optional(),
  escopo: z.string().min(1),
  status: z.string().min(1),
  ultimaMovimentacaoEm: z.string().datetime(),
  timeline: z.array(EventoProcessualSchema),
  pjeUrl: z.string().url(),
  proveniencia: ProvenanceSchema,
});
export const TSEProcessualFileSchema = z.object({
  versao: z.literal('1.0.0'),
  estado: z.enum(['not_ingested', 'first_capture', 'synced', 'stale', 'failed']),
  geradoEm: z.string().datetime(),
  sourceUrl: z.string().url(),
  sourceHash: z.string().min(8),
  totalProcessos: z.number().int().nonnegative(),
  processos: z.array(ProcessoEleitoralSchema),
});
export type TSEProcessualFile = z.infer<typeof TSEProcessualFileSchema>;
