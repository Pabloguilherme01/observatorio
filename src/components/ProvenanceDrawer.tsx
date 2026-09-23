import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clipboard, Download, ExternalLink, X } from 'lucide-react';
import { getProvenance, type ProvenanceData } from '../data/provenanceRegistry';
import { observatorioData } from '../data/observatorioData';

export interface ProvenanceRequest {
  readonly valueId: string;
  readonly fallback?: Partial<ProvenanceData>;
}

declare global {
  interface WindowEventMap {
    'observatorio:provenance': CustomEvent<ProvenanceRequest>;
  }
}

export function dispatchProvenance(request: ProvenanceRequest): void {
  window.dispatchEvent(new CustomEvent('observatorio:provenance', { detail: request }));
}

export function ProvenanceDrawer() {
  const [request, setRequest] = useState<ProvenanceRequest | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onRequest = (event: WindowEventMap['observatorio:provenance']) => {
      openerRef.current = document.activeElement as HTMLElement | null;
      setRequest(event.detail);
    };
    window.addEventListener('observatorio:provenance', onRequest);
    return () => window.removeEventListener('observatorio:provenance', onRequest);
  }, []);

  useEffect(() => {
    if (!request) {
      openerRef.current?.focus?.();
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setRequest(null);
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>('button,a[href]') ?? [],
      ).filter(node => !node.hasAttribute('disabled'));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [request]);

  const provenance: ProvenanceData | undefined = useMemo(() => {
    if (!request) return undefined;
    const registered = getProvenance(request.valueId);
    if (registered) return { ...registered, ...request.fallback };

    const source = observatorioData.sources.find(item => item.id === request.valueId);
    const fallback = request.fallback;
    if (!source && !fallback?.fonte) return undefined;

    return {
      valueId: request.valueId,
      fonte: fallback?.fonte ?? source?.label ?? 'Fonte não registrada',
      fonteUrl: fallback?.fonteUrl ?? source?.url ?? 'https://dadosabertos.tse.jus.br/',
      referencia: fallback?.referencia ?? source?.referenceDate ?? 'sem data registrada',
      publicacao: fallback?.publicacao ?? source?.publishedAt,
      capturadoEm: fallback?.capturadoEm ?? observatorioData.meta.updatedAt,
      tipo: fallback?.tipo ?? (source?.nature === 'official'
        ? 'OFICIAL'
        : source?.nature === 'derived'
          ? 'DERIVADO'
          : 'SECUNDARIO'),
      checksum: fallback?.checksum,
      transformacao: fallback?.transformacao,
      limitacoes: fallback?.limitacoes ?? (source?.note ? [source.note] : undefined),
      snapshotId: fallback?.snapshotId,
      rawUrl: fallback?.rawUrl,
    };
  }, [request]);

  if (!request || !provenance) return null;

  const text = [
    provenance.fonte,
    'Referência: ' + provenance.referencia,
    provenance.tipo,
    provenance.transformacao ?? '',
    ...(provenance.limitacoes ?? []),
    provenance.fonteUrl,
  ].filter(Boolean).join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
  };

  const downloadJson = () => {
    const payload = JSON.stringify(provenance, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = provenance.valueId + '-proveniencia.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div data-testid="provenance-drawer" className="command-overlay" role="dialog" aria-modal="true" aria-labelledby="provenance-title">
      <button className="command-backdrop" type="button" aria-label="Fechar proveniência" onClick={() => setRequest(null)} />
      <article ref={drawerRef} className="command-panel max-w-xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Proveniência</div>
            <h2 id="provenance-title" className="mt-1 text-xl font-black text-white">De onde vem este número?</h2>
          </div>
          <button ref={closeRef} type="button" onClick={() => setRequest(null)} className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Fechar">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Fonte" value={provenance.fonte} />
            <Info label="Tipo" value={provenance.tipo} />
            <Info label="Referência" value={provenance.referencia} />
            <Info label="Capturado em" value={provenance.capturadoEm} />
          </div>

          {provenance.transformacao && (
            <div className="rounded-2xl border border-sky-300/10 bg-sky-300/[0.035] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Transformação</div>
              <p className="mt-1 text-sm text-slate-300">{provenance.transformacao}</p>
            </div>
          )}

          {(provenance.limitacoes?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200/80">Limitações registradas</div>
              <div className="mt-2 space-y-1.5">
                {provenance.limitacoes?.map(item => <p key={item} className="text-xs leading-5 text-slate-400">{item}</p>)}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <a href={provenance.fonteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs font-bold text-sky-200">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Abrir fonte original
            </a>
            <button type="button" onClick={downloadJson} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> Baixar JSON
            </button>
            <button type="button" onClick={() => void copy()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">
              <Clipboard className="h-3.5 w-3.5" aria-hidden="true" /> Copiar proveniência
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
