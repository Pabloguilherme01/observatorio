import { Braces, Copy, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { observatorioData as d } from '../data/observatorioData';
import { downloadBlob, toCsv, type ExportCell } from '../lib/export';
import { Card } from './ui/Card';
import { EDITION } from '../config/version';
import { useLanguageMode } from '../context/LanguageModeContext';

const categoryFor = (id: string) => {
  if (id.includes('population') || id.includes('density') || id.includes('electorate')) return 'Demografia';
  if (id.includes('fare') || id.includes('transport')) return 'Mobilidade';
  if (id.includes('homicide') || id.includes('infant') || id.includes('health')) return 'Saude';
  if (id.includes('sewer') || id.includes('water') || id.includes('sanitation') || id.includes('waste')) return 'Saneamento';
  if (id.includes('budget') || id.includes('revenue') || id.includes('expense') || id.includes('gdp') || id.includes('companies') || id.includes('caged')) return 'Economia';
  if (id.includes('ideb') || id.includes('education') || id.includes('enroll')) return 'Educacao';
  return 'Geral';
};

const rows: readonly (readonly ExportCell[])[] = [
  ['categoria', 'indicador', 'valor', 'unidade', 'status', 'fonte', 'data_referencia'],
  ...d.indicators.map(item => {
    const source = d.sources.find(source => source.id === item.sourceId);
    return [categoryFor(item.id), item.label, item.value, item.unit, item.status, item.sourceId, source?.referenceDate ?? ''];
  }),
];

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  return copied;
}

export function DataExportActions() {
  const { mode } = useLanguageMode();
  const [status, setStatus] = useState('');
  const statusTimerRef = useRef<number | null>(null);
  useEffect(() => () => {
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
  }, []);
  const flash = (message: string) => {
    setStatus(message);
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => {
      statusTimerRef.current = null;
      setStatus('');
    }, 1800);
  };

  const exportJson = () => {
    const payload = { edition: d.meta.edition, datasetVersion: EDITION, generatedAt: new Date().toISOString(), data: d };
    downloadBlob(`observatorio-aguas-lindas-${EDITION.toLowerCase()}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    flash(`JSON ${EDITION} exportado`);
  };

  const exportCsv = () => {
    downloadBlob(`observatorio-aguas-lindas-${EDITION.toLowerCase()}.csv`, toCsv(rows), 'text/csv;charset=utf-8');
    flash(`CSV ${EDITION} exportado`);
  };

  const copyMetadata = async () => {
    const metadata = JSON.stringify({
      edition: d.meta.edition,
      datasetVersion: EDITION,
      municipality: d.meta.municipality,
      updatedAt: d.meta.updatedAt,
      sources: d.sources.map(source => ({
        id: source.id, label: source.label, institution: source.institution, nature: source.nature,
        referenceDate: source.referenceDate, publishedAt: source.publishedAt, url: source.url,
      })),
    }, null, 2);
    flash(await copyText(metadata) ? 'Metadados copiados' : 'Não foi possível copiar automaticamente');
  };

  const exportStory = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) { flash('Canvas indisponível neste navegador'); return; }
    ctx.fillStyle = '#0b1117'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e6edf3'; ctx.font = '700 54px Inter, sans-serif';
    ctx.fillText('Observatório Eleitoral', 70, 120);
    ctx.font = '900 80px Inter, sans-serif'; ctx.fillText('Águas Lindas 2026', 70, 220);
    ctx.font = '700 42px Inter, sans-serif'; ctx.fillStyle = '#8cc8f2';
    ctx.fillText(d.electoral.electorate.toLocaleString('pt-BR') + ' eleitores', 70, 360);
    const population = d.indicators.find(item => item.id === 'population-2026')?.value ?? d.populationSeries.at(-1)?.value ?? 0;
    ctx.fillText(population.toLocaleString('pt-BR') + ' habitantes', 70, 440);
    ctx.fillText('R$ ' + d.transport.routes[0].fareBrl.toFixed(2).replace('.', ','), 70, 520);
    ctx.fillStyle = '#94a3b8'; ctx.font = '28px Inter, sans-serif';
    ctx.fillText('Dados públicos • fontes identificadas', 70, 1750);
    ctx.fillText(EDITION, 70, 1800);
    canvas.toBlob(blob => {
      if (blob) { downloadBlob(`observatorio-aguas-lindas-${EDITION.toLowerCase()}-story.png`, blob, 'image/png'); flash(`Story ${EDITION} gerado`); }
      else flash('Não foi possível gerar o Story');
    });
  };

  return (
    <Card id="exportacao" className={mode === 'summary' ? 'summary-export-card' : undefined}>
      <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${mode === 'summary' ? 'summary-export-head' : ''}`}>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Dados e exportação</div>
          <h3 className={`mt-2 font-black text-white ${mode === 'summary' ? 'text-base' : 'text-xl'}`}>{mode === 'summary' ? 'Levar dados' : 'Leve os dados para fora da aplicação'}</h3>
          {mode !== 'summary' && <p className="mt-1 text-sm text-slate-400">CSV com categoria, unidade, status, fonte e data de referência; JSON do dataset normalizado; metadados, API pública e card 1080×1920.</p>}
        </div>
        <div className={`flex flex-wrap gap-2 ${mode === 'summary' ? 'summary-export-actions' : ''}`}>
          <button type="button" onClick={exportJson} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5"><Braces className="h-4 w-4" aria-hidden="true" />JSON</button>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5"><Download className="h-4 w-4" aria-hidden="true" />CSV</button>
          <button type="button" onClick={exportStory} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5"><ImageIcon className="h-4 w-4" aria-hidden="true" />Story</button>
          <button type="button" onClick={copyMetadata} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5"><Copy className="h-4 w-4" aria-hidden="true" />Metadados</button>
          <a href="/api/v1/observatorio.json" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2 text-xs font-bold text-sky-200 hover:bg-sky-300/10"><ExternalLink className="h-4 w-4" aria-hidden="true" />API pública</a>
        </div>
      </div>
      {status && <div className="mt-4 text-xs font-semibold text-emerald-300" role="status" aria-live="polite">{status}</div>}
    </Card>
  );
}
