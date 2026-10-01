import { useEffect, type RefObject } from 'react';

type DialogFocusOptions = {
  readonly open: boolean;
  readonly dialogRef: RefObject<HTMLElement | null>;
  readonly getInitialFocus?: () => HTMLElement | null;
  readonly restoreRef?: RefObject<HTMLElement | null>;
  readonly restoreSelector?: string;
  readonly onEscape?: () => void;
};

export function useDialogFocus({
  open,
  dialogRef,
  getInitialFocus,
  restoreRef,
  restoreSelector,
  onEscape,
}: DialogFocusOptions): void {
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;

    const focusables = () => Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], summary, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );

    const target = getInitialFocus?.() ?? focusables()[0];
    const raf = window.requestAnimationFrame(() => target?.focus());
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const restore = restoreRef?.current
        ?? (restoreSelector ? document.querySelector<HTMLElement>(restoreSelector) : null)
        ?? opener;
      if (restore?.isConnected) window.requestAnimationFrame(() => restore.focus());
    };
  }, [dialogRef, getInitialFocus, onEscape, open, restoreRef, restoreSelector]);
}
