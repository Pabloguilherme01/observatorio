import { useEffect, useState } from 'react';
import { Check, RefreshCw, WifiOff, X } from 'lucide-react';

interface DataUpdatedMessage {
  readonly type: 'DATA_UPDATED';
  readonly emittedAt?: string;
}

export function DataUpdateToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      const messageData = data as Partial<DataUpdatedMessage>;
      if (messageData.type !== 'DATA_UPDATED') return;
      setMessage('Dados atualizados em segundo plano · recarregue para aplicar');
    };

    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);

    navigator.serviceWorker?.addEventListener('message', onMessage);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', onMessage);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  if (!message && !offline) return null;

  return (
    <div className="fixed left-1/2 top-3 z-[120] w-[min(94vw,420px)] -translate-x-1/2 space-y-2" aria-live="polite" aria-atomic="true">
      {offline && (
        <div className="rounded-2xl border border-amber-400/20 bg-slate-950/95 px-4 py-3 text-xs text-slate-200 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 font-bold text-amber-200">
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            Offline
          </div>
          <p className="mt-1 text-slate-400">Os dados exibidos podem ser a última captura disponível no aparelho.</p>
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/95 px-4 py-3 text-xs text-slate-200 shadow-2xl backdrop-blur-md" role="status">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="font-bold">{message}</div>
              <button
                type="button"
                className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-slate-200"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Recarregar
              </button>
            </div>
            <button type="button" aria-label="Fechar aviso de atualização" className="rounded-lg p-1.5 text-slate-500" onClick={() => setMessage(null)}>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
