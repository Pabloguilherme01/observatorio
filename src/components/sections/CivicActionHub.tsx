import { useEffect, useState } from 'react';
import { ClipboardCheck, ExternalLink, Landmark, Link2, SearchCheck, ShieldCheck, Smartphone } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { SectionHeader } from '../ui/SectionHeader';
import { copyText } from '../../lib/clipboard';
import { buildCanonicalUrl, getPublicServiceQuery, replaceCurrentUrl, urlParamKeys } from '../../lib/urlState';
import { OfficialResourceCard } from './civic/OfficialResourceCard';
import { additionalPublicServices, allMunicipalServices, normalizePublicServiceQuery, priorityPublicServices, publicServiceSearchAliases } from '../../data/publicServices';



export function CivicActionHub() {
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const summary = mode === 'summary';
  const [serviceQuery, setServiceQuery] = useState(getPublicServiceQuery);
  const [queryLinkCopied, setQueryLinkCopied] = useState(false);
  const tesser = [
    ['situacao','Consultar situação eleitoral','Acesse situação do título, local de votação e serviços disponíveis.','https://www.tse.jus.br/servicos-eleitorais/titulo-eleitoral/autoatendimento-eleitoral','service'],
    ['candidaturas','Candidaturas e contas','Consulte registros, bens, receitas e despesas no DivulgaCandContas.','https://divulgacandcontas.tse.jus.br/divulga/#/','search'],
    ['resultados','Resultados oficiais','Acompanhe a divulgação oficial quando houver dados publicados.','https://resultados.tse.jus.br/','results'],
    ['eleicoes2026','Portal Eleições 2026','Calendário, orientações, estatísticas e serviços da Justiça Eleitoral.','https://www.tse.jus.br/eleicoes/eleicoes-2026','rules'],
    ['justificativa','Justificar ausência','Consulte as formas e os prazos oficiais para justificativa eleitoral.','https://www.tse.jus.br/servicos-eleitorais/justificativa-eleitoral','rules'],
    ['certidoes','Emitir certidões eleitorais','Acesse certidões e validações disponibilizadas pela Justiça Eleitoral.','https://www.tse.jus.br/servicos-eleitorais/certidoes','service'],
    ['multas','Quitar débitos eleitorais','Consulte orientações oficiais para débitos e multas eleitorais.','https://www.tse.jus.br/servicos-eleitorais/titulo-eleitoral/quitacao-de-multas','service'],
    ['dadosabertos','Dados abertos do TSE','Bases públicas para conferência e análise técnica.','https://dadosabertos.tse.jus.br/','data'],
  ];
  const visiblePriority = technical ? priorityPublicServices.slice(0, 8) : priorityPublicServices.slice(0, 6);
  const normalizedServiceQuery = normalizePublicServiceQuery(serviceQuery);
  const serviceTerms = normalizedServiceQuery.split(/\s+/).filter(Boolean);
  const visibleMunicipalServices = normalizedServiceQuery
    ? allMunicipalServices.filter(service => {
        const aliases = publicServiceSearchAliases[service.title] ?? '';
        const searchable = normalizePublicServiceQuery(service.title + ' ' + service.description + ' ' + ('cta' in service ? service.cta ?? '' : '') + ' ' + aliases);
        return serviceTerms.every(term => searchable.includes(term));
      })
    : visiblePriority;

  useEffect(() => {
    const onServiceSearch = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === 'string') setServiceQuery(detail);
    };
    const syncFromLocation = () => setServiceQuery(getPublicServiceQuery());
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
      { [urlParamKeys.publicService]: trimmed || null },
      { state: { ...currentState, publicServiceQuery: trimmed } },
    );
    setQueryLinkCopied(false);
  }, [serviceQuery]);

  const copyServiceSearchLink = async () => {
    const trimmed = serviceQuery.trim();
    if (!trimmed) return;
    const url = buildCanonicalUrl({ [urlParamKeys.publicService]: trimmed }, 'acao');
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

      <div className="official-hub">
        <div className="official-hub-head">
          <div>
            <span className="official-hub-kicker">Justiça Eleitoral · TSE</span>
            <h3 className="official-hub-title">Recursos oficiais</h3>
            <p className="official-hub-subtitle">{technical ? 'Bases e serviços oficiais para conferência detalhada.' : summary ? 'Serviços essenciais para consultar rapidamente.' : 'Serviços e consultas oficiais para continuar a leitura com segurança.'}</p>
          </div>
          <a className="official-hub-all" href="https://www.tse.jus.br/eleicoes/eleicoes-2026" target="_blank" rel="noopener noreferrer">
            Abrir portal do TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="official-resource-grid">
          {tesser.slice(0, technical ? tesser.length : 4).map(([id,title,description,href,icon]) => (
            <a key={id} href={href} target="_blank" rel="noopener noreferrer" className="official-resource-card">
              <span className="official-resource-icon" aria-hidden="true">
                {icon === 'search' ? <SearchCheck className="h-5 w-5" /> :
                 icon === 'results' ? <Landmark className="h-5 w-5" /> :
                 icon === 'service' ? <Smartphone className="h-5 w-5" /> :
                 icon === 'rules' ? <ClipboardCheck className="h-5 w-5" /> :
                 <ShieldCheck className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ExternalLink className="official-resource-arrow h-4 w-4" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

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
        {serviceQuery && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500" role="status" aria-live="polite" aria-atomic="true">
              {visibleMunicipalServices.length} serviço{visibleMunicipalServices.length === 1 ? '' : 's'} encontrado{visibleMunicipalServices.length === 1 ? '' : 's'} para “{serviceQuery.trim()}”.
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
            <p className="mt-1 text-xs leading-5 text-slate-500">A busca combina todos os termos informados. Tente uma necessidade mais curta ou escolha uma busca frequente:</p>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Buscas frequentes por serviço">
              {['medicamentos', 'emprego', 'creches', 'obras', 'contratos', 'ouvidoria'].map(suggestion => (
                <button key={suggestion} type="button" onClick={() => setServiceQuery(suggestion)} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-bold text-sky-200 transition hover:bg-white/5 light:border-slate-200 light:text-sky-800 light:hover:bg-white">
                  {suggestion[0].toUpperCase() + suggestion.slice(1)}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setServiceQuery('')} className="mt-2 min-h-10 rounded-xl border border-white/10 px-3 text-xs font-bold text-sky-300 light:border-slate-200 light:text-sky-700">Ver serviços principais</button>
          </div>
        )}

        <div className="official-resource-grid official-resource-grid-local">
          {visibleMunicipalServices.map(service => (
            <OfficialResourceCard key={service.title} service={service} />
          ))}
        </div>

        {technical && !serviceQuery && <details className="official-more">
          <summary>Mais serviços oficiais <span>+{Math.max(0, priorityPublicServices.length - 8 + additionalPublicServices.length)} caminhos</span></summary>
          <div className="official-more-grid">
            {[...priorityPublicServices.slice(8), ...additionalPublicServices].map(service => (
              <OfficialResourceCard key={service.title} service={service} compact />
            ))}
          </div>
        </details>}
      </div>

      <div className="official-source-note">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
        <p><strong>Você será direcionado ao canal oficial.</strong> O Observatório facilita a busca, mas não executa serviços públicos nem substitui a informação publicada pelo órgão responsável.</p>
      </div>
    </section>
  );
}
