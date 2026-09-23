import { join } from 'node:path';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { TSEPesquisasFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import { extractZip, findFile, downloadFile, normalizeLabel, parseDate, readCsv, sha256File, valueOf, writeJson } from './common.ts';

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

const pesquisaPath = findFile(extractDir, /pesquisa.*\.csv$/i);
const rows = readCsv(pesquisaPath);
const capture = new Date().toISOString();
const headers = rows.length ? Object.keys(rows[0] ?? {}) : [];
console.log('[TSE] headers pesquisas:', headers.join(', '));

const municipalityValue = (row: Readonly<Record<string, string>>): string => {
  for (const alias of [
    'DS_DADO_MUNICIPIO',
    'NM_MUNICIPIO',
    'DS_MUNICIPIO',
    'NM_CIDADE',
    'DS_CIDADE',
    'MUNICIPIO',
    'CD_MUNICIPIO',
  ]) {
    const value = valueOf(row, [alias], false);
    if (value) return value.trim();
  }
  return '';
};

const resolveMunicipality = (row: Readonly<Record<string, string>>): string | null => {
  const raw = municipalityValue(row);
  if (!raw) return null;
  if (MUNICIPIO_POR_CODIGO.has(raw)) return MUNICIPIO_POR_CODIGO.get(raw) ?? null;
  return MUNICIPIO_POR_NOME.get(normalizeLabel(raw)) ?? null;
};

const targetRows = rows.filter(row => resolveMunicipality(row) !== null);

const diagnostics = [...new Set(rows.map(row => municipalityValue(row)).filter(Boolean))]
  .filter(value => /AGUAS|VALPARAISO|SANTO ANTONIO|NOVO GAMA|PLANALTINA|5200258|5221858|5219753|5215231|5217609/i.test(normalizeLabel(value)))
  .slice(0, 20);
console.log('[TSE] municípios candidatos encontrados:', diagnostics.join(' | ') || 'nenhum');

if (targetRows.length === 0) {
  throw new Error('Nenhuma pesquisa dos municípios-alvo foi identificada. Cabeçalhos=' + headers.join(', ') + '; verifique o layout oficial antes de promover a captura.');
}
const pesquisas = targetRows.map(row => {
  const municipality = resolveMunicipality(row);
  if (!municipality) throw new Error('Linha de pesquisa sem município resolvível após o filtro.');
  return {
    idPesquisa: valueOf(row, ['NR_PROTOCOLO_REGISTRO']),
    registroTSE: valueOf(row, ['NR_PROTOCOLO_REGISTRO']),
    instituto: valueOf(row, ['NM_EMPRESA']),
    contratante: undefined,
    pagante: valueOf(row, ['NM_PAGANTE', 'PAGANTE'], false) || undefined,
    municipio: municipality,
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
      arquivoOrigem: zipPath,
    },
  };
});

const output = TSEPesquisasFileSchema.parse({
  versao: '1.0.0',
  estado: 'synced',
  geradoEm: capture,
  sourceUrl: SOURCE_URL,
  sourceHash: sha256File(zipPath),
  totalPesquisas: pesquisas.length,
  pesquisas,
});

writeJson(outputPath, output);
console.log('pesquisas: ' + output.totalPesquisas + ' registros');
