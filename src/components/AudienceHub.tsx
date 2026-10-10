import { ArrowRight, BarChart3, BusFront, HeartHandshake, Droplets, Search, ShieldCheck, WalletCards } from 'lucide-react';
import { navigateToCleanSection } from '../lib/sectionNavigation';

const topics = [
  { id: 'dashboard', label: 'Entender a cidade', description: 'População, território e mudanças nos indicadores.', icon: BarChart3 },
  { id: 'acao', label: 'Encontrar um serviço', description: 'Medicamentos, creches, assistência e canais oficiais.', icon: HeartHandshake },
  { id: 'orcamento', label: 'Acompanhar o dinheiro público', description: 'O que foi planejado e onde consultar os gastos.', icon: WalletCards },
  { id: 'transporte', label: 'Calcular meu transporte', description: 'Simule o custo mensal por rota, viagens e pessoas.', icon: BusFront },
  { id: 'saude', label: 'Entender saúde e saneamento', description: 'Água, esgoto, resíduos e capacidade de atendimento.', icon: Droplets },
  { id: 'dados', label: 'Pesquisar e conferir dados', description: 'Catálogo de indicadores com referência e fonte.', icon: ShieldCheck },
] as const;

export function AudienceHub() {
  return (
    <section id="descubra" className="civic-topic-hub mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-labelledby="audience-title">
      <div className="civic-section-heading">
        <div>
          <span className="civic-eyebrow">Seu ponto de partida</span>
          <h2 id="audience-title">O que você precisa saber?</h2>
          <p>Escolha uma necessidade. Os dados e os canais oficiais ficam no mesmo caminho.</p>
        </div>
        <button type="button" className="civic-search-button" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:search'))}>
          <Search aria-hidden="true" /> Buscar um dado ou assunto <kbd>Ctrl/⌘ K</kbd>
        </button>
      </div>
      <div className="civic-topic-grid">
        {topics.map(({ id, label, description, icon: Icon }) => (
          <a key={id} href={'#' + id} className="civic-topic-card" onClick={event => { event.preventDefault(); navigateToCleanSection(id); }}>
            <Icon className="civic-topic-icon" aria-hidden="true" />
            <div><h3>{label}</h3><p>{description}</p></div>
            <ArrowRight aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
