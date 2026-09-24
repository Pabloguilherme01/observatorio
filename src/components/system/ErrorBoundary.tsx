import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

interface Props {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

interface State {
  readonly hasError: boolean;
  readonly message: string;
  readonly errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, message: '', errorId: '' };

  public static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Erro inesperado ao carregar a aplicação.';
    const errorId = 'UI-' + Date.now().toString(36).toUpperCase();
    try {
      sessionStorage.setItem('observatorio:last-ui-error', JSON.stringify({ errorId, message, at: new Date().toISOString() }));
    } catch {}
    return { hasError: true, message, errorId };
  }

  public componentDidCatch(error: unknown, info: ErrorInfo): void {
    const componentStack = info.componentStack?.trim() || '';
    try {
      const previous = sessionStorage.getItem('observatorio:last-ui-error');
      const payload = previous ? JSON.parse(previous) : {};
      sessionStorage.setItem('observatorio:last-ui-error', JSON.stringify({
        ...payload,
        message: error instanceof Error ? error.message : String(error),
        componentStack,
      }));
    } catch {}
    if (import.meta.env.DEV) {
      console.error('Observatório: erro de renderização', error, info);
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleRecover = async (): Promise<void> => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.includes('observatorio')).map(key => caches.delete(key)));
      }
    } finally {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <main className="grid min-h-screen place-items-center bg-[#0b1117] px-6 py-16 text-white">
        <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-7 text-center shadow-2xl backdrop-blur-xl" role="alert">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
            <TriangleAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Observatório · recuperação</p>
          <h1 className="mt-2 text-2xl font-black">Não foi possível montar esta página</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            O conteúdo está publicado, mas ocorreu um erro durante a inicialização da interface. Tente recarregar. Se o problema persistir, informe o código abaixo para facilitar a análise.
          </p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3 text-left">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">Código do erro</div>
            <code className="mt-1 block text-xs font-bold text-slate-300">{this.state.errorId || 'UI-UNKNOWN'}</code>
            {this.state.message && <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-left text-xs text-slate-500">{this.state.message}</pre>}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={this.handleReload} className="inline-flex items-center gap-2 rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-200">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Recarregar
            </button>
            <button type="button" onClick={this.handleRecover} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/[0.08]">
              Limpar cache e recuperar
            </button>
          </div>
        </section>
      </main>
    );
  }
}
