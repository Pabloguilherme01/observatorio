export type ExportCell = string | number | boolean | null | undefined;

export function csvCell(value: ExportCell): string {
  const text = value == null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(rows: readonly (readonly ExportCell[])[]): string {
  return `\uFEFF${rows.map(row => row.map(csvCell).join(';')).join('\r\n')}`;
}

export function downloadBlob(filename: string, content: BlobPart, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}