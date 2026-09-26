import { useEffect, useRef, type ReactNode } from 'react';
import { MobileBottomNav } from './layout/MobileBottomNav';
import { useLanguageMode } from '../context/LanguageModeContext';
import { navigation } from '../config/navigation';

export function ExperienceShell({ children }: { readonly children: ReactNode }) {
  const { cycleMode } = useLanguageMode();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const syncReducedMotion = () => {
      document.documentElement.classList.toggle('reduced-motion', Boolean(media?.matches));
    };
    syncReducedMotion();
    media?.addEventListener?.('change', syncReducedMotion);

    return () => {
      media?.removeEventListener?.('change', syncReducedMotion);
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
    const shortcutMap = new Map(navigation.map(item => [item.shortcut.replace(/\s+/g, '').toLowerCase(), item.id]));
    let navigationSequence = '';
    let navigationSequenceTimer = 0;

    const clearNavigationSequence = () => {
      navigationSequence = '';
      if (navigationSequenceTimer) {
        window.clearTimeout(navigationSequenceTimer);
        navigationSequenceTimer = 0;
      }
    };

    const keepNavigationSequence = (sequence: string) => {
      navigationSequence = sequence;
      if (navigationSequenceTimer) window.clearTimeout(navigationSequenceTimer);
      navigationSequenceTimer = window.setTimeout(clearNavigationSequence, 1200);
    };

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
      if (typing) return;
      if (event.altKey && !event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        cycleMode();
        return;
      }
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || (!event.metaKey && !event.ctrlKey && !event.altKey && event.key === '/')) {
        event.preventDefault();
        clearNavigationSequence();
        window.dispatchEvent(new CustomEvent('observatorio:search'));
        return;
      }

      if (!event.metaKey && !event.ctrlKey && !event.altKey && event.key.length === 1) {
        const nextSequence = navigationSequence + event.key.toLowerCase();
        const destination = shortcutMap.get(nextSequence);
        const hasPrefix = [...shortcutMap.keys()].some(shortcut => shortcut.startsWith(nextSequence));

        if (destination) {
          event.preventDefault();
          clearNavigationSequence();
          window.history.replaceState(null, '', '#' + destination);
          window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: destination }));
          return;
        }

        if (hasPrefix) {
          event.preventDefault();
          keepNavigationSequence(nextSequence);
          return;
        }

        clearNavigationSequence();
        if (event.key.toLowerCase() === 'g' && [...shortcutMap.keys()].some(shortcut => shortcut.startsWith('g'))) {
          event.preventDefault();
          keepNavigationSequence('g');
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearNavigationSequence();
    };
  }, [cycleMode]);

  return (
    <>
      <div ref={progressRef} className="reading-progress" style={{ width: '0%' }} aria-hidden="true" />
      {children}
      <MobileBottomNav />
    </>
  );
}
