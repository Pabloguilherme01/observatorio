import { join } from 'node:path';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { TSEPesquisasFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import { extractZip, findFile, downloadFile, parseDate, readCsv, sha256File, valueOf, writeJson } from './common.ts';

const SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_eleitoral_2026.zip';
const tmpRoot = join(process.cwd(), '.tmp', 'tse-pesquisas');
const zipPath = join(tmpRoot, 'pesquisas-2026.zip');
const extractDir = join(tmpRoot, 'unzipped');
const outputPath = join(process.cwd(), 'generated', 'tse2026-pesquisas.json');
const municipios = new Set(['Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Santo Antônio do Descoberto', 'Novo Gama', 'Planaltina']);

mkdirSync(tmpRoot, { recursive: true });
if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });

await downloadFile(SOURCE_URL, zipPath);
extractZip(zipPath, extractDir);

const pesquisaPath = findFile(extractDir, /pesquisa.*\.csv$/i);
const rows = readCsv(pesquisaPath);
const capture = new Date().toISOString();

const targetRows = rows.filter(row => municipios.has(valueOf(row, ['NM_UE'], false)));
const pesquisas = targetRows.map(row => {
  const municipality = valueOf(row, ['NM_UE']);
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
}).filter(pesquisa => municipios.has(pesquisa.municipio));

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
