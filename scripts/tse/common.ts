import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export const MUNICIPIO_IBGE = '5200258';
export const MUNICIPIO_NOME = 'Águas Lindas de Goiás';

export function sha256File(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

export async function downloadFile(url: string, destination: string): Promise<string> {
  mkdirSync(join(destination, '..'), { recursive: true });
  const response = await fetch(url, { headers: { 'user-agent': 'observatorio-aguas-lindas-tse-ingest/1.0' } });
  if (!response.ok) throw new Error('Falha ao baixar ' + url + ' (' + response.status + ')');
  const body = Buffer.from(await response.arrayBuffer());
  writeFileSync(destination, body);
  return createHash('sha256').update(body).digest('hex');
}

export function extractZip(zipPath: string, outputDir: string): void {
  mkdirSync(outputDir, { recursive: true });
  execFileSync('unzip', ['-oq', zipPath, '-d', outputDir], { stdio: 'pipe' });
}

export function findFile(root: string, pattern: RegExp): string {
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (pattern.test(entry.name)) return fullPath;
    }
  }
  throw new Error('Arquivo correspondente não encontrado: ' + pattern);
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const output: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      output.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  output.push(current);
  return output;
}

export function parseCsv(content: string): ReadonlyArray<Record<string, string>> {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim().length > 0);
  if (!lines.length) return [];
  const delimiter = (lines[0].match(/;/g) ?? []).length > (lines[0].match(/,/g) ?? []).length ? ';' : ',';
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => { row[header] = (cells[index] ?? '').trim(); });
    return row;
  });
}

export function readCsv(filePath: string): ReadonlyArray<Record<string, string>> {
  return parseCsv(readFileSync(filePath, 'utf8'));
}

export function normalizeHeader(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase();
}

export function valueOf(row: Record<string, string>, aliases: readonly string[], required = true): string {
  for (const alias of aliases.map(normalizeHeader)) {
    const value = row[alias];
    if (value != null && value !== '') return value;
  }
  if (required) throw new Error('Coluna obrigatória ausente. Esperado um dos aliases: ' + aliases.join(', ') + '. Headers disponíveis: ' + Object.keys(row).sort().join(', '));
  return '';
}

export function parseMoney(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const numberValue = Number(normalized);
  if (!Number.isFinite(numberValue)) throw new Error('Valor monetário inválido: ' + value);
  return numberValue;
}

export function parseDate(value: string): string {
  const clean = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const parts = clean.split(/[\/.-]/);
  if (parts.length === 3 && parts[0].length <= 2) {
    const [day, month, year] = parts;
    return year.length === 4
      ? year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0')
      : '20' + year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
  }
  const date = new Date(clean);
  if (Number.isNaN(date.getTime())) throw new Error('Data inválida: ' + value);
  return date.toISOString().slice(0, 10);
}

export function partialDocument(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 8) return value;
  return '***' + digits.slice(-6) + '**';
}

export function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

export function writeJson(filePath: string, value: unknown): void {
  mkdirSync(join(filePath, '..'), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

export function listFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const output: string[] = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else output.push(relative(root, full));
    }
  }
  return output.sort();
}
