import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/globals.css';
import { App } from './app/App';
import { ErrorBoundary } from './components/system/ErrorBoundary';

const BOOT_ERROR_KEY = 'observatorio:last-boot-error';
const BOOT_TIMEOUT_MS = 10000;

function normalizeError(value: unknown): string {
  if (value instanceof Error) return value.message || value.name || 'Erro inesperado.';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return 'Erro inesperado ao inicializar a aplicação.'; }
}

function persistBootError(error: unknown, source: string): string {
  const errorId = 'BOOT-' + Date.now().toString(36).toUpperCase();
  const message = normalizeError(error);
  try {
    sessionStorage.setItem(BOOT_ERROR_KEY, JSON.stringify({
      errorId, message, source, at: new Date().toISOString(), href: window.location.href,
    }));
  } catch {}
  return errorId;
}

function BootstrapFallback({ errorId, message }: { readonly errorId: string; readonly message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b1117] px-6 py-16 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-amber-300/15 bg-white/[0.035] p-7 text-center shadow-2xl" role="alert">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Observatório · inicialização</div>
        <h1 className="mt-3 text-2xl font-black">A interface não terminou de carregar</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
          O navegador carregou a página, mas a aplicação não concluiu a inicialização. Recarregue para tentar novamente.
        </p>
        <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3 text-left">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">Código</div>
          <code className="mt-1 block text-xs font-bold text-slate-300">{errorId}</code>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-500">{message}</pre>
        </div>
        <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950">
          Recarregar
        </button>
      </section>
    </main>
  );
}

function PwaStatus() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  useEffect(() => {
    const onUpdate = () => setUpdateAvailable(true);
    window.addEventListener('observatorio:pwa-update-available', onUpdate);
    return () => window.removeEventListener('observatorio:pwa-update-available', onUpdate);
  }, []);
  if (!updateAvailable) return null;
  return (
    <div className="pwa-update-banner" role="status" aria-live="polite">
      <span>Há uma versão mais recente do Observatório.</span>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:pwa-apply-update'))} className="pwa-update-button">
        Atualizar
      </button>
    </div>
  );
}

function captureGlobalError(source: string, value: unknown): void {
  const message = normalizeError(value);
  persistBootError(value, source);
  console.error('[Observatório]', source, value);
  window.dispatchEvent(new CustomEvent('observatorio:global-error', { detail: { source, message } }));
}

const root = document.getElementById('root');

if (!root) {
  document.body.innerHTML = '<main style="padding:24px;font-family:system-ui">Elemento #root não encontrado.</main>';
} else {
  const reactRoot = createRoot(root);
  const bootStartedAt = performance.now();
  console.info('[Observatório][boot] 1/4 main.tsx carregado');

  window.addEventListener('error', event => captureGlobalError('window.error', event.error ?? event.message));
  window.addEventListener('unhandledrejection', event => captureGlobalError('unhandledrejection', event.reason));

  let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;
  void import('virtual:pwa-register')
    .then(pwa => {
      try {
        updateSW = pwa.registerSW({
          immediate: true,
          onNeedRefresh() {
            window.dispatchEvent(new CustomEvent('observatorio:pwa-update-available'));
          },
        });
      } catch (error) {
        captureGlobalError('pwa-register', error);
      }
    })
    .catch(error => captureGlobalError('pwa-module', error));

  const onApplyUpdate = () => { if (updateSW) void updateSW(true); };
  window.addEventListener('observatorio:pwa-apply-update', onApplyUpdate);

  try {
    console.info('[Observatório][boot] 2/4 dependências principais carregadas');
    console.info('[Observatório][boot] 3/4 renderizando interface');
    reactRoot.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
          <PwaStatus />
        </ErrorBoundary>
      </StrictMode>,
    );
    console.info('[Observatório][boot] 4/4 React render() concluído em ' + Math.round(performance.now() - bootStartedAt) + 'ms');
    document.documentElement.dataset.observatorioMounted = 'true';
    window.dispatchEvent(new CustomEvent('observatorio:app-mounted'));
  } catch (error) {
    const errorId = persistBootError(error, 'render');
    root.replaceChildren();
    reactRoot.render(<BootstrapFallback errorId={errorId} message={normalizeError(error)} />);
  }

  window.setTimeout(() => {
    if (document.documentElement.dataset.observatorioMounted !== 'true') {
      const errorId = persistBootError(new Error('Tempo limite de inicialização excedido.'), 'timeout');
      root.replaceChildren();
      reactRoot.render(<BootstrapFallback errorId={errorId} message="A interface excedeu o limite de 10 segundos para concluir a inicialização." />);
    }
  }, BOOT_TIMEOUT_MS);
}
