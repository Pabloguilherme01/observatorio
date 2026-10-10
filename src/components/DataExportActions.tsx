import { Braces, Copy, Download, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { observatorioData as d } from '../data/observatorioData';
import { contextualMetrics, contextualMunicipalities } from '../data/contextualComparison';
import { downloadBlob, toCsv, type ExportCell } from '../lib/export';
import { Card } from './ui/Card';
import { EDITION } from '../config/version';
import { useLanguageMode } from '../context/LanguageModeContext';
import { copyText } from '../lib/clipboard';
import { formatIndicatorStatus } from '../utils/dataLabels';
import { indicatorReference } from '../lib/indicatorReference';

const categoryFor = (id: string) => {
  if (id === 'budget' || id.startsWith('budget-') || id.includes('revenue') || id.includes('expense')) return 'Orcamento';
  if (id.includes('population') || id.includes('density')) return 'Demografia';
  if (id.includes('fare') || id.includes('transport')) return 'Mobilidade';
  if (id.startsWith('heal-') || id.includes('homicide') || id.includes('infant') || id.includes('health')) return 'Saude';
  if (id.includes('sewer') || id.includes('water') || id.includes('sanitation') || id.includes('waste') || id.includes('hydrometer')) return 'Saneamento';
  if (id.includes('gdp') || id.includes('companies') || id.includes('caged') || id.includes('formal')) return 'Economia';
  if (id.includes('ideb') || id.includes('education') || id.includes('enroll') || id.includes('schooling') || id.startsWith('ept-')) return 'Educacao';
  return 'Geral';
};

const rows: readonly (readonly ExportCell[])[] = [
  ['categoria', 'indicador', 'valor', 'unidade', 'status', 'fonte_id', 'fonte_instituicao', 'data_referencia', 'observacao', 'indicador_id', 'fonte_natureza', 'status_rotulo', 'periodo_referencia', 'precisao_referencia'],
  ...d.indicators.map(item => {
    const source = d.sources.find(source => source.id === item.sourceId);
    const reference = indicatorReference(item, source);
    return [categoryFor(item.id), item.label, item.value, item.unit, item.status, item.sourceId, source?.institution ?? '', item.referenceDate ?? source?.referenceDate ?? '', item.note ?? '', item.id, source?.nature ?? '', formatIndicatorStatus(item.status, item.status) ?? item.status, reference.label, reference.precision];
  }),
];

const contextComparisonRows: readonly (readonly ExportCell[])[] = [
  ['municipio', 'codigo_ibge', 'referencia_local', 'indicador_id', 'indicador', 'valor', 'unidade', 'ano_base', 'natureza', 'fonte', 'url_ibge'],
  ...contextualMunicipalities.flatMap(place =>
    contextualMetrics.map(metric => [
      place.name,
      place.ibgeCode,
      place.name === 'Águas Lindas de Goiás' ? 'sim' : 'nao',
      metric.id,
      metric.label,
      place.values[metric.id],
      metric.unit,
      metric.year,
      metric.id === 'populationGrowth' || metric.id === 'density' ? 'Derivado' : 'Publicado',
      'IBGE',
      place.url,
    ] as const),
  ),
];

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

  const exportSourcesCsv = () => {
    const sourceRows: readonly (readonly ExportCell[])[] = [
      ['fonte_id', 'nome', 'instituicao', 'natureza', 'data_referencia', 'data_publicacao', 'url', 'frequencia_atualizacao', 'ultima_verificacao', 'licenca'],
      ...d.sources.map(source => [source.id, source.label, source.institution, source.nature, source.referenceDate ?? '', source.publishedAt ?? '', source.url, source.updateFrequency ?? '', source.lastCheckedAt ?? '', source.license ?? '']),
    ];
    downloadBlob(`observatorio-aguas-lindas-fontes-${EDITION.toLowerCase()}.csv`, toCsv(sourceRows), 'text/csv;charset=utf-8');
    flash(`Fontes CSV ${EDITION} exportadas`);
  };

  const exportContextComparisonCsv = () => {
    downloadBlob(
      `observatorio-aguas-lindas-comparativo-municipal-${EDITION.toLowerCase()}.csv`,
      toCsv(contextComparisonRows),
      'text/csv;charset=utf-8',
    );
    flash(`Comparativo municipal CSV ${EDITION} exportado`);
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



  return (
    <Card id="exportacao" className={mode === 'summary' ? 'summary-export-card' : undefined}>
      <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${mode === 'summary' ? 'summary-export-head' : ''}`}>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Dados para download</div>
          <h3 className={`mt-2 font-black text-white light:text-slate-900 ${mode === 'summary' ? 'text-base' : 'text-xl'}`}>{mode === 'summary' ? 'Baixar dados' : 'Baixe dados, fontes e metadados'}</h3>
          {mode !== 'summary' && <p className="mt-1 text-sm text-slate-400 light:text-slate-600">CSV com indicadores e metadados; comparativo municipal descritivo; catálogo de fontes; JSON normalizado; metadados e API pública.</p>}
        </div>
        <div className={`flex flex-wrap gap-2 ${mode === 'summary' ? 'summary-export-actions' : ''}`}>
          <button type="button" onClick={exportJson} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/5 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-100"><Braces className="h-4 w-4" aria-hidden="true" />JSON</button>
          <button type="button" onClick={exportCsv} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/5 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-100"><Download className="h-4 w-4" aria-hidden="true" />CSV</button>
          <button type="button" onClick={exportSourcesCsv} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/5 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-100"><Download className="h-4 w-4" aria-hidden="true" />Fontes CSV</button>
          <button type="button" onClick={exportContextComparisonCsv} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/5 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-100"><Download className="h-4 w-4" aria-hidden="true" />Comparativo CSV</button>
          <button type="button" onClick={copyMetadata} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/5 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-100"><Copy className="h-4 w-4" aria-hidden="true" />Metadados</button>
          <a href={import.meta.env.BASE_URL + "api/v2/observatorio.json"} target="_blank" rel="noopener noreferrer" aria-label="Abrir API pública do Observatório em nova aba" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2 text-xs font-bold text-sky-200 transition hover:bg-sky-300/10 light:border-sky-200 light:bg-sky-50 light:text-sky-800 light:hover:bg-sky-100"><ExternalLink className="h-4 w-4" aria-hidden="true" />API pública</a>
        </div>
      </div>
      {status && <div className="mt-4 text-xs font-semibold text-emerald-300" role="status" aria-live="polite">{status}</div>}
    </Card>
  );
}
