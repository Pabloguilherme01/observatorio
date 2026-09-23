import { Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react';

interface DeferredSectionProps {
  readonly id?: string;
  readonly label: string;
  readonly component: LazyExoticComponent<ComponentType>;
  readonly minHeight?: number;
}

/**
 * Mantém o bundle inicial pequeno sem sacrificar navegação por âncora.
 * O wrapper recebe o id antes do carregamento e o conteúdo passa a ser dono
 * do id depois da carga. O rootMargin antecipa a importação para evitar
 * fallback visível durante a rolagem.
 */
export function DeferredSection({ id, label, component: Component, minHeight = 360 }: DeferredSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        setLoaded(true);
        observer.disconnect();
      },
      { rootMargin: '1000px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <div
      ref={containerRef}
      id={loaded ? undefined : id}
      aria-busy={!loaded}
      data-testid={loaded ? undefined : 'deferred-section'}
      style={{ minHeight: loaded ? undefined : minHeight }}
    >
      {loaded ? (
        <Suspense
          fallback={
            <div
              className="mx-auto flex min-h-64 max-w-7xl items-center justify-center px-4 py-12 text-xs text-slate-500"
              role="status"
              aria-live="polite"
            >
              Carregando {label}…
            </div>
          }
        >
          <Component />
        </Suspense>
      ) : (
        <span className="sr-only">A seção {label} será carregada conforme você se aproxima dela.</span>
      )}
    </div>
  );
}
