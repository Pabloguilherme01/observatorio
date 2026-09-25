import { ArrowRight, BarChart3, BookOpen, BusFront, Database, ExternalLink, FileCheck2, Landmark, Search, ShieldCheck, Users, Vote, WalletCards, Droplets } from 'lucide-react';
import { useLanguageMode } from '../context/LanguageModeContext';

type Topic = {
  id: string;
  label: string;
  description: string;
  icon: typeof BarChart3;
};

const topics: readonly Topic[] = [
  { id: 'dashboard', label: 'Cidade', description: 'População e indicadores.', icon: BarChart3 },
  { id: 'eleitorado', label: 'Eleitorado', description: 'Perfil e dados eleitorais.', icon: Users },
  { id: 'orcamento', label: 'Orçamento', description: 'Planejamento e dinheiro público.', icon: WalletCards },
  { id: 'transporte', label: 'Transporte', description: 'Tarifa e impacto do deslocamento.', icon: BusFront },
  { id: 'acao', label: 'Serviços', description: 'Canais públicos e atendimento.', icon: Droplets },
  { id: 'eleitoral360', label: 'Eleições', description: 'Candidaturas, pesquisas e registros.', icon: Landmark },
];

const officialResources = [
  { label: 'Resultados 2026', href: 'https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados', note: 'Divulgação oficial', icon: Vote },
  { label: 'Simulador da urna', href: 'https://www.justicaeleitoral.jus.br/simulador-votacao/', note: 'Treine a votação', icon: FileCheck2 },
  { label: 'Regras para votar', href: 'https://www.tse.jus.br/eleicoes/eleicoes-2026', note: 'Orientações do TSE', icon: ShieldCheck },
  { label: 'Estatísticas eleitorais', href: 'https://www.tse.jus.br/eleicoes/estatisticas', note: 'Séries oficiais', icon: Database },
] as const;

const technicalLinks = [
  { label: 'TSE · Candidatos 2026', href: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026', note: 'Base pública', icon: ShieldCheck },
  { label: 'DivulgaCandContas', href: 'https://divulgacandcontas.tse.jus.br/divulga/#/', note: 'Candidaturas e contas', icon: Search },
  { label: 'IBGE · Águas Lindas', href: 'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html', note: 'População e indicadores', icon: BarChart3 },
  { label: 'Portal municipal', href: 'https://aguaslindasdegoias.go.gov.br/', note: 'Serviços municipais', icon: BookOpen },
] as const;

export function AudienceHub() {
  const { mode } = useLanguageMode();
  const isTechnical = mode === 'technical';
  const isSummary = mode === 'summary';

  const jump = (id: string) => {
    window.history.replaceState(null, '', '#' + id);
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
  };

  return (
    <section id="descubra" className="audience-home mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12" aria-labelledby="audience-title">
      <div className="audience-page-card">
        <header className="audience-intro">
          <div className="audience-intro-copy">
            <span className="audience-kicker">Navegue sem se perder</span>
            <h2 id="audience-title">
              {isSummary ? 'O essencial, primeiro.' : isTechnical ? 'Explore e confira.' : 'Entenda e explore.'}
            </h2>
            <p>
              {isSummary
                ? 'Poucos caminhos, sem excesso. Abra um tema, leia os números e avance quando precisar.'
                : isTechnical
                  ? 'Cada caminho leva a dados, fontes, métodos ou registros que podem ser conferidos.'
                  : 'Escolha um assunto. O restante da leitura fica organizado em blocos curtos e comparáveis.'}
            </p>
          </div>

          <div className="audience-intro-actions">
            <button type="button" className="audience-search-card" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:search'))}>
              <Search aria-hidden="true" />
              <span>
                <strong>Buscar</strong>
                <small>um dado ou assunto</small>
              </span>
              <kbd>⌘K</kbd>
            </button>
            <button type="button" className="audience-primary-card" onClick={() => jump(isSummary ? 'resumo' : 'dashboard')}>
              <span>{isSummary ? 'Abrir resumo' : isTechnical ? 'Abrir dados' : 'Começar a explorar'}</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </header>

        {!isSummary && (
          <section className="audience-block" aria-labelledby="topics-title">
            <div className="audience-block-head">
              <div>
                <span>01</span>
                <h3 id="topics-title">Escolha um assunto</h3>
              </div>
              <p>Seis caminhos principais. Sem menu escondido.</p>
            </div>
            <div className="audience-topic-grid">
              {topics.map(({ id, label, description, icon: Icon }) => (
                <button key={id} type="button" onClick={() => jump(id)} className="audience-topic">
                  <span className="audience-topic-icon"><Icon aria-hidden="true" /></span>
                  <span className="audience-topic-copy">
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="audience-block audience-actions-block" aria-labelledby="actions-title">
          <div className="audience-block-head">
            <div>
              <span>{isSummary ? '02' : '02'}</span>
              <h3 id="actions-title">{isSummary ? 'Ações úteis' : 'Ferramentas para continuar'}</h3>
            </div>
            <p>{isSummary ? 'Faça algo com o que acabou de ler.' : 'Atalhos que realmente levam a uma ação.'}</p>
          </div>

          <div className="audience-action-grid">
            {isSummary ? (
              <>
                <button type="button" className="audience-action-card audience-action-featured" onClick={() => jump('acao')}>
                  <span className="audience-action-icon"><BookOpen aria-hidden="true" /></span>
                  <span><strong>Serviços públicos</strong><small>Canais oficiais, saúde e atendimento.</small></span>
                  <ArrowRight aria-hidden="true" />
                </button>
                <button type="button" className="audience-action-card" onClick={() => jump('dashboard')}>
                  <span className="audience-action-icon"><BarChart3 aria-hidden="true" /></span>
                  <span><strong>Ver indicadores</strong><small>Abra a leitura completa dos números.</small></span>
                  <ArrowRight aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <button type="button" className="audience-action-card audience-action-featured" onClick={() => jump('quiz')}>
                  <span className="audience-action-icon">?</span>
                  <span><strong>Quiz · 200 perguntas</strong><small>5 níveis para aprender brincando.</small></span>
                  <ArrowRight aria-hidden="true" />
                </button>
                <button type="button" className="audience-action-card" onClick={() => jump('eleitoral360')}>
                  <span className="audience-action-icon"><Landmark aria-hidden="true" /></span>
                  <span><strong>Eleitoral 360°</strong><small>Registros e informações eleitorais.</small></span>
                  <ArrowRight aria-hidden="true" />
                </button>
                <button type="button" className="audience-action-card" onClick={() => jump('transporte')}>
                  <span className="audience-action-icon">R$</span>
                  <span><strong>Simulador de transporte</strong><small>Teste o impacto da tarifa.</small></span>
                  <ArrowRight aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </section>

        {!isTechnical && (
          <section className="audience-block audience-resource-block" aria-labelledby="official-title">
            <div className="audience-block-head">
              <div>
                <span>03</span>
                <h3 id="official-title">Recursos oficiais</h3>
              </div>
              <button type="button" onClick={() => jump('fontes')}>
                Ver todas as fontes <ArrowRight aria-hidden="true" />
              </button>
            </div>
            <div className="audience-resource-grid">
              {officialResources.map(({ label, href, note, icon: Icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="audience-resource">
                  <span className="audience-link-icon"><Icon aria-hidden="true" /></span>
                  <span className="audience-resource-copy"><strong>{label}</strong><small>{note}</small></span>
                  <ExternalLink aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
        )}

        {isTechnical && (
          <section className="audience-block audience-resource-block" aria-labelledby="technical-title">
            <div className="audience-block-head">
              <div>
                <span>03</span>
                <h3 id="technical-title">Conferência técnica</h3>
              </div>
              <button type="button" onClick={() => jump('fontes')}>
                Abrir evidências <ArrowRight aria-hidden="true" />
              </button>
            </div>
            <div className="audience-resource-grid">
              {technicalLinks.map(({ label, href, note, icon: Icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="audience-resource">
                  <span className="audience-link-icon"><Icon aria-hidden="true" /></span>
                  <span className="audience-resource-copy"><strong>{label}</strong><small>{note}</small></span>
                  <ExternalLink aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
