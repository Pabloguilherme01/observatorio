import { ArrowUp } from '../../components/icons';
import { useEffect, useState } from 'react';

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="scroll-top-button fixed bottom-5 right-5 z-30 grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[#101821]/90 text-slate-300 shadow-xl backdrop-blur-xl transition hover:border-sky-300/30 hover:text-white"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
