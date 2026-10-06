import { inspectDataId, type InspectorDetail } from '../lib/dataInspectorEvents';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Clipboard, ExternalLink, Link2, Quote, Share2, X } from 'lucide-react';
import { observatorioData as d } from '../data/observatorioData';
import { copyText } from '../lib/clipboard';
import { useLanguageMode } from '../context/LanguageModeContext';
import { buildCanonicalUrl, getSearchParam, replaceCurrentUrl, urlParamKeys } from '../lib/urlState';
import { isIndicatorSaved, toggleSavedIndicator } from '../lib/savedIndicators';
import { buildDataInspectorModel } from './data-inspector/dataInspectorModel';

export function DataInspector() {
  const { mode: languageMode } = useLanguageMode();
  const [data, setData] = useState<InspectorDetail | null>(null);
  const [copied, setCopied] = useState(false);
  const [citationCopied, setCitationCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [saved, setSaved] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onInspect = (event: WindowEventMap['observatorio:inspect-data']) => {
      openerRef.current = document.activeElement as HTMLElement | null;
      const sectionId = event.detail.sectionId
        ?? openerRef.current?.closest<HTMLElement>('section[id]')?.id
        ?? undefined;
      setData({ ...event.detail, sectionId });
      setCopied(false);
      setCitationCopied(false);
      setLinkCopied(false);
      setActionError(false);
      setSaved(isIndicatorSaved(event.detail.inspectId ?? inspectDataId(event.detail)));
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

  const closeInspector = () => {
    if (data?.inspectId && getSearchParam(urlParamKeys.inspector) === data.inspectId) {
      replaceCurrentUrl({
        [urlParamKeys.inspector]: null,
        [urlParamKeys.readingMode]: null,
      });
    }
    setData(null);
  };

  useEffect(() => {
    if (!data) {
      openerRef.current?.focus?.();
      return;
    }
    const focusables = () => Array.from(modalRef.current?.querySelectorAll<HTMLElement>('button,input,[href],[tabindex]:not([tabindex="-1"])') ?? []).filter(node => !node.hasAttribute('disabled'));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeInspector(); return; }
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
      setLinkCopied(false);
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

  const canonicalUrl = buildCanonicalUrl(
    data.inspectId
      ? {
          [urlParamKeys.inspector]: data.inspectId,
          [urlParamKeys.readingMode]: languageMode,
        }
      : {},
    data.sectionId ? data.sectionId : (window.location.hash || 'dashboard'),
  );
  const {
    effectiveNote,
    statusLabel,
    referenceLabel,
    sourcePublishedLabel,
    sourceCheckedLabel,
    text,
    citation,
    correctionUrl,
  } = buildDataInspectorModel(data, source, canonicalUrl);

  const toggleSaved = () => {
    const next = toggleSavedIndicator({ id: data.inspectId ?? inspectDataId(data), title: data.label, url: canonicalUrl });
    setSaved(next.some(item => item.id === (data.inspectId ?? inspectDataId(data))));
  };

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
      <button className="command-backdrop" type="button" aria-label="Fechar inspetor de dados" onClick={closeInspector} />
      <article ref={modalRef} className="command-panel data-inspector-panel max-w-xl light:bg-white light:text-slate-900" aria-describedby="data-inspector-context">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 light:border-slate-200">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300/80">Inspetor de dados</div>
            <h2 id="data-inspector-title" className="mt-1 text-xl font-black text-white light:text-slate-950">{data.label}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={closeInspector} className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white light:hover:bg-slate-100 light:hover:text-slate-950" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p id="data-inspector-context" className="sr-only">Detalhes de origem, referência temporal, natureza e método do dado selecionado.</p>
          <div className="rounded-2xl border border-sky-300/15 bg-sky-300/5 p-4 light:border-sky-200 light:bg-sky-50">
            <div className="text-3xl font-black text-white light:text-slate-900">{data.value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-500">{data.method ?? 'Valor apresentado pelo conjunto de dados do observatório.'}</div>
            <div className="dashboard-card-meta mt-3">
              {data.status && <span className="dashboard-meta-chip" data-kind={data.status}>{statusLabel}</span>}
              <span className="dashboard-meta-chip">{effectiveReferenceDate ? `ref. ${referenceLabel}` : 'ref. não informada'}</span>
            </div>
          </div>

          <div className="data-inspector-grid grid gap-3 sm:grid-cols-2">
            <Info label="Instituição" value={source?.institution ?? 'Não informada'} />
            <Info label="Base / conjunto" value={source?.label ?? 'Não informado'} />
            <Info label="Natureza / estado" value={statusLabel ?? source?.nature ?? 'Não informado'} />
            <Info label="Ano-base / referência" value={referenceLabel ?? 'Não informado'} />
            <Info label="Publicação da fonte" value={sourcePublishedLabel ?? 'Não informada'} />
            <Info label="Atualização da fonte" value={source?.updateFrequency ?? 'Não informada'} />
            <Info label="Fonte verificada em" value={sourceCheckedLabel ?? 'Não informada'} />
          </div>

          {!effectiveReferenceDate && (
            <div className="rounded-2xl border border-amber-300/12 bg-amber-300/[0.025] p-4 text-xs leading-5 text-slate-400 light:border-amber-300/40 light:bg-amber-50/70 light:text-slate-600">
              <strong className="text-amber-200 light:text-amber-800">Referência temporal não estruturada</strong>
              <p className="mt-1">
                {sourcePublishedLabel
                  ? `A fonte registra publicação em ${sourcePublishedLabel}, mas essa data não substitui o ano-base ou a referência do indicador.`
                  : 'O registro não informa uma data de referência estruturada. Confira a fonte antes de tratar o valor como atual ou comparável a outro período.'}
              </p>
            </div>
          )}

          {effectiveNote && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-400 light:border-slate-200 light:bg-slate-50 light:text-slate-600">
              <strong className="text-slate-300 light:text-slate-700">Contexto e limites</strong>
              <p className="mt-1">{effectiveNote}</p>
            </div>
          )}

          {actionError && <p className="text-xs text-amber-300" role="status">Não foi possível concluir a ação. Tente novamente.</p>}
          <div className="data-inspector-actions flex flex-wrap gap-2">
            <button type="button" onClick={toggleSaved} aria-pressed={saved} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/[0.06] px-3 py-2 text-xs font-bold text-violet-100 light:border-violet-200 light:bg-violet-50 light:text-violet-800">
              {saved ? <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}
              {saved ? 'Remover dos salvos' : 'Salvar para depois'}
            </button>
            {source?.url && (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs font-bold text-sky-200 light:border-sky-200 light:bg-sky-50 light:text-sky-800">
                <ExternalLink className="h-3.5 w-3.5" /> Ver fonte
              </a>
            )}
            <a href={correctionUrl} target="_blank" rel="noopener noreferrer" aria-label={`Sugerir correção para ${data.label}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs font-bold text-amber-100 light:border-amber-200 light:bg-amber-50 light:text-amber-800">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Sugerir correção
            </a>
            <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button type="button" onClick={copyCitation} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50">
              {citationCopied ? <Check className="h-3.5 w-3.5" /> : <Quote className="h-3.5 w-3.5" />}
              {citationCopied ? 'Referência copiada' : 'Copiar referência'}
            </button>
            <button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50">
              {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              {linkCopied ? 'Link copiado' : 'Copiar link'}
            </button>
            <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-50">
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
  return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 light:border-slate-200 light:bg-slate-50">
    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{label}</div>
    <div className="mt-1 text-sm font-semibold text-white light:text-slate-900">{value}</div>
  </div>;
}
