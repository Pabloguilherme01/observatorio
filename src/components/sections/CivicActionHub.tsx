import { useEffect, useState } from 'react';
import { Link2, SearchCheck, ShieldCheck } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { SectionHeader } from '../ui/SectionHeader';
import { copyText } from '../../lib/clipboard';
import { buildCanonicalUrl, getPublicServiceQuery, getSearchParam, replaceCurrentUrl, urlParamKeys } from '../../lib/urlState';
import { OfficialResourceCard } from './civic/OfficialResourceCard';
import { allMunicipalServices, normalizePublicServiceQuery, priorityPublicServices, matchesPublicService, publicServiceTopic, publicServiceTopics, type PublicServiceTopic } from '../../data/publicServices';
function getTopic(): PublicServiceTopic {
  const value = getSearchParam(urlParamKeys.publicServiceTopic);
  return publicServiceTopics.find(topic => topic === value) ?? 'Todos';
}
export function CivicActionHub() {
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const summary = mode === 'summary';
  const [serviceQuery, setServiceQuery] = useState(getPublicServiceQuery);
  const [queryLinkCopied, setQueryLinkCopied] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [topic, setTopic] = useState<PublicServiceTopic>(getTopic);
  const visiblePriority = technical ? priorityPublicServices.slice(0, 8) : priorityPublicServices.slice(0, 6);
  const normalizedServiceQuery = normalizePublicServiceQuery(serviceQuery);
  const matchingServices = allMunicipalServices.filter(service =>
    (topic === 'Todos' || publicServiceTopic(service) === topic) && matchesPublicService(service, serviceQuery),
  );
  const visibleMunicipalServices = normalizedServiceQuery || topic !== 'Todos' || showAllServices
    ? matchingServices : visiblePriority;


  useEffect(() => {
    const onServiceSearch = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === 'string') { setServiceQuery(detail); setTopic('Todos'); }
    };
    const syncFromLocation = () => { setServiceQuery(getPublicServiceQuery()); setTopic(getTopic()); };
    window.addEventListener('observatorio:public-service-search', onServiceSearch);
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('observatorio:public-service-search', onServiceSearch);
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#acao') return;
    const trimmed = serviceQuery.trim();
    const currentState = typeof window.history.state === 'object' && window.history.state !== null
      ? window.history.state
      : {};
    replaceCurrentUrl(
      { [urlParamKeys.publicService]: trimmed || null, [urlParamKeys.publicServiceTopic]: topic === 'Todos' ? null : topic },
      { state: { ...currentState, publicServiceQuery: trimmed } },
    );
    setQueryLinkCopied(false);
  }, [serviceQuery, topic]);

  const copyServiceSearchLink = async () => {
    const trimmed = serviceQuery.trim();
    if (!trimmed && topic === 'Todos') return;
    const url = buildCanonicalUrl({ [urlParamKeys.publicService]: trimmed || null, [urlParamKeys.publicServiceTopic]: topic === 'Todos' ? null : topic }, 'acao');
    if (await copyText(url)) setQueryLinkCopied(true);
  };

  return (
    <section id="acao" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="action-title">
      <SectionHeader
        titleId="action-title"
        eyebrow={technical ? 'Da evidência à fonte' : summary ? 'Do resumo à ação' : 'Da leitura à consulta'}
        title="Encontre um serviço ou confira uma informação"
        description={technical
          ? 'Abra registros, bases e documentos diretamente nas instituições responsáveis.'
          : summary
            ? 'Procure por uma necessidade e siga para o canal oficial responsável pelo atendimento.'
            : 'Consulte serviços, registros e fontes oficiais sem perder o contexto da informação.'}
      />

      <div className="official-hub civic-local-hub">
        <div className="official-hub-head">
          <div>
            <span className="official-hub-kicker">Águas Lindas · Prefeitura</span>
            <h3 className="official-hub-title">Serviços municipais</h3>
            <p className="official-hub-subtitle">{technical ? 'Catálogo ampliado para consulta e verificação institucional.' : summary ? 'Atalhos úteis para resolver ou consultar agora.' : 'Transparência, saúde e serviços em caminhos diretos e organizados.'}</p>
          </div>
        </div>

        <div className="mt-4 flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-2 light:border-slate-200 light:bg-slate-50">
          <SearchCheck className="h-4 w-4 shrink-0 text-sky-300 light:text-sky-700" aria-hidden="true" />
          <input
            type="search"
            value={serviceQuery}
            onChange={event => setServiceQuery(event.target.value)}
            placeholder="O que você precisa? Ex.: medicamentos, emprego, documentos, creche…"
            aria-label="Buscar serviço municipal por necessidade"
            className="min-h-11 min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-slate-600 light:text-slate-900"
          />
          {serviceQuery && (
            <button type="button" onClick={() => setServiceQuery('')} className="min-h-11 rounded-xl px-3 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white light:hover:bg-slate-100 light:hover:text-slate-900">
              Limpar
            </button>
          )}
        </div>
        <div className="mt-4 sm:hidden">
          <label htmlFor="service-topic" className="mb-2 block text-xs font-bold text-slate-300 light:text-slate-700">Assunto dos serviços</label>
          <select id="service-topic" value={topic} onChange={event => setTopic(event.target.value as PublicServiceTopic)} className="service-topic-select min-h-11 w-full rounded-xl border px-3 text-sm">
            {publicServiceTopics.map(label => <option key={label} value={label}>{label}</option>)}
          </select>
        </div>
        <div className="mt-4 hidden flex-wrap gap-2 sm:flex" role="group" aria-label="Filtrar serviços por assunto">
          {publicServiceTopics.map(label => (
            <button key={label} type="button" aria-pressed={topic === label} onClick={() => setTopic(label)} className="min-h-11 rounded-xl border border-sky-300/30 px-3 text-xs font-bold text-sky-200 aria-pressed:bg-sky-300/15 light:border-sky-700 light:text-sky-800 light:aria-pressed:bg-sky-100">
              {label}
            </button>
          ))}
        </div>
        {(serviceQuery || topic !== 'Todos') && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500" role="status" aria-live="polite" aria-atomic="true">
              {visibleMunicipalServices.length} serviço{visibleMunicipalServices.length === 1 ? '' : 's'} encontrado{visibleMunicipalServices.length === 1 ? '' : 's'} {serviceQuery.trim() ? `para “${serviceQuery.trim()}”` : ''}{topic !== 'Todos' ? ` em ${topic}` : ''}.
            </p>
            <button
              type="button"
              onClick={copyServiceSearchLink}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-[11px] font-bold text-sky-300 transition hover:bg-white/5 light:border-slate-200 light:text-sky-700 light:hover:bg-slate-100"
              aria-label="Copiar link desta busca de serviços"
            >
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              {queryLinkCopied ? 'Link copiado' : 'Copiar link desta busca'}
            </button>
            <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {queryLinkCopied ? 'Link da busca de serviços copiado.' : ''}
            </span>
          </div>
        )}

        {serviceQuery && visibleMunicipalServices.length === 0 && (
          <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-4" role="note">
            <strong className="block text-sm text-amber-100 light:text-amber-900">Nenhum serviço corresponde a todos os termos.</strong>
            <p className="mt-1 text-xs leading-5 text-slate-500">A busca combina os termos principais com o assunto selecionado. Tente uma necessidade mais curta ou escolha uma busca frequente:</p>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Buscas frequentes por serviço">
              {['medicamentos', 'emprego', 'creches', 'obras', 'contratos', 'ouvidoria'].map(suggestion => (
                <button key={suggestion} type="button" onClick={() => { setServiceQuery(suggestion); setTopic('Todos'); }} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-bold text-sky-200 transition hover:bg-white/5 light:border-slate-200 light:text-sky-800 light:hover:bg-white">
                  {suggestion[0].toUpperCase() + suggestion.slice(1)}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => { setServiceQuery(''); setTopic('Todos'); }} className="mt-2 min-h-10 rounded-xl border border-white/10 px-3 text-xs font-bold text-sky-300 light:border-slate-200 light:text-sky-700">Ver serviços principais</button>
          </div>
        )}

        <div className="official-resource-grid official-resource-grid-local">
          {visibleMunicipalServices.map(service => (
            <OfficialResourceCard key={service.title} service={service} />
          ))}
        </div>

        {!serviceQuery && topic === 'Todos' && <button type="button" onClick={() => setShowAllServices(value => !value)} aria-expanded={showAllServices} className="mt-4 min-h-11 rounded-xl border border-sky-300/30 px-4 text-sm font-bold text-sky-200 light:border-sky-700 light:text-sky-800">
          {showAllServices ? 'Mostrar serviços principais' : `Ver todos os ${allMunicipalServices.length} serviços municipais`}
        </button>}
      </div>

      <div className="official-source-note">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
        <p><strong>Você será direcionado ao canal oficial.</strong> O Observatório facilita a busca, mas não executa serviços públicos nem substitui a informação publicada pelo órgão responsável.</p>
      </div>
    </section>
  );
}
