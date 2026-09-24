import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/globals.css';
import { App } from './app/App';
import { ErrorBoundary } from './components/system/ErrorBoundary';
import { captureObservatorioException } from './lib/sentry';

const BOOT_ERROR_KEY = 'observatorio:last-boot-error';
const RUNTIME_ERROR_KEY = 'observatorio:last-runtime-error';
const BOOT_TIMEOUT_MS = 10000;

function normalizeError(value: unknown): string {
  if (value instanceof Error) return value.message || value.name || 'Erro inesperado.';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return 'Erro inesperado ao inicializar a aplicação.'; }
}

function persistError(key: string, prefix: string, error: unknown, source: string): string {
  const errorId = prefix + '-' + Date.now().toString(36).toUpperCase();
  const message = normalizeError(error);
  try {
    sessionStorage.setItem(key, JSON.stringify({
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

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; }>;
};

function MountSignal() {
  useEffect(() => {
    document.documentElement.dataset.observatorioMounted = 'true';
    window.dispatchEvent(new CustomEvent('observatorio:app-mounted'));
  }, []);
  return null;
}

function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      event.preventDefault();
      setInstallEvent(promptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!installEvent) return null;

  const install = async () => {
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } finally {
      setInstallEvent(null);
    }
  };

  return (
    <div className="pwa-install-banner" role="status" aria-live="polite">
      <div>
        <strong>Instalar o Observatório</strong>
        <small>Atalho para abrir o painel como aplicativo, quando o navegador oferecer suporte.</small>
      </div>
      <button type="button" className="pwa-install-button" onClick={install}>
        Instalar
      </button>
    </div>
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
  const mounted = document.documentElement.dataset.observatorioMounted === 'true';
  const errorId = mounted
    ? persistError(RUNTIME_ERROR_KEY, 'RUNTIME', value, source)
    : persistError(BOOT_ERROR_KEY, 'BOOT', value, source);
  console.error('[Observatório]', source, value);
  captureObservatorioException(value, { source, errorId });
  window.dispatchEvent(new CustomEvent('observatorio:global-error', { detail: { source, message, errorId } }));
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

  const registerPwa = () => {
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
          console.warn('[Observatório][pwa] registro indisponível', error);
        }
      })
      .catch(error => console.warn('[Observatório][pwa] módulo indisponível', error));
  };

  window.addEventListener('observatorio:app-mounted', registerPwa, { once: true });

  const onApplyUpdate = () => { if (updateSW) void updateSW(true); };
  window.addEventListener('observatorio:pwa-apply-update', onApplyUpdate);

  const bootTimeout = window.setTimeout(() => {
    if (document.documentElement.dataset.observatorioMounted !== 'true') {
      const errorId = persistError(
        BOOT_ERROR_KEY,
        'BOOT',
        new Error('Tempo limite de inicialização excedido.'),
        'timeout',
      );
      root.replaceChildren();
      reactRoot.render(
        <BootstrapFallback
          errorId={errorId}
          message="A interface excedeu o limite de 10 segundos para concluir a inicialização."
        />,
      );
    }
  }, BOOT_TIMEOUT_MS);

  window.addEventListener('observatorio:app-mounted', () => window.clearTimeout(bootTimeout), { once: true });

  try {
    console.info('[Observatório][boot] 2/4 dependências principais carregadas');
    console.info('[Observatório][boot] 3/4 renderizando interface');
    reactRoot.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <MountSignal />
        <PwaStatus />
        <PwaInstallPrompt />
      </StrictMode>,
    );
    console.info('[Observatório][boot] 4/4 React render() concluído em ' + Math.round(performance.now() - bootStartedAt) + 'ms');
  } catch (error) {
    const errorId = persistError(BOOT_ERROR_KEY, 'BOOT', error, 'render');
    root.replaceChildren();
    reactRoot.render(<BootstrapFallback errorId={errorId} message={normalizeError(error)} />);
  }
}
