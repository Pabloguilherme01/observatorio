/** Wait for lazy DOM content, coalescing mutations into a single frame. */
export function waitForDom(root: Node, check: () => boolean, timeoutMs: number): () => void {
  let stopped = false;
  let frame = 0;
  let timeout = 0;
  let observer: MutationObserver | null = null;

  const cancel = () => {
    if (stopped) return;
    stopped = true;
    observer?.disconnect();
    window.clearTimeout(timeout);
    window.cancelAnimationFrame(frame);
  };

  const run = () => {
    frame = 0;
    if (stopped) return;
    try {
      if (check() || !observer) cancel();
    } catch (error) {
      cancel();
      throw error;
    }
  };

  const schedule = () => {
    if (!stopped && !frame) frame = window.requestAnimationFrame(run);
  };

  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });
  }
  timeout = window.setTimeout(cancel, timeoutMs);
  schedule();
  return cancel;
}
