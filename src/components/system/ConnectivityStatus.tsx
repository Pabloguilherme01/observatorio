import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type ConnectivityState = 'hidden' | 'offline' | 'checking' | 'restored';

export function ConnectivityStatus() {
  const [state, setState] = useState<ConnectivityState>(() => navigator.onLine ? 'hidden' : 'offline');
  const hideTimerRef = useRef<number | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const clearHideTimer = useCallback(() => {
    if (!hideTimerRef.current) return;
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setState('hidden');
    }, 2800);
  }, [clearHideTimer]);

  const verifyConnection = useCallback(async () => {
    clearHideTimer();
    requestRef.current?.abort();

    if (!navigator.onLine) {
      setState('offline');
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setState('checking');

    try {
      const response = await fetch(import.meta.env.BASE_URL + 'api/v1/health.json', {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('healthcheck-unavailable');
      setState('restored');
      scheduleHide();
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
      setState('offline');
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [clearHideTimer, scheduleHide]);

  useEffect(() => {
    const onOffline = () => {
      clearHideTimer();
      requestRef.current?.abort();
      requestRef.current = null;
      setState('offline');
    };
    const onOnline = () => {
      void verifyConnection();
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      clearHideTimer();
      requestRef.current?.abort();
    };
  }, [clearHideTimer, verifyConnection]);

  if (state === 'hidden') return null;

  const restored = state === 'restored';
  const checking = state === 'checking';

  return (
    <aside
      className={'connectivity-status connectivity-status-' + state}
      role="status"
      aria-live="polite"
      aria-label="Status de conexão"
    >
      <span className="connectivity-status-icon" aria-hidden="true">
        {restored ? <Wifi /> : <WifiOff />}
      </span>
      <span className="connectivity-status-copy">
        <strong>{restored ? 'Conexão restabelecida' : checking ? 'Verificando conexão…' : 'Sem conexão'}</strong>
        <small>
          {restored
            ? 'A publicação online voltou a responder.'
            : checking
              ? 'Confirmando acesso à publicação atual.'
              : 'Você pode continuar vendo o conteúdo já disponível neste dispositivo.'}
        </small>
      </span>
      {!restored && (
        <button type="button" onClick={() => void verifyConnection()} disabled={checking}>
          <RefreshCw className={checking ? 'is-spinning' : ''} aria-hidden="true" />
          {checking ? 'Verificando…' : 'Verificar'}
        </button>
      )}
    </aside>
  );
}
