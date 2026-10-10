import { ArrowRight, Database, Search } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { EDITION } from '../../config/version';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function MunicipalHero() {
  const updatedAt = formatDate(d.meta.updatedAt);
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const guided = mode === 'guided';
  const summary = mode === 'summary';

  return (
    <section className="hero-shell relative overflow-hidden" aria-labelledby="hero-title">
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
            <h1 id="hero-title">Sua cidade.<br />Dados para <em>participar.</em></h1>
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
          <aside className="city-purpose" aria-labelledby="city-purpose-title">
            <span className="civic-eyebrow">O propósito do Observatório</span>
            <h2 id="city-purpose-title">Informação que ajuda no dia a dia.</h2>
            <p>Um ponto de partida para entender Águas Lindas e encontrar informações públicas verificáveis.</p>
            <ol>
              <li><strong>Consulte um assunto</strong><span>Serviços, mobilidade, saúde, saneamento e orçamento.</span></li>
              <li><strong>Confira o período e a fonte</strong><span>Estimativa, planejamento e execução têm significados diferentes.</span></li>
              <li><strong>Continue no canal responsável</strong><span>Use o órgão oficial para atendimento e informações atualizadas.</span></li>
            </ol>
            <a href="#dados">Pesquisar o catálogo <ArrowRight aria-hidden="true" /></a>
          </aside>
        </div>
      </div>
    </section>
  );
}
