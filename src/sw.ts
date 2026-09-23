export {};

interface WorkerClient {
  readonly postMessage: (message: unknown) => void;
}

interface WorkerRuntime {
  readonly caches: CacheStorage;
  readonly clients: {
    matchAll: (options?: { readonly type?: string; readonly includeUncontrolled?: boolean }) => Promise<ReadonlyArray<WorkerClient>>;
  };
  readonly addEventListener: (type: string, listener: (event: Event) => void) => void;
  readonly skipWaiting: () => Promise<void>;
  readonly __WB_MANIFEST?: ReadonlyArray<{ readonly url: string }>;
  readonly location: Location;
}

interface InstallEventLike extends Event {
  readonly waitUntil: (promise: Promise<unknown>) => void;
}

interface ActivateEventLike extends Event {
  readonly waitUntil: (promise: Promise<unknown>) => void;
}

interface FetchEventLike extends Event {
  readonly request: Request;
  readonly respondWith: (promise: Promise<Response>) => void;
  readonly waitUntil: (promise: Promise<unknown>) => void;
}

declare const self: WorkerRuntime;

const runtime = self;

const STATIC_CACHE = 'observatorio-static-v44';
const API_CACHE = 'observatorio-data-v44';
const OFFLINE_URL = '/observatorio/offline.html';
const API_PATTERN = /(?:\/api\/|\.json(?:$|\?))/i;
const precache = self.__WB_MANIFEST ?? [];

async function notifyDataUpdated(): Promise<void> {
  const clients = await runtime.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clients.forEach(client => client.postMessage({
    type: 'DATA_UPDATED',
    cache: API_CACHE,
    emittedAt: new Date().toISOString(),
    semantics: 'background-cache-only',
  }));
}

async function refreshData(request: Request): Promise<Response> {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await runtime.caches.open(API_CACHE);
    await cache.put(request, response.clone());
    await notifyDataUpdated();
  }
  return response;
}

async function networkFirstNavigation(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await runtime.caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await runtime.caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    throw new Error('Navegação indisponível offline.');
  }
}

runtime.addEventListener('install', event => {
  const installEvent = event as InstallEventLike;
  installEvent.waitUntil((async () => {
    const cache = await runtime.caches.open(STATIC_CACHE);
    const urls = [
      ...precache.map(entry => new URL(entry.url, runtime.location.origin).toString()),
      new URL(OFFLINE_URL, runtime.location.origin).toString(),
    ];
    await cache.addAll([...new Set(urls)]);
    await runtime.skipWaiting();
  })());
});

runtime.addEventListener('activate', event => {
  const activateEvent = event as ActivateEventLike;
  activateEvent.waitUntil((async () => {
    const keys = await runtime.caches.keys();
    await Promise.all(keys
      .filter(key => ![STATIC_CACHE, API_CACHE].includes(key))
      .map(key => runtime.caches.delete(key)));
  })());
});

runtime.addEventListener('fetch', event => {
  const fetchEvent = event as FetchEventLike;
  if (fetchEvent.request.method !== 'GET') return;

  if (fetchEvent.request.mode === 'navigate') {
    fetchEvent.respondWith(networkFirstNavigation(fetchEvent.request));
    return;
  }

  if (!API_PATTERN.test(fetchEvent.request.url)) return;

  fetchEvent.respondWith((async () => {
    const cache = await runtime.caches.open(API_CACHE);
    const cached = await cache.match(fetchEvent.request);

    if (cached) {
      // A captura React permanece imutável durante a sessão; a renovação só atualiza o cache.
      fetchEvent.waitUntil(refreshData(fetchEvent.request).catch(() => undefined));
      return cached;
    }

    return refreshData(fetchEvent.request).catch(async () => {
      const fallback = await cache.match(fetchEvent.request);
      if (fallback) return fallback;
      throw new Error('Dados indisponíveis offline.');
    });
  })());
});
