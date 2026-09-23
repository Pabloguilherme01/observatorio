import { join } from 'node:path';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { extractZip, findFile, downloadFile, normalizeLabel, readCsv, valueOf, readJson } from './common.ts';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'reports');
const TMP = join(ROOT, '.tmp', 'tse-diagnose-matching');
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(TMP, { recursive: true });

const CANDIDATE_SOURCE = 'src/data/generated/tse2026-candidates.json';
const SOURCE = {
  contas: 'https://cdn.tse.jus.br/estatistica/sead/odsele/prestacao_contas/prestacao_de_contas_eleitorais_candidatos_2026.zip',
  pesquisas: 'https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_eleitoral_2026.zip',
} as const;

const targetNames = new Set([
  'AGUAS LINDAS DE GOIAS',
  'ÁGUAS LINDAS DE GOIÁS',
].map(normalizeLabel));
const targetIbge = '5200258';

interface DiagnosticReport {
  readonly fonte: string;
  readonly zipPath: string;
  readonly arquivoCsv: string;
  readonly linhas: number;
  readonly headers: string[];
  readonly camposCandidatos: string[];
  readonly valoresAlvo: Record<string, string[]>;
  readonly matchIds: number;
  readonly matchMunicipios: number;
  readonly sampleMunicipios: string[];
  readonly candidatosEncontrados: Record<string, number>;
  readonly observacoes: string[];
}

function distinct(values: readonly string[]) {
  return [...new Set(values.filter(Boolean))].slice(0, 50);
}

async function diagnoseContas(): Promise<DiagnosticReport> {
  const work = join(TMP, 'contas');
  const zip = join(work, 'contas.zip');
  const extract = join(work, 'extract');
  if (existsSync(extract)) rmSync(extract, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });
  await downloadFile(SOURCE.contas, zip);
  extractZip(zip, extract);
  const receitasPath = findFile(extract, /receitas.*candidato.*_GO\.csv$/i);
  const rows = readCsv(receitasPath);
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const candidateSnapshot = readJson<{ readonly matched: readonly { readonly sqCandidate: string; readonly name: string }[] }>(CANDIDATE_SOURCE);
  const watchIds = new Map(candidateSnapshot.matched.map(candidate => [candidate.sqCandidate, candidate.name]));
  const idKey = headers.find(header => header === 'SQ_CANDIDATO' || header === 'SQ_CANDIDATO_') ?? '';
  const municipalityKeys = headers.filter(header => /MUNICIPIO|MUNIC|CD_MUN|NR_MUN/i.test(header));
  const matched = rows.filter(row => idKey && watchIds.has(row[idKey] ?? ''));

  const valoresAlvo: Record<string, string[]> = {};
  for (const key of municipalityKeys) valoresAlvo[key] = distinct(rows.map(row => row[key] ?? '').filter(v => normalizeLabel(v).includes('AGUAS LINDAS') || v === targetIbge));

  const candidatosEncontrados: Record<string, number> = {};
  for (const row of matched) {
    const id = row[idKey] ?? '';
    const name = watchIds.get(id) ?? id;
    candidatosEncontrados[name] = (candidatosEncontrados[name] ?? 0) + 1;
  }

  return {
    fonte: 'Prestação de Contas 2026',
    zipPath: zip,
    arquivoCsv: receitasPath,
    linhas: rows.length,
    headers,
    camposCandidatos: headers.filter(header => /CANDIDATO|SQ_/i.test(header)),
    valoresAlvo,
    matchIds: matched.length,
    matchMunicipios: municipalityKeys.reduce((count, key) => count + rows.filter(row => normalizeLabel(row[key] ?? '').includes('AGUAS LINDAS') || row[key] === targetIbge).length, 0),
    sampleMunicipios: distinct(municipalityKeys.flatMap(key => rows.slice(0, 1000).map(row => row[key] ?? ''))),
    candidatosEncontrados,
    observacoes: [
      idKey ? 'SQ_CANDIDATO detectado: ' + idKey : 'SQ_CANDIDATO não encontrado no header do CSV.',
      'IDs monitorados: ' + watchIds.size,
      'Município alvo IBGE: ' + targetIbge,
    ],
  };
}

async function diagnosePesquisas(): Promise<DiagnosticReport> {
  const work = join(TMP, 'pesquisas');
  const zip = join(work, 'pesquisas.zip');
  const extract = join(work, 'extract');
  if (existsSync(extract)) rmSync(extract, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });
  await downloadFile(SOURCE.pesquisas, zip);
  extractZip(zip, extract);
  const pesquisaPath = findFile(extract, /pesquisa.*_GO\.csv$/i);
  const rows = readCsv(pesquisaPath);
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const municipalityKeys = headers.filter(header => /MUNICIPIO|MUNIC|CD_MUN|DADO_MUNIC/i.test(header));
  const values = municipalityKeys.flatMap(key => rows.map(row => row[key] ?? ''));
  const named = values.filter(value => targetNames.has(normalizeLabel(value)) || normalizeLabel(value).includes('AGUAS LINDAS'));
  const coded = values.filter(value => value === targetIbge);
  const resolved = rows.filter(row => municipalityKeys.some(key => targetNames.has(normalizeLabel(row[key] ?? '')) || normalizeLabel(row[key] ?? '').includes('AGUAS LINDAS') || row[key] === targetIbge));

  return {
    fonte: 'Pesquisas Eleitorais 2026',
    zipPath: zip,
    arquivoCsv: pesquisaPath,
    linhas: rows.length,
    headers,
    camposCandidatos: [],
    valoresAlvo: Object.fromEntries(municipalityKeys.map(key => [key, distinct(rows.map(row => row[key] ?? '').filter(v => normalizeLabel(v).includes('AGUAS LINDAS') || v === targetIbge))])),
    matchIds: 0,
    matchMunicipios: resolved.length,
    sampleMunicipios: distinct(values.slice(0, 1500)),
    candidatosEncontrados: {},
    observacoes: [
      'Campos municipais detectados: ' + (municipalityKeys.join(', ') || 'nenhum'),
      'Ocorrências textuais para Águas Lindas: ' + named.length,
      'Ocorrências pelo código IBGE ' + targetIbge + ': ' + coded.length,
      'Linhas resolvidas: ' + resolved.length,
    ],
  };
}

const report = {
  generatedAt: new Date().toISOString(),
  targetMunicipality: {
    nome: 'Águas Lindas de Goiás',
    codigoIbge: targetIbge,
  },
  contas: await diagnoseContas(),
  pesquisas: await diagnosePesquisas(),
};

const output = join(OUT_DIR, 'diagnostico-tse-matching.json');
const { writeFileSync } = await import('node:fs');
writeFileSync(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
console.log('Relatório salvo em ' + output);
