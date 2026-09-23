import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from '../../components/icons.mjs';

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly hasError: boolean;
  readonly message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, message: '' };

  public static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Erro inesperado ao carregar a aplicação.',
    };
  }

  public componentDidCatch(error: unknown, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Observatório: erro de renderização', error, info);
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-[#0b1117] px-6 py-16 text-white">
        <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-7 text-center shadow-2xl backdrop-blur-xl" role="alert">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
            <TriangleAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Observatório · recuperação</p>
          <h1 className="mt-2 text-2xl font-black">Não foi possível montar esta página</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            O conteúdo está publicado, mas ocorreu um erro durante a inicialização da interface. Recarregue para tentar novamente.
          </p>
          {this.state.message && import.meta.env.DEV && (
            <pre className="mt-4 overflow-auto rounded-2xl bg-black/30 p-3 text-left text-xs text-slate-500">{this.state.message}</pre>
          )}
          <button type="button" onClick={this.handleReload} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-200">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Recarregar
          </button>
        </section>
      </main>
    );
  }
}
