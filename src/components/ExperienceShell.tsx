import { useEffect, useRef, type ReactNode } from 'react';
import { MobileBottomNav } from './layout/MobileBottomNav';

export function ExperienceShell({ children }: { readonly children: ReactNode }) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const syncReducedMotion = () => {
      document.documentElement.classList.toggle('reduced-motion', Boolean(media?.matches));
    };
    syncReducedMotion();
    media?.addEventListener?.('change', syncReducedMotion);

    const onCommand = () => {
      window.dispatchEvent(new CustomEvent('observatorio:search'));
    };
    window.addEventListener('observatorio:command', onCommand);

    return () => {
      media?.removeEventListener?.('change', syncReducedMotion);
      window.removeEventListener('observatorio:command', onCommand);
    };
  }, []);

  useEffect(() => {
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
        progressRef.current?.style.setProperty('width', progress + '%');
        scrollRaf = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (typing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('observatorio:search'));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div ref={progressRef} className="reading-progress" style={{ width: '0%' }} aria-hidden="true" />
      {children}
      <MobileBottomNav />
    </>
  );
}
