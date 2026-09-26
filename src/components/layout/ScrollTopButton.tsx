import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > 700);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const reduceMotion = document.documentElement.classList.contains('reduced-motion')
          || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

        if (!reduceMotion) {
          fallbackTimerRef.current = window.setTimeout(() => {
            fallbackTimerRef.current = null;
            if (window.scrollY > 50) window.scrollTo({ top: 0, behavior: 'auto' });
          }, 700);
        }
      }}
      className="scroll-top-button fixed right-4 z-30 grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[#101821]/90 text-slate-300 shadow-xl backdrop-blur-xl transition hover:border-sky-300/30 hover:text-white md:bottom-5"
      style={{ bottom: 'max(5rem, calc(4.6rem + env(safe-area-inset-bottom, 0px)))' }}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
