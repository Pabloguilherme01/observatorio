import { Copy, Download, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { observatorioData as d } from '../../data/observatorioData';
import { downloadBlob, toCsv, type ExportCell } from '../../lib/export';
import { Card } from '../ui/Card';

const rows: readonly (readonly ExportCell[])[] = [
  ['indicador', 'valor', 'unidade', 'status', 'fonte'],
  ...d.indicators.map(item => [item.label, item.value, item.unit, item.status, item.sourceId]),
];

export function DataExportActions() {
  const [status, setStatus] = useState('');
  const flash = (message: string) => { setStatus(message); window.setTimeout(() => setStatus(''), 1800); };

  const exportCsv = () => { downloadBlob('observatorio-aguas-lindas-v22.csv', toCsv(rows), 'text/csv;charset=utf-8'); flash('CSV exportado'); };

  const copyMetadata = async () => {
    const metadata = JSON.stringify({ edition: d.meta.edition, updatedAt: d.meta.updatedAt, sources: d.sources.map(s => ({ id: s.id, label: s.label, url: s.url })) }, null, 2);
    await navigator.clipboard.writeText(metadata);
    flash('Metadados copiados');
  };

  const exportStory = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0b1117'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#e6edf3'; ctx.font = '700 54px Inter, sans-serif'; ctx.fillText('Observatório Eleitoral', 70, 120);
    ctx.font = '900 80px Inter, sans-serif'; ctx.fillText('Águas Lindas 2026', 70, 220);
    ctx.font = '700 42px Inter, sans-serif'; ctx.fillStyle = '#8cc8f2'; ctx.fillText('125.062 eleitores', 70, 360);
    ctx.fillText('249.978 habitantes', 70, 440);
    ctx.fillText('R$ 11,45 Brasília', 70, 520);
    ctx.fillStyle = '#94a3b8'; ctx.font = '28px Inter, sans-serif'; ctx.fillText('Dados públicos • fontes identificadas', 70, 1750);
    ctx.fillText('V22 · 22/09/2026', 70, 1800);
    canvas.toBlob(blob => { if (blob) { downloadBlob('observatorio-aguas-lindas-v22-story.png', blob, 'image/png'); flash('Story PNG gerado'); } });
  };

  return <Card id="fontes"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Dados e exportação</div><h3 className="mt-2 text-xl font-black text-white">Leve os dados para fora da aplicação</h3><p className="mt-1 text-sm text-slate-400">CSV com BOM UTF-8, metadata JSON copiada e card 1080×1920 para Stories.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5"><Download className="h-4 w-4" />CSV</button><button type="button" onClick={exportStory} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5"><ImageIcon className="h-4 w-4" />Story</button><button type="button" onClick={copyMetadata} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5"><Copy className="h-4 w-4" />Metadados</button></div></div>{status && <div className="mt-4 text-xs font-semibold text-emerald-300" role="status" aria-live="polite">{status}</div>}</Card>;
}