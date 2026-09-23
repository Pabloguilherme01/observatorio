import { join } from 'node:path';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { TSEContasFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import {
  extractZip, findFile, downloadFile, parseCsv, parseDate, parseMoney, partialDocument, readCsv, readJson, sha256File, sourceBasename, valueOf, writeJson,
} from './common.ts';

interface CandidateRecord {
  readonly sqCandidate: string;
  readonly name: string;
}

interface CandidateSnapshot {
  readonly matched: ReadonlyArray<CandidateRecord>;
}

const SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/prestacao_contas/prestacao_de_contas_eleitorais_candidatos_2026.zip';
const tmpRoot = join(process.cwd(), '.tmp', 'tse-contas');
const zipPath = join(tmpRoot, 'contas-2026.zip');
const extractDir = join(tmpRoot, 'unzipped');
// O ZIP possui arquivos por UF; este ingestor trabalha exclusivamente com o arquivo de Goiás.
const outputPath = join(process.cwd(), 'generated', 'tse2026-contas.json');

mkdirSync(tmpRoot, { recursive: true });
if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });

const sourceHash = await downloadFile(SOURCE_URL, zipPath);
extractZip(zipPath, extractDir);

const candidateSnapshot = readJson<CandidateSnapshot>('src/data/generated/tse2026-candidates.json');
const watchlist = new Map(candidateSnapshot.matched.map(candidate => [candidate.sqCandidate, candidate]));
const receitasPath = findFile(extractDir, /receitas.*candidato.*_GO\.csv$/i);
const despesasPath = findFile(extractDir, /despesas.*candidato.*_GO\.csv$/i);
const receitas = readCsv(receitasPath);
const despesas = readCsv(despesasPath);

const capture = new Date().toISOString();
const byCandidate = new Map<string, {
  readonly candidate: CandidateRecord;
  readonly receitas: { total: number; lista: Array<{ nome: string; cpfCnpjParcial: string; valor: number; data: string; tipo: 'PF' | 'PJ' | 'Partido' | 'Fundo' | 'OUTRO' }> };
  readonly despesas: { total: number; lista: Array<{ nome: string; cnpj: string; valor: number; tipoDespesa: string; data: string }> };
}>();

for (const candidate of watchlist.values()) {
  byCandidate.set(candidate.sqCandidate, { candidate, receitas: { total: 0, lista: [] }, despesas: { total: 0, lista: [] } });
}

for (const row of receitas) {
  const id = valueOf(row, ['SQ_CANDIDATO', 'SQ_CANDIDATO_']);
  const bucket = byCandidate.get(id);
  if (!bucket) continue;
  const value = parseMoney(valueOf(row, ['VR_RECEITA', 'VR_RECEITA_TOTAL']));
  const tipoRaw = valueOf(row, ['TP_DOADOR', 'DS_TIPO_DOADOR'], false).toUpperCase();
  const tipo = tipoRaw.includes('JURID') ? 'PJ' : tipoRaw.includes('FISIC') ? 'PF' : tipoRaw.includes('PART') ? 'Partido' : tipoRaw.includes('FUNDO') ? 'Fundo' : 'OUTRO';
  bucket.receitas.total += value;
  bucket.receitas.lista.push({
    nome: valueOf(row, ['NM_DOADOR', 'NM_DOADOR_ORIGINARIO']),
    cpfCnpjParcial: partialDocument(valueOf(row, ['CPF_CNPJ_DOADOR', 'CPF_CNPJ_DOADOR_ORIGINARIO'], false)),
    valor: value,
    data: parseDate(valueOf(row, ['DT_RECEITA', 'DT_LANCAMENTO'])),
    tipo,
  });
}

for (const row of despesas) {
  const id = valueOf(row, ['SQ_CANDIDATO', 'SQ_CANDIDATO_']);
  const bucket = byCandidate.get(id);
  if (!bucket) continue;
  const value = parseMoney(valueOf(row, ['VR_DESPESA', 'VR_DESPESA_TOTAL', 'VR_DESPESA_CONTRATADA']));
  bucket.despesas.total += value;
  bucket.despesas.lista.push({
    nome: valueOf(row, ['NM_FORNECEDOR', 'NM_FORNECEDOR_ORIGINARIO']),
    cnpj: partialDocument(valueOf(row, ['CPF_CNPJ_FORNECEDOR', 'CPF_CNPJ_FORNECEDOR_ORIGINARIO'], false)),
    valor: value,
    tipoDespesa: valueOf(row, ['DS_TIPO_DESPESA', 'DS_TIPO_DESPESA_FINALIDADE'], false) || 'Não informado',
    data: parseDate(valueOf(row, ['DT_DESPESA', 'DT_LANCAMENTO'])),
  });
}

const contas = [...byCandidate.values()]
  .filter(bucket => bucket.receitas.lista.length > 0 || bucket.despesas.lista.length > 0)
  .map(bucket => {
  const saldo = bucket.receitas.total - bucket.despesas.total;
  return {
    candidatoId: bucket.candidate.sqCandidate,
    nomeCandidato: bucket.candidate.name,
    receitas: {
      total: bucket.receitas.total,
      qtdDoadores: bucket.receitas.lista.length,
      lista: bucket.receitas.lista,
    },
    despesas: {
      total: bucket.despesas.total,
      qtdFornecedores: bucket.despesas.lista.length,
      lista: bucket.despesas.lista,
    },
    saldo,
    statusPrestacao: 'PARCIAL' as const,
    documentoUrl: 'https://divulgacandcontas.tse.jus.br/',
    proveniencia: {
      fonte: 'TSE - Prestação de Contas 2026',
      urlOriginal: SOURCE_URL,
      capturaEm: capture,
      snapshotId: sourceHash,
      arquivoOrigem: sourceBasename(zipPath),
    },
  };
});

const output = TSEContasFileSchema.parse({
  versao: '1.0.0',
  estado: 'synced',
  geradoEm: capture,
  sourceUrl: SOURCE_URL,
  sourceHash,
  totalCandidatosComContas: contas.length,
  contas,
});

writeJson(outputPath, output);
console.log('contas: ' + output.totalCandidatosComContas + ' registros · sha256 ' + sha256File(zipPath));
