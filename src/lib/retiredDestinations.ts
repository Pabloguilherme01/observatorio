// Compatibility only: these destinations have no corresponding content or requests.
const retired = new Set(['eleitorado','eleitoral360','candidaturas','politica','pesquisas','resultados','linha-do-tempo','mudancas-snapshot']);
export function isRetiredSavedIndicator(item: { id: string; title: string; url: string }) {
  return /eleitor|candidatur|pesquisa eleitoral|tse\.jus\.br|api\/v1\//i.test([item.id,item.title,item.url].join(' ')) || retired.has(new URL(item.url, window.location.origin).hash.slice(1));
}
export function redirectRetiredDestination() {
  const url = new URL(window.location.href);
  const retiredHash = retired.has(url.hash.slice(1));
  const before = url.href;
  for (const key of ['cargo','turno','candidato','eleicao','resultado']) url.searchParams.delete(key);
  if (retiredHash || /elector|eleitor|candidat|poll/i.test(url.searchParams.get('dado') ?? '')) url.searchParams.delete('dado');
  if (retiredHash) url.hash = 'descubra';
  if (before === url.href) return false;
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  return retiredHash;
}
