import { Radio, RefreshCw } from 'lucide-react';
import { useResultsFeed } from '../../hooks/useResultsFeed';

export function ResultsLiveBanner() {
  const { data, checking } = useResultsFeed();

  if (!data || data.state === 'pending') return null;

  const label = data.state === 'live' ? 'AO VIVO · Apuração TSE' : 'RESULTADO · TSE';
  const detail = data.items.length
    ? `${data.items.length} registros recebidos`
    : 'Nenhum registro municipal no feed atual';

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-live="polite">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
          <div>
            <strong className="block text-sm text-slate-100">{label}</strong>
            <span className="text-xs text-slate-500">{detail} · capturado em {new Date(data.capturedAt).toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {checking ? <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
          atualização silenciosa
        </span>
      </div>
    </section>
  );
}
