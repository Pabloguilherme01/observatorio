import { ArrowRight, Database, Search } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { EDITION } from '../../config/version';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { useState, type FormEvent } from 'react';
import { navigateToSection } from '../../lib/sectionNavigation';
import { urlParamKeys } from '../../lib/urlState';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function MunicipalHero() {
  const [serviceQuery, setServiceQuery] = useState('');
  function findService(event: FormEvent) {
    event.preventDefault();
    const query = serviceQuery.trim();
    navigateToSection('acao', { state: { publicServiceQuery: query }, searchParams: { [urlParamKeys.publicService]: query || null, [urlParamKeys.publicServiceTopic]: null } });
    window.dispatchEvent(new CustomEvent('observatorio:public-service-search', { detail: query }));
  }
  const updatedAt = formatDate(d.meta.updatedAt);
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const guided = mode === 'guided';
  const summary = mode === 'summary';

  return (
    <section className="hero-shell citizen-hero relative overflow-hidden" aria-labelledby="hero-title">
      <div className="hero-inner mx-auto max-w-7xl">
        <div className="hero-topline">
          <div className="hero-badges">
            <Badge>{technical ? EDITION + ' · arquivo + método' : 'Dados públicos · fontes rastreáveis'}</Badge>
            {technical && <Badge>Dados e métodos</Badge>}
          </div>
          <span className="hero-updated"><Database aria-hidden="true" /> Conjunto publicado em {updatedAt}</span>
        </div>
        <div className="hero-layout">
          <div className="hero-copy">
            <span className="hero-kicker">Observatório de Águas Lindas de Goiás</span>
            <h1 id="hero-title">Sua cidade.<br />Informação para <em>o dia a dia.</em></h1>
            <p>
              {summary
                ? 'Entenda Águas Lindas de Goiás, encontre serviços e acompanhe o uso do dinheiro público. Cada número traz sua origem e seu período.'
                : technical
                  ? 'Dados municipais com período, fonte e método para acompanhar a cidade, seus serviços e o uso dos recursos públicos.'
                  : guided
                    ? 'Aprenda a ler os números da cidade passo a passo e encontre o canal público adequado à sua necessidade.'
                    : 'Entenda os indicadores de Águas Lindas, simule seu transporte e consulte os serviços e as contas públicas.'}
            </p>
            <div className="hero-actions">
              <a href="#descubra" className="hero-action primary">Explorar a cidade <ArrowRight aria-hidden="true" /></a>
              <a href="#acao" className="hero-action secondary">Encontrar serviços</a>
              <a href="#fontes" className="hero-action secondary">Conferir fontes</a>
              <button type="button" className="hero-action ghost" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:search'))}>
                <Search aria-hidden="true" /> Buscar
              </button>
            </div>
            {technical && (
              <div className="hero-reference-strip" aria-label="Referências rápidas" role="list">
                <span className="hero-reference-card" role="listitem"><small>População</small><strong>IBGE</strong></span>
                <span className="hero-reference-card" role="listitem"><small>Orçamento</small><strong>LOA municipal</strong></span>
                <span className="hero-reference-card" role="listitem"><small>Transporte</small><strong>Tarifa semiurbana · Entorno-DF</strong></span>
              </div>
            )}
          </div>
          <aside className="city-purpose citizen-service-entry" aria-labelledby="city-purpose-title">
            <span className="civic-eyebrow">Serviços públicos</span>
            <h2 id="city-purpose-title">Qual serviço você procura?</h2>
            <p>Encontre o canal oficial para resolver sua necessidade.</p>
            <form onSubmit={findService} className="citizen-service-search">
              <label htmlFor="citizen-service-query">Digite uma necessidade</label>
              <input id="citizen-service-query" type="search" maxLength={160} value={serviceQuery} onChange={event => setServiceQuery(event.target.value)} placeholder="Medicamentos, creche, emprego…" />
              <button type="submit"><Search aria-hidden="true" />Encontrar canal oficial</button>
            </form>
            <p className="citizen-entry-note">O atendimento acontece no órgão responsável. Confira horários, requisitos e disponibilidade no canal oficial.</p>
            <a href="#dados">Pesquisar o catálogo <ArrowRight aria-hidden="true" /></a>
          </aside>
        </div>
      </div>
    </section>
  );
}
