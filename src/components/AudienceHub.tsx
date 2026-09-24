import { ArrowRight, BarChart3, BookOpen, BusFront, CalendarDays, CheckCircle2, Droplets, ExternalLink, Landmark, Search, ShieldCheck, Users, WalletCards } from 'lucide-react';
import { LanguageModeToggle } from './layout/LanguageModeToggle';
import { useLanguageMode } from '../context/LanguageModeContext';

type Topic = {
  id: string;
  label: string;
  simple: string;
  icon: typeof BarChart3;
};

const topics: readonly Topic[] = [
  { id: 'dashboard', label: 'Cidade', simple: 'População, território e indicadores.', icon: BarChart3 },
  { id: 'eleitorado', label: 'Eleitorado', simple: 'Perfil, participação e histórico.', icon: Users },
  { id: 'orcamento', label: 'Orçamento', simple: 'Planejamento e funções públicas.', icon: WalletCards },
  { id: 'transporte', label: 'Transporte', simple: 'Tarifas e custo do trajeto.', icon: BusFront },
  { id: 'saude', label: 'Serviços', simple: 'Água, esgoto e capacidade de saúde.', icon: Droplets },
  { id: 'eleitoral360', label: 'Eleitoral', simple: 'Candidaturas, pesquisa e registros.', icon: Landmark },
];

const links = [
  { label: 'TSE · Candidatos 2026', href: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026', note: 'Base pública de candidaturas', icon: ShieldCheck },
  { label: 'DivulgaCandContas', href: 'https://divulgacandcontas.tse.jus.br/divulga/#/', note: 'Candidaturas e contas', icon: Search },
  { label: 'IBGE · Águas Lindas', href: 'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html', note: 'População e indicadores', icon: BarChart3 },
  { label: 'Portal municipal', href: 'https://aguaslindasdegoias.go.gov.br/', note: 'Serviços e informações', icon: BookOpen },
] as const;

export function AudienceHub() {
  const { mode } = useLanguageMode();
  const isTechnical = mode === 'technical';
  const isSummary = mode === 'summary';

  const jump = (id: string) => {
    window.history.replaceState(null, '', '#' + id);
    window.dispatchEvent(new CustomEvent('observatorio:navigate', { detail: id }));
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <section id="descubra" className="audience-home mx-auto max-w-7xl px-4 py-7 sm:px-6" aria-labelledby="audience-title">
      <div className="audience-mode-mobile" aria-label="Modo de leitura">
        <LanguageModeToggle />
      </div>

      <div className="audience-intro">
        <div className="min-w-0">
          <span className="audience-kicker"><CheckCircle2 aria-hidden="true" /> Observatório · Águas Lindas de Goiás</span>
          <h2 id="audience-title">
            {isSummary ? 'Comece pelo que importa.' : isTechnical ? 'Explore dados, fontes e método.' : 'Entenda a cidade em poucos toques.'}
          </h2>
          <p>
            {isSummary
              ? 'Os números essenciais aparecem primeiro. O detalhe fica a um toque.'
              : isTechnical
                ? 'Indicadores, snapshots, fontes e limitações ficam organizados por assunto.'
                : 'Encontre um dado, confira a fonte e abra o contexto quando precisar.'}
          </p>
        </div>

        <div className="audience-hero-actions">
          <button type="button" className="audience-search" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))}>
            <Search aria-hidden="true" />
            <span>Buscar qualquer assunto</span>
            <kbd>⌘K</kbd>
          </button>
          <button type="button" className="audience-primary-action" onClick={() => jump(isSummary ? 'resumo' : 'dashboard')}>
            {isSummary ? 'Abrir resumo' : 'Começar agora'}
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="audience-section-heading">
        <div>
          <span>Atalhos</span>
          <h3>{isTechnical ? 'Investigue por assunto' : 'O que você quer saber?'}</h3>
        </div>
        <button type="button" onClick={() => jump(isTechnical ? 'fontes' : 'dados')}>{isTechnical ? 'Ver fontes' : 'Ver dados'} <ArrowRight aria-hidden="true" /></button>
      </div>

      <div className="audience-topic-grid" aria-label="Principais áreas">
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
      </div>

      <div className="audience-action-grid" aria-label="Ferramentas rápidas">
        <button type="button" className="audience-action-card audience-action-featured" onClick={() => jump('quiz')}>
          <span className="audience-action-icon">?</span>
          <span><strong>Quiz atualizado</strong><small>18 questões com fonte e explicação.</small></span>
          <ArrowRight aria-hidden="true" />
        </button>

        <button type="button" className="audience-action-card" onClick={() => jump('eleitoral360')}>
          <span className="audience-action-icon"><Landmark aria-hidden="true" /></span>
          <span><strong>Eleitoral 360°</strong><small>Eleitorado, recortes e snapshots.</small></span>
          <ArrowRight aria-hidden="true" />
        </button>

        <button type="button" className="audience-action-card" onClick={() => jump('dados')}>
          <span className="audience-action-icon"><CalendarDays aria-hidden="true" /></span>
          <span><strong>O que mudou?</strong><small>Atualizações e recortes recentes.</small></span>
          <ArrowRight aria-hidden="true" />
        </button>
      </div>

      <div className="audience-links">
        <div className="audience-links-head">
          <div>
            <span className="audience-kicker">Conferência rápida</span>
            <h3>Fontes oficiais</h3>
          </div>
          <button type="button" onClick={() => jump('fontes')}>Mapa completo <ArrowRight aria-hidden="true" /></button>
        </div>

        <div className="audience-links-grid">
          {links.map(({ label, href, note, icon: Icon }) => (
            <a key={href} href={href} target="_blank" rel="noreferrer" className="audience-link">
              <span className="audience-link-icon"><Icon aria-hidden="true" /></span>
              <span><strong>{label}</strong><small>{note}</small></span>
              <ExternalLink aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
