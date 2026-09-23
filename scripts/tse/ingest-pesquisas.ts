import { join } from 'node:path';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { TSEPesquisasFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import { extractZip, findFile, downloadFile, normalizeLabel, parseDate, readCsv, sha256File, sourceBasename, valueOf, writeJson } from './common.ts';

const SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_eleitoral_2026.zip';
const tmpRoot = join(process.cwd(), '.tmp', 'tse-pesquisas');
const zipPath = join(tmpRoot, 'pesquisas-2026.zip');
const extractDir = join(tmpRoot, 'unzipped');
const outputPath = join(process.cwd(), 'generated', 'tse2026-pesquisas.json');

const MUNICIPIO_POR_CODIGO = new Map<string, string>([
  ['5200258', 'Águas Lindas de Goiás'],
  ['5221858', 'Valparaíso de Goiás'],
  ['5219753', 'Santo Antônio do Descoberto'],
  ['5215231', 'Novo Gama'],
  ['5217609', 'Planaltina'],
]);

const MUNICIPIO_POR_NOME = new Map<string, string>(
  [...MUNICIPIO_POR_CODIGO.values()].map(nome => [normalizeLabel(nome), nome]),
);

mkdirSync(tmpRoot, { recursive: true });
if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });

await downloadFile(SOURCE_URL, zipPath);
extractZip(zipPath, extractDir);

const pesquisaPath = findFile(extractDir, /pesquisa.*_GO\.csv$/i);
const rows = readCsv(pesquisaPath);
const capture = new Date().toISOString();
const headers = rows.length ? Object.keys(rows[0] ?? {}) : [];

console.log('[TSE] headers pesquisas:', headers.join(', '));

const municipalityValue = (row: Readonly<Record<string, string>>): string => {
  const value = valueOf(row, ['DS_DADO_MUNICIPIO'], false);
  return value.trim();
};

const resolveMunicipality = (row: Readonly<Record<string, string>>): { nome: string; criterio: 'codigo' | 'nome_exato' | 'abrangencia_textual'; evidencia: string } | null => {
  const raw = municipalityValue(row);
  if (!raw) return null;
  const normalized = normalizeLabel(raw);
  if (MUNICIPIO_POR_CODIGO.has(raw)) {
    return { nome: MUNICIPIO_POR_CODIGO.get(raw) ?? MUNICIPIO_POR_CODIGO.values().next().value as string, criterio: 'codigo', evidencia: raw };
  }
  const exact = MUNICIPIO_POR_NOME.get(normalized);
  if (exact) return { nome: exact, criterio: 'nome_exato', evidencia: raw };
  for (const [label, nome] of MUNICIPIO_POR_NOME) {
    if (normalized.includes(label)) return { nome, criterio: 'abrangencia_textual', evidencia: raw };
  }
  return null;
};

const distinctMunicipalities = [...new Set(rows.map(row => municipalityValue(row)).filter(Boolean))];
const diagnostics = distinctMunicipalities
  .filter(value => /AGUAS|VALPARAISO|SANTO ANTONIO|NOVO GAMA|PLANALTINA|5200258|5221858|5219753|5215231|5217609/i.test(normalizeLabel(value)))
  .slice(0, 20);

console.log('[TSE] municípios-alvo encontrados:', diagnostics.join(' | ') || 'nenhum');
console.log('[TSE] amostra de municípios no CSV:', distinctMunicipalities.slice(0, 40).join(' | ') || 'nenhum');

const targetRows = rows.filter(row => resolveMunicipality(row) !== null);
console.log('[TSE] linhas correspondentes aos municípios-alvo:', targetRows.length);

const pesquisas = targetRows.map(row => {
  const resolved = resolveMunicipality(row);
  if (!resolved) throw new Error('Linha de pesquisa sem município resolvível após o filtro.');

  return {
    idPesquisa: valueOf(row, ['NR_PROTOCOLO_REGISTRO']),
    registroTSE: valueOf(row, ['NR_PROTOCOLO_REGISTRO']),
    instituto: valueOf(row, ['NM_EMPRESA']),
    contratante: undefined,
    pagante: undefined,
    municipio: resolved.nome,
    abrangenciaDetectada: resolved.evidencia,
    criterioMunicipio: resolved.criterio,
    uf: valueOf(row, ['SG_UF']),
    dataRegistro: parseDate(valueOf(row, ['DT_REGISTRO'])),
    periodoColeta: {
      inicio: parseDate(valueOf(row, ['DT_INICIO_PESQUISA'])),
      fim: parseDate(valueOf(row, ['DT_FIM_PESQUISA'])),
    },
    amostra: Number(valueOf(row, ['QT_ENTREVISTADO'])),
    margemErro: undefined,
    nivelConfianca: undefined,
    tipo: valueOf(row, ['DS_CARGO']),
    detalhamentoBairro: true,
    proveniencia: {
      fonte: 'TSE - Pesquisas Eleitorais 2026',
      urlOriginal: SOURCE_URL,
      capturaEm: capture,
      snapshotId: sha256File(zipPath),
      arquivoOrigem: sourceBasename(zipPath),
    },
  };
});

const output = TSEPesquisasFileSchema.parse({
  versao: '1.0.0',
  estado: 'first_capture',
  geradoEm: capture,
  sourceUrl: SOURCE_URL,
  sourceHash: sha256File(zipPath),
  totalPesquisas: pesquisas.length,
  pesquisas,
});

writeJson(outputPath, output);
console.log('pesquisas: ' + output.totalPesquisas + ' registros · sha256 ' + sha256File(zipPath));
