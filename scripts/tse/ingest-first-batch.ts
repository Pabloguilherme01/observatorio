import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { TSEContasFileSchema, TSEPesquisasFileSchema, TSEProcessualFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import { listFiles, readJson, writeJson } from './common.ts';

type DatasetName = 'contas' | 'pesquisas' | 'processual';

interface SnapshotMeta {
  readonly fonte: DatasetName;
  readonly snapshotId: string;
  readonly sourceUrl: string;
  readonly checksum: string;
  readonly sourceRows: number;
  readonly validatedRows: number;
  readonly matchedRows: number;
  readonly rejectedRows: number;
  readonly captureTime: string;
  readonly retrievalMethod: string;
  readonly state: 'first_capture' | 'synced';
  readonly baseline: boolean;
}

interface DatasetSnapshot<T> {
  readonly meta: SnapshotMeta;
  readonly data: T;
}

interface DiffRecord {
  readonly key: string;
  readonly type: 'added' | 'removed' | 'changed';
  readonly before?: unknown;
  readonly after?: unknown;
}

interface DatasetDiff {
  readonly fonte: DatasetName;
  readonly state: 'first_capture' | 'synced' | 'unchanged' | 'changed';
  readonly firstCapture: boolean;
  readonly added: number;
  readonly removed: number;
  readonly changed: number;
  readonly baselineRecords?: number;
  readonly records: readonly DiffRecord[];
  readonly captureTime: string;
}

interface CandidatePayload {
  readonly estado: 'not_ingested' | 'first_capture' | 'synced' | 'stale' | 'failed';
  readonly sourceUrl: string;
  readonly sourceHash: string;
  readonly totalCandidatosComContas?: number;
  readonly totalPesquisas?: number;
  readonly totalProcessos?: number;
  readonly contas?: readonly { readonly candidatoId: string }[];
  readonly pesquisas?: readonly { readonly idPesquisa: string }[];
  readonly processos?: readonly { readonly numeroProcesso: string }[];
  readonly [key: string]: unknown;
}

const ROOT = process.cwd();
const GENERATED = join(ROOT, 'generated');
const PUBLIC_API = join(ROOT, 'public', 'api', 'v1');
const SNAPSHOT_DIR = join(ROOT, 'src', 'data', 'generated');
const BACKUP_DIR = join(ROOT, '.tmp', 'tse-first-batch', 'backup');

mkdirSync(BACKUP_DIR, { recursive: true });
mkdirSync(PUBLIC_API, { recursive: true });
mkdirSync(SNAPSHOT_DIR, { recursive: true });

const files = {
  contas: join(GENERATED, 'tse2026-contas.json'),
  pesquisas: join(GENERATED, 'tse2026-pesquisas.json'),
  processual: join(GENERATED, 'tse2026-processual.json'),
} as const;

for (const path of Object.values(files)) {
  if (existsSync(path)) copyFileSync(path, join(BACKUP_DIR, basename(path) || 'backup.json'));
}

function runIngest(scriptPath: string): void {
  console.log('[TSE] executando ' + scriptPath);
  execFileSync(process.execPath, ['--experimental-strip-types', scriptPath], {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

function countCsvRows(root: string): number {
  if (!existsSync(root)) return 0;
  return listFiles(root)
    .filter(file => file.toLowerCase().endsWith('.csv'))
    .reduce((total, file) => {
      const absolute = join(root, file);
      const lines = Number(execFileSync('wc', ['-l', absolute], { encoding: 'utf8' }).trim().split(/\s+/)[0] ?? 0);
      return total + Math.max(0, lines - 1);
    }, 0);
}

function normalizeJson(value: unknown): string {
  return JSON.stringify(value);
}

function firstCaptureDiff<T extends Record<string, unknown>>(records: readonly T[], keyOf: (record: T) => string, now: string): DatasetDiff {
  return {
    fonte: 'contas',
    state: 'first_capture',
    firstCapture: true,
    added: 0,
    removed: 0,
    changed: 0,
    baselineRecords: records.length,
    records: [],
    captureTime: now,
  };
}

function computeDiff<T extends Record<string, unknown>>(fonte: DatasetName, current: readonly T[], previous: readonly T[] | undefined, keyOf: (record: T) => string, now: string): DatasetDiff {
  if (!previous) {
    return {
      fonte,
      state: 'first_capture',
      firstCapture: true,
      added: 0,
      removed: 0,
      changed: 0,
      baselineRecords: current.length,
      records: [],
      captureTime: now,
    };
  }

  const before = new Map(previous.map(record => [keyOf(record), record]));
  const after = new Map(current.map(record => [keyOf(record), record]));
  const records: DiffRecord[] = [];

  for (const [key, value] of after) {
    const prior = before.get(key);
    if (!prior) {
      records.push({ key, type: 'added', after: value });
    } else if (normalizeJson(prior) !== normalizeJson(value)) {
      records.push({ key, type: 'changed', before: prior, after: value });
    }
  }

  for (const [key, value] of before) {
    if (!after.has(key)) records.push({ key, type: 'removed', before: value });
  }

  const added = records.filter(record => record.type === 'added').length;
  const removed = records.filter(record => record.type === 'removed').length;
  const changed = records.filter(record => record.type === 'changed').length;
  return {
    fonte,
    state: added || removed || changed ? 'changed' : 'unchanged',
    firstCapture: false,
    added,
    removed,
    changed,
    records,
    captureTime: now,
  };
}

function asPrevious<T>(path: string, field: keyof CandidatePayload): readonly T[] | undefined {
  if (!existsSync(path)) return undefined;
  const previous = readJson<{ readonly data?: CandidatePayload }>(path);
  const value = previous.data?.[field];
  return Array.isArray(value) ? value as unknown as readonly T[] : undefined;
}

function promote<T extends CandidatePayload>(
  fonte: DatasetName,
  inputPath: string,
  publicName: string,
  snapshotPath: string,
  rawRoot: string,
  now: string,
): DatasetDiff {
  const raw = readJson<T>(inputPath);
  const previousPath = snapshotPath;
  const previousExists = existsSync(previousPath);

  let validated: T;
  if (fonte === 'contas') validated = TSEContasFileSchema.parse(raw) as T;
  else if (fonte === 'pesquisas') validated = TSEPesquisasFileSchema.parse(raw) as T;
  else validated = TSEProcessualFileSchema.parse(raw) as T;

  const records =
    fonte === 'contas' ? validated.contas ?? [] :
    fonte === 'pesquisas' ? validated.pesquisas ?? [] :
    validated.processos ?? [];

  const keyOf = fonte === 'contas'
    ? (record: { readonly candidatoId: string }) => record.candidatoId
    : fonte === 'pesquisas'
      ? (record: { readonly idPesquisa: string }) => record.idPesquisa
      : (record: { readonly numeroProcesso: string }) => record.numeroProcesso;

  let previousRecords: readonly Record<string, unknown>[] | undefined;
  let canDiff = false;

  if (previousExists) {
    const previous = readJson<DatasetSnapshot<T>>(previousPath);
    // Só snapshots produzidos pelo pipeline oficial podem ser base de diff.
    // Assim, a primeira captura oficial não publica "remoções" de um recorte editorial anterior.
    canDiff = previous.meta?.retrievalMethod === 'official_tse_zip_csv';
    if (canDiff) {
      const priorData = previous.data;
      previousRecords =
        fonte === 'contas' ? (priorData.contas ?? []) as readonly Record<string, unknown>[] :
        fonte === 'pesquisas' ? (priorData.pesquisas ?? []) as readonly Record<string, unknown>[] :
        (priorData.processos ?? []) as readonly Record<string, unknown>[];
    }
  }

  const diff = canDiff
    ? computeDiff(fonte, records as readonly Record<string, unknown>[], previousRecords, keyOf as (record: Record<string, unknown>) => string, now)
    : {
        fonte,
        state: 'first_capture' as const,
        firstCapture: true,
        added: 0,
        removed: 0,
        changed: 0,
        baselineRecords: records.length,
        records: [],
        captureTime: now,
      };
  const state = diff.firstCapture ? 'first_capture' : 'synced';

  const promoted = { ...validated, estado: state, geradoEm: now } as T;
  if (fonte === 'contas') TSEContasFileSchema.parse(promoted);
  else if (fonte === 'pesquisas') TSEPesquisasFileSchema.parse(promoted);
  else TSEProcessualFileSchema.parse(promoted);

  writeJson(inputPath, promoted);
  writeJson(join(PUBLIC_API, publicName), promoted);

  const sourceRows = countCsvRows(rawRoot);
  const validatedRows = records.length;
  const snapshotId = fonte + '-' + now.replace(/[^0-9]/g, '') + '-' + validated.sourceHash.slice(0, 12);
  const meta: SnapshotMeta = {
    fonte,
    snapshotId,
    sourceUrl: validated.sourceUrl,
    checksum: validated.sourceHash,
    sourceRows,
    validatedRows,
    matchedRows: validatedRows,
    rejectedRows: 0,
    captureTime: now,
    retrievalMethod: 'official_tse_zip_csv',
    state,
    baseline: diff.firstCapture,
  };

  writeJson(snapshotPath, { meta, data: promoted } satisfies DatasetSnapshot<T>);
  console.log('[TSE] ' + fonte + ': sourceRows=' + sourceRows + ' validatedRows=' + validatedRows + ' rejectedRows=0 checksum=' + validated.sourceHash);
  return diff;
}

try {
  runIngest('scripts/tse/ingest-contas.ts');
  runIngest('scripts/tse/ingest-pesquisas.ts');
  runIngest('scripts/tse/ingest-processual.ts');

  const now = new Date().toISOString();
  const diffs = [
    promote('contas', files.contas, 'contas.json', join(SNAPSHOT_DIR, 'contas-snapshot.json'), join(ROOT, '.tmp', 'tse-contas', 'unzipped'), now),
    promote('pesquisas', files.pesquisas, 'pesquisas.json', join(SNAPSHOT_DIR, 'pesquisas-snapshot.json'), join(ROOT, '.tmp', 'tse-pesquisas', 'unzipped'), now),
    promote('processual', files.processual, 'processual.json', join(SNAPSHOT_DIR, 'processual-snapshot.json'), join(ROOT, '.tmp', 'tse-processual', 'unzipped'), now),
  ];

  writeJson(join(SNAPSHOT_DIR, 'snapshot-diff.json'), {
    version: 1,
    generatedAt: now,
    firstCapture: diffs.some(diff => diff.firstCapture),
    datasets: diffs,
  });

  writeJson(join(PUBLIC_API, 'snapshot-diff.json'), {
    version: 1,
    generatedAt: now,
    firstCapture: diffs.some(diff => diff.firstCapture),
    datasets: diffs,
  });

  console.log('[TSE] primeiro batch concluído com schemas Zod e snapshots verificáveis.');
} catch (error) {
  for (const [key, path] of Object.entries(files)) {
    const backup = join(BACKUP_DIR, basename(path) || 'backup.json');
    if (existsSync(backup)) copyFileSync(backup, path);
    console.error('[TSE] falha no batch ' + key + ':', error);
  }
  process.exitCode = 1;
}
