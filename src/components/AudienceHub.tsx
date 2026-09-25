import { ArrowRight, BarChart3, BookOpen, BusFront, CalendarDays, CheckCircle2, Droplets, ExternalLink, Landmark, Search, ShieldCheck, Users, WalletCards, Vote, FileCheck2, Database } from 'lucide-react';
import { useLanguageMode } from '../context/LanguageModeContext';

type Topic = {
  id: string;
  label: string;
  simple: string;
  icon: typeof BarChart3;
};

const topics: readonly Topic[] = [
  { id: 'dashboard', label: 'Cidade', simple: 'População, território e indicadores.', icon: BarChart3 },
  { id: 'eleitorado', label: 'Eleitorado', simple: 'Perfil, evolução e dados de 2026.', icon: Users },
  { id: 'orcamento', label: 'Orçamento', simple: 'Receitas, despesas e planejamento público.', icon: WalletCards },
  { id: 'transporte', label: 'Transporte', simple: 'Tarifas e custo relativo do deslocamento.', icon: BusFront },
  { id: 'saude', label: 'Serviços', simple: 'Água, esgoto, saúde e capacidade de atendimento.', icon: Droplets },
  { id: 'eleitoral360', label: 'Eleitoral', simple: 'Candidaturas, pesquisas, contas e registros.', icon: Landmark },
];

const officialResources = [
  { label: 'Resultados 2026', href: 'https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados', note: 'Informações oficiais sobre divulgação', icon: Vote },
  { label: 'Simulador da urna', href: 'https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/simulador-da-urna-eletronica-supera-205-mil-acessos-e-recebe-melhorias', note: 'Treine a navegação da votação', icon: FileCheck2 },
  { label: 'Regras para votar', href: 'https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/por-dentro-das-eleicoes-confira-as-regras-para-o-dia-da-votacao', note: 'Orientações oficiais para o dia da votação', icon: ShieldCheck },
  { label: 'Estatísticas eleitorais', href: 'https://www.tse.jus.br/eleicoes/estatisticas', note: 'Dados e séries oficiais do TSE', icon: Database },
] as const;

const technicalLinks = [
  { label: 'TSE · Candidatos 2026', href: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026', note: 'Base pública de candidaturas', icon: ShieldCheck },
  { label: 'DivulgaCandContas', href: 'https://divulgacandcontas.tse.jus.br/divulga/#/', note: 'Candidaturas e contas', icon: Search },
  { label: 'IBGE · Águas Lindas', href: 'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html', note: 'População e indicadores', icon: BarChart3 },
  { label: 'Portal municipal', href: 'https://aguaslindasdegoias.go.gov.br/', note: 'Serviços e informações', icon: BookOpen },
] as const;

export function AudienceHub() {
  const { mode } = useLanguageMode();
  const isTechnical = mode === 'technical';
  const isSummary = mode === 'summary';
  const isSimple = mode === 'simple';

  const jump = (id: string) => {
    window.history.replaceState(null, '', '#' + id);
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <section id="descubra" className="audience-home mx-auto max-w-7xl px-4 py-7 sm:px-6" aria-labelledby="audience-title">
      <div className="audience-intro">
        <div className="min-w-0">
          <span className={`audience-kicker audience-mode-kicker mode-${mode}`}><CheckCircle2 aria-hidden="true" /> {isSummary ? 'Resumo · essencial' : isSimple ? 'Simples · claro' : 'Técnico · evidências'}</span>
          <h2 id="audience-title">
            {isSummary ? 'O essencial em poucos dados.' : isTechnical ? 'Explore dados, fontes e método.' : 'Entenda os dados sem jargão.'}
          </h2>
          <p>
            {isSummary
              ? 'Poucos números, leitura rápida e ações essenciais. Detalhes ficam fora deste modo.'
              : isTechnical
                ? 'Indicadores, fontes, recortes, cálculos e limitações ficam organizados para conferência.'
                : 'Indicadores claros, comparações e contexto para entender o que os números significam.'}
          </p>
        </div>

        <div className="audience-hero-actions">
          <button type="button" className="audience-search" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))}>
            <Search aria-hidden="true" />
            <span>Buscar um assunto</span>
            <kbd>⌘K</kbd>
          </button>
          <button type="button" className="audience-primary-action" onClick={() => jump(isSummary ? 'resumo' : 'dashboard')}>
            {isSummary ? 'Abrir resumo' : isTechnical ? 'Abrir dados' : 'Explorar dados'}
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`audience-section-heading audience-mode-section mode-${mode}`}>
        <div>
          <span>Atalhos</span>
          <h3>{isSummary ? 'Acesso rápido' : isTechnical ? 'Explore por evidência' : 'Escolha um assunto'}</h3>
        </div>
        <button type="button" onClick={() => jump(isTechnical ? 'fontes' : 'dados')}>
          {isSummary ? 'Ver resumo' : isTechnical ? 'Abrir evidências' : 'Ver dados'} <ArrowRight aria-hidden="true" />
        </button>
      </div>

      {!isSummary && <div className="audience-topic-grid" aria-label="Principais áreas">
        {topics.map(({ id, label, simple, icon: Icon }) => (
          <button key={id} type="button" onClick={() => jump(id)} className="audience-topic">
            <span className="audience-topic-icon"><Icon aria-hidden="true" /></span>
            <span className="audience-topic-copy">
              <strong>{label}</strong>
              <small>{simple}</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>}

      {!isSummary && <div className="audience-action-grid" aria-label="Ferramentas rápidas">
        <button type="button" className="audience-action-card audience-action-featured" onClick={() => jump('quiz')}>
          <span className="audience-action-icon">?</span>
          <span><strong>Quiz · 200 perguntas</strong><small>5 níveis · 40 perguntas por fase.</small></span>
          <ArrowRight aria-hidden="true" />
        </button>

        <button type="button" className="audience-action-card" onClick={() => jump('eleitoral360')}>
          <span className="audience-action-icon"><Landmark aria-hidden="true" /></span>
          <span><strong>Eleitoral 360°</strong><small>Eleitorado, candidaturas, contas e pesquisas.</small></span>
          <ArrowRight aria-hidden="true" />
        </button>

        <button type="button" className="audience-action-card" onClick={() => jump('dados')}>
          <span className="audience-action-icon"><CalendarDays aria-hidden="true" /></span>
          <span><strong>Atualizações</strong><small>Mudanças recentes, novos dados e fontes.</small></span>
          <ArrowRight aria-hidden="true" />
        </button>
      </div>}

      {!isTechnical && (
        <div className="audience-resources" aria-label="Recursos oficiais">
          <div className="audience-links-head">
            <div>
              <span className="audience-kicker">Recursos oficiais</span>
              <h3>Fontes oficiais</h3>
            </div>
            <button type="button" onClick={() => jump('fontes')}>Ver fontes <ArrowRight aria-hidden="true" /></button>
          </div>
          <div className="audience-resource-grid">
            {officialResources.map(({ label, href, note, icon: Icon }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" className="audience-resource">
                <span className="audience-link-icon"><Icon aria-hidden="true" /></span>
                <span><strong>{label}</strong><small>{note}</small></span>
                <ExternalLink aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      )}

      {isTechnical && (
        <div className="audience-links">
          <div className="audience-links-head">
            <div>
              <span className="audience-kicker">Conferência rápida</span>
              <h3>Fontes oficiais</h3>
            </div>
            <button type="button" onClick={() => jump('fontes')}>Abrir evidências <ArrowRight aria-hidden="true" /></button>
          </div>
          <div className="audience-links-grid">
            {technicalLinks.map(({ label, href, note, icon: Icon }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" className="audience-link">
                <span className="audience-link-icon"><Icon aria-hidden="true" /></span>
                <span><strong>{label}</strong><small>{note}</small></span>
                <ExternalLink aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
