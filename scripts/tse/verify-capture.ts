import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TSEContasFileSchema, TSEPesquisasFileSchema, TSEProcessualFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import { readJson } from './common.ts';

const root = process.cwd();
const datasets = [
  {
    name: 'contas',
    path: join(root, 'generated', 'tse2026-contas.json'),
    snapshot: join(root, 'src', 'data', 'generated', 'contas-snapshot.json'),
    api: join(root, 'public', 'api', 'v1', 'contas.json'),
    schema: TSEContasFileSchema,
    records: 'contas',
  },
  {
    name: 'pesquisas',
    path: join(root, 'generated', 'tse2026-pesquisas.json'),
    snapshot: join(root, 'src', 'data', 'generated', 'pesquisas-snapshot.json'),
    api: join(root, 'public', 'api', 'v1', 'pesquisas.json'),
    schema: TSEPesquisasFileSchema,
    records: 'pesquisas',
  },
  {
    name: 'processual',
    path: join(root, 'generated', 'tse2026-processual.json'),
    snapshot: join(root, 'src', 'data', 'generated', 'processual-snapshot.json'),
    api: join(root, 'public', 'api', 'v1', 'processual.json'),
    schema: TSEProcessualFileSchema,
    records: 'processos',
  },
] as const;

for (const dataset of datasets) {
  if (!existsSync(dataset.path)) throw new Error(dataset.name + ': snapshot gerado ausente');
  if (!existsSync(dataset.snapshot)) throw new Error(dataset.name + ': metadata snapshot ausente');
  if (!existsSync(dataset.api)) throw new Error(dataset.name + ': API pública ausente');

  const raw = readJson<Record<string, unknown>>(dataset.path);
  const parsed = dataset.schema.parse(raw);
  if (parsed.estado === 'not_ingested') throw new Error(dataset.name + ': estado permanece not_ingested');
  if (!/^[0-9a-f]{64}$/i.test(parsed.sourceHash)) throw new Error(dataset.name + ': sourceHash não é SHA-256');
  if (!/^https?:\/\//.test(parsed.sourceUrl)) throw new Error(dataset.name + ': sourceUrl inválida');
  if (!Number.isInteger(parsed[dataset.records].length)) throw new Error(dataset.name + ': contagem de registros inválida');


  const meta = readJson<{ readonly meta: { readonly snapshotId: string; readonly checksum: string; readonly sourceRows: number; readonly validatedRows: number; readonly matchedRows: number; readonly rejectedRows: number; readonly captureTime: string; readonly retrievalMethod: string; readonly state: string; readonly baseline: boolean } }>(dataset.snapshot);
  if (meta.meta.snapshotId.length < 8) throw new Error(dataset.name + ': snapshotId ausente');
  if (meta.meta.checksum !== parsed.sourceHash) throw new Error(dataset.name + ': checksum diverge do snapshot principal');
  if (!/^[0-9a-f]{64}$/i.test(meta.meta.checksum)) throw new Error(dataset.name + ': checksum metadata inválido');
  if (meta.meta.sourceRows < meta.meta.validatedRows) throw new Error(dataset.name + ': sourceRows menor que validatedRows');
  if (meta.meta.matchedRows !== meta.meta.validatedRows) throw new Error(dataset.name + ': matchedRows divergente');
  if (meta.meta.rejectedRows < 0) throw new Error(dataset.name + ': rejectedRows inválido');
  if (Number.isNaN(Date.parse(meta.meta.captureTime))) throw new Error(dataset.name + ': captureTime inválido');
  if (!meta.meta.retrievalMethod) throw new Error(dataset.name + ': retrievalMethod ausente');
  if (meta.meta.state === 'first_capture' && !meta.meta.baseline) throw new Error(dataset.name + ': first_capture precisa estar marcado como baseline');
  if (parsed.estado === 'first_capture' && meta.meta.baseline !== true) throw new Error(dataset.name + ': captura inicial sem baseline explícito');

  const publicPayload = JSON.parse(readFileSync(dataset.api, 'utf8')) as Record<string, unknown>;
  if (publicPayload.estado !== parsed.estado) throw new Error(dataset.name + ': API pública diverge do snapshot');
  if (publicPayload.sourceHash !== parsed.sourceHash) throw new Error(dataset.name + ': API pública diverge no checksum');

  console.log('PASS', dataset.name, 'estado=' + parsed.estado, 'records=' + parsed[dataset.records].length, 'checksum=' + parsed.sourceHash);
}

const diffPath = join(root, 'src', 'data', 'generated', 'snapshot-diff.json');
if (!existsSync(diffPath)) throw new Error('snapshot-diff.json ausente');
const diff = readJson<{ readonly datasets?: readonly { readonly fonte: string; readonly firstCapture: boolean; readonly added: number; readonly removed: number; readonly changed: number }[] }>(diffPath);
for (const dataset of diff.datasets ?? []) {
  if (dataset.firstCapture && (dataset.added !== 0 || dataset.removed !== 0 || dataset.changed !== 0)) {
    throw new Error(dataset.fonte + ': first_capture não pode publicar diff de baseline');
  }
}
console.log('PASS snapshot-diff.json baseline/diff semantics');
