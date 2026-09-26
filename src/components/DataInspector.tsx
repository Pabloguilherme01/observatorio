import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clipboard, ExternalLink, Link2, Quote, Share2, X } from 'lucide-react';
import { observatorioData as d } from '../data/observatorioData';
import { copyText } from '../lib/clipboard';

type InspectorDetail = {
  label: string;
  value: string;
  sourceId?: string;
  status?: string;
  referenceDate?: string;
  note?: string;
  method?: string;
};

declare global {
  interface WindowEventMap {
    'observatorio:inspect-data': CustomEvent<InspectorDetail>;
  }
}

function dispatchInspect(detail: InspectorDetail) {
  window.dispatchEvent(new CustomEvent('observatorio:inspect-data', { detail }));
}

export { dispatchInspect };

export function DataInspector() {
  const [data, setData] = useState<InspectorDetail | null>(null);
  const [copied, setCopied] = useState(false);
  const [citationCopied, setCitationCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [actionError, setActionError] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onInspect = (event: WindowEventMap['observatorio:inspect-data']) => {
      openerRef.current = document.activeElement as HTMLElement | null;
      setData(event.detail);
      setCopied(false);
      setCitationCopied(false);
      setLinkCopied(false);
      setLinkCopied(false);
      setActionError(false);
    };
    window.addEventListener('observatorio:inspect-data', onInspect);
    return () => {
      window.removeEventListener('observatorio:inspect-data', onInspect);
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!data) {
      openerRef.current?.focus?.();
      return;
    }
    const focusables = () => Array.from(modalRef.current?.querySelectorAll<HTMLElement>('button,input,[href],[tabindex]:not([tabindex="-1"])') ?? []).filter(node => !node.hasAttribute('disabled'));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setData(null); return; }
      if (event.key !== 'Tab') return;
      const nodes = focusables();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [data]);

  const source = useMemo(
    () => d.sources.find(item => item.id === data?.sourceId),
    [data?.sourceId],
  );

  if (!data) return null;

  const text = [
    data.label,
    data.value,
    source ? `Fonte: ${source.institution} — ${source.label}` : '',
    data.status ? `Natureza/status: ${data.status}` : '',
    data.referenceDate ? `Referência: ${data.referenceDate}` : '',
    data.method ? `Método: ${data.method}` : '',
    data.note ?? source?.note ?? '',
  ].filter(Boolean).join('\n');

  const citation = [
    `${data.label}: ${data.value}.`,
    source ? `Fonte: ${source.institution} — ${source.label}.` : '',
    data.referenceDate || source?.referenceDate ? `Referência: ${data.referenceDate ?? source?.referenceDate}.` : '',
    source?.url ? `URL: ${source.url}` : '',
  ].filter(Boolean).join(' ');

  const markCopied = (kind: 'details' | 'citation' | 'link') => {
    setCopied(kind === 'details');
    setCitationCopied(kind === 'citation');
    setLinkCopied(kind === 'link');
    setActionError(false);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      copyTimerRef.current = null;
      setCopied(false);
      setCitationCopied(false);
    }, 1800);
  };

  const copy = async () => {
    if (await copyText(text)) {
      markCopied('details');
      return;
    }
    setCopied(false);
    setActionError(true);
  };

  const copyCitation = async () => {
    if (await copyText(citation)) {
      markCopied('citation');
      return;
    }
    setCitationCopied(false);
    setActionError(true);
  };

  const canonicalUrl = window.location.origin + window.location.pathname + (window.location.hash || '#dashboard');

  const copyLink = async () => {
    if (await copyText(canonicalUrl)) {
      markCopied('link');
      return;
    }
    setLinkCopied(false);
    setActionError(true);
  };

  const share = async () => {
    const shareData = { title: data.label, text, url: canonicalUrl };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setActionError(false);
      } else {
        const copiedShare = await copyText(text + '\n' + shareData.url);
        if (!copiedShare) throw new Error('share-copy-failed');
        markCopied('details');
      }
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') setActionError(true);
    }
  };

  return (
    <div className="command-overlay" role="dialog" aria-modal="true" aria-labelledby="data-inspector-title">
      <button className="command-backdrop" type="button" aria-label="Fechar inspetor de dados" onClick={() => setData(null)} />
      <article ref={modalRef} className="command-panel data-inspector-panel max-w-xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Inspetor de dados</div>
            <h2 id="data-inspector-title" className="mt-1 text-xl font-black text-white">{data.label}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={() => setData(null)} className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-sky-300/15 bg-sky-300/5 p-4">
            <div className="text-3xl font-black text-white">{data.value}</div>
            <div className="mt-2 text-xs text-slate-500">{data.method ?? 'Valor apresentado pelo dataset do observatório.'}</div>
          </div>

          <div className="data-inspector-grid grid gap-3 sm:grid-cols-2">
            <Info label="Fonte" value={source?.institution ?? 'Não informada'} />
            <Info label="Natureza / estado" value={data.status ?? source?.nature ?? 'Não informado'} />
            <Info label="Ano-base / referência" value={data.referenceDate ?? source?.referenceDate ?? 'Não informado'} />
            <Info label="Atualização da fonte" value={source?.updateFrequency ?? 'Não informada'} />
          </div>

          {(data.note || source?.note) && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-400">
              <strong className="text-slate-300">Nota metodológica</strong>
              <p className="mt-1">{data.note ?? source?.note}</p>
            </div>
          )}

          {actionError && <p className="text-xs text-amber-300" role="status">Não foi possível concluir a ação. Tente novamente.</p>}
          <div className="data-inspector-actions flex flex-wrap gap-2">
            {source?.url && (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs font-bold text-sky-200">
                <ExternalLink className="h-3.5 w-3.5" /> Ver fonte
              </a>
            )}
            <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button type="button" onClick={copyCitation} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">
              {citationCopied ? <Check className="h-3.5 w-3.5" /> : <Quote className="h-3.5 w-3.5" />}
              {citationCopied ? 'Referência copiada' : 'Copiar referência'}
            </button>
            <button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">
              {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              {linkCopied ? 'Link copiado' : 'Copiar link'}
            </button>
            <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">
              {typeof navigator.share === 'function' ? <Share2 className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              Compartilhar
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</div>
    <div className="mt-1 text-sm font-semibold text-white">{value}</div>
  </div>;
}
