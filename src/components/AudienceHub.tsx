import { ArrowRight, BarChart3, BookOpen, BusFront, Droplets, ExternalLink, Landmark, Search, ShieldCheck, Users, WalletCards } from 'lucide-react';
import { CandidatesPanel } from './CandidatesPanel';

type Topic = { id:string; label:string; simple:string; icon:typeof BarChart3 };
const topics: Topic[] = [
  { id:'dashboard', label:'Cidade', simple:'População, território e indicadores essenciais.', icon:BarChart3 },
  { id:'eleitorado', label:'Eleitorado', simple:'Perfil, série histórica e contexto eleitoral.', icon:Users },
  { id:'orcamento', label:'Orçamento', simple:'Planejamento, funções e impacto por habitante.', icon:WalletCards },
  { id:'transporte', label:'Transporte', simple:'Tarifas, custos e cálculo personalizado.', icon:BusFront },
  { id:'saude', label:'Saneamento', simple:'Água, esgoto, cobertura e limites do dado.', icon:Droplets },
  { id:'politica', label:'Eleições', simple:'Candidaturas, pesquisas e registros documentais.', icon:Landmark },
];

const links = [
  { label:'TSE · Candidatos 2026', href:'https://dadosabertos.tse.jus.br/dataset/candidatos-2026', note:'Cadastro, bens, redes e fotos', icon:ShieldCheck },
  { label:'TSE · DivulgaCandContas', href:'https://divulgacandcontas.tse.jus.br/divulga/#/', note:'Consulta oficial de candidaturas e contas', icon:Search },
  { label:'IBGE · Águas Lindas', href:'https://www.ibge.gov.br/cidades-e-estados/go/aguas-lindas-de-goias.html', note:'População e indicadores municipais', icon:BarChart3 },
  { label:'Portal municipal', href:'https://aguaslindasdegoias.go.gov.br/', note:'Serviços e informações da Prefeitura', icon:BookOpen },
];

const topicTargets: Record<string,string> = Object.fromEntries(topics.map(topic => [topic.id, topic.id]));

export function AudienceHub() {
  const go = (id:string) => {
    const target = topicTargets[id] ?? id;
    window.history.replaceState(null,'','#'+target);
    window.dispatchEvent(new CustomEvent('observatorio:navigate',{detail:target}));
    requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({behavior:'smooth',block:'start'}));
  };

  return (
    <section id="descubra" className="audience-home mx-auto max-w-7xl px-4 py-7 sm:px-6">
      <div className="audience-intro">
        <div>
          <span className="audience-kicker">Observatório · Águas Lindas de Goiás</span>
          <h2>Encontre o que precisa em poucos toques.</h2>
          <p>Dados públicos, contexto e fontes organizados para consulta rápida. Sem ranking e sem previsão eleitoral.</p>
        </div>
        <button type="button" className="audience-search" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))}>
          <Search aria-hidden="true" /><span>Buscar no observatório</span><kbd>⌘K</kbd>
        </button>
      </div>

      <div className="audience-topic-grid" aria-label="Principais áreas">
        {topics.map(({id,label,simple,icon:Icon}) => (
          <button key={id} type="button" onClick={() => go(id)} className="audience-topic">
            <span className="audience-topic-icon"><Icon aria-hidden="true" /></span>
            <span className="audience-topic-copy"><strong>{label}</strong><small>{simple}</small></span>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="audience-utility-grid">
        <article className="audience-utility-card audience-quiz-card">
          <div><span className="audience-utility-icon">?</span><div><strong>Aprenda em 2 minutos</strong><p>Quiz atualizado sobre leitura de dados públicos.</p></div></div>
          <button type="button" onClick={() => go('quiz')}>Começar quiz <ArrowRight aria-hidden="true" /></button>
        </article>
        <article className="audience-utility-card">
          <div><span className="audience-utility-icon"><BookOpen aria-hidden="true" /></span><div><strong>Dados sem complicação</strong><p>Veja o número, a fonte, a data e o que ele realmente significa.</p></div></div>
          <button type="button" onClick={() => go('fontes')}>Ver fontes <ArrowRight aria-hidden="true" /></button>
        </article>
      </div>

      <div className="audience-links">
        <div className="audience-links-head"><div><span className="audience-kicker">Conferência rápida</span><h3>Fontes oficiais</h3></div><a href="#fontes">Mapa completo <ArrowRight aria-hidden="true" /></a></div>
        <div className="audience-links-grid">
          {links.map(({label,href,note,icon:Icon}) => (
            <a key={href} href={href} target="_blank" rel="noreferrer" className="audience-link">
              <span className="audience-link-icon"><Icon aria-hidden="true" /></span>
              <span><strong>{label}</strong><small>{note}</small></span>
              <ExternalLink aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <div id="politica" className="mt-7 scroll-mt-24"><CandidatesPanel /></div>
    </section>
  );
}
