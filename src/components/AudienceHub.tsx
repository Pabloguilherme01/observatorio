import { ArrowRight, BarChart3, BookOpen, BusFront, CalendarDays, CheckCircle2, Droplets, ExternalLink, Landmark, Search, ShieldCheck, Users, WalletCards } from 'lucide-react';
import { CandidatesPanel } from './CandidatesPanel';
import { LanguageModeToggle } from './layout/LanguageModeToggle';
import { useLanguageMode } from '../context/LanguageModeContext';

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
  const { mode } = useLanguageMode();
  const isTechnical = mode === 'technical';
  const isSummary = mode === 'summary';
  const jump = (id:string) => {
    window.history.replaceState(null,'','#'+id);
    window.dispatchEvent(new CustomEvent('observatorio:navigate',{detail:id}));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}));
  };
  return (
    <section id="descubra" className="audience-home mx-auto max-w-7xl px-4 py-7 sm:px-6" aria-labelledby="audience-title">
      <div className="audience-mode-mobile" aria-label="Modo de leitura"><LanguageModeToggle /></div>
      <div className="audience-intro">
        <div>
          <span className="audience-kicker"><CheckCircle2 aria-hidden="true" /> Observatório · Águas Lindas de Goiás</span>
          <h2 id="audience-title">{isSummary ? 'Tudo o que importa, sem complicação.' : isTechnical ? 'Dados, fontes e rastreabilidade em um só lugar.' : 'Entenda a cidade e as eleições em poucos toques.'}</h2>
          <p>{isSummary ? 'Comece pelos números essenciais. Abra o detalhe somente quando precisar.' : isTechnical ? 'Consulte indicadores, fontes, método, snapshots e evidências sem misturar fato, cálculo e interpretação.' : 'Um painel público para encontrar dados úteis, conferir a fonte e explorar o contexto.'}</p>
        </div>
        <div className="audience-hero-actions">
          <button type="button" className="audience-search" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:command'))}><Search aria-hidden="true" /><span>Buscar qualquer assunto</span><kbd>⌘K</kbd></button>
          <button type="button" className="audience-primary-action" onClick={() => jump(isSummary ? 'resumo' : 'dashboard')}>{isSummary ? 'Ver resumo' : 'Começar agora'} <ArrowRight aria-hidden="true" /></button>
        </div>
      </div>
      <div className="audience-section-heading"><div><span>Atalhos</span><h3>{isTechnical ? 'Investigue por assunto' : 'O que você quer saber?'}</h3></div><button type="button" onClick={() => jump('fontes')}>Ver fontes <ArrowRight aria-hidden="true" /></button></div>
      <div className="audience-topic-grid" aria-label="Principais áreas">
        {topics.map(({id,label,simple,icon:Icon}) => <button key={id} type="button" onClick={() => jump(id)} className="audience-topic"><span className="audience-topic-icon"><Icon aria-hidden="true" /></span><span className="audience-topic-copy"><strong>{label}</strong><small>{simple}</small></span><ArrowRight aria-hidden="true" /></button>)}
      </div>
      <div className="audience-action-grid">
        <button type="button" className="audience-action-card audience-action-featured" onClick={() => jump('quiz')}><span className="audience-action-icon">?</span><span><strong>Quiz atualizado</strong><small>15 perguntas com fontes e explicações.</small></span><ArrowRight aria-hidden="true" /></button>
        <button type="button" className="audience-action-card" onClick={() => jump('eleitoral360')}><span className="audience-action-icon"><Landmark aria-hidden="true" /></span><span><strong>Eleitoral 360°</strong><small>Registros, snapshots e contexto.</small></span><ArrowRight aria-hidden="true" /></button>
        <button type="button" className="audience-action-card" onClick={() => jump('dados')}><span className="audience-action-icon"><CalendarDays aria-hidden="true" /></span><span><strong>O que mudou?</strong><small>Atualizações e recortes recentes.</small></span><ArrowRight aria-hidden="true" /></button>
      </div>
      <div className="audience-links">
        <div className="audience-links-head"><div><span className="audience-kicker">Conferência rápida</span><h3>Fontes oficiais</h3></div><button type="button" onClick={() => jump('fontes')}>Mapa completo <ArrowRight aria-hidden="true" /></button></div>
        <div className="audience-links-grid">
          {links.map(({label,href,note,icon:Icon}) => <a key={href} href={href} target="_blank" rel="noreferrer" className="audience-link"><span className="audience-link-icon"><Icon aria-hidden="true" /></span><span><strong>{label}</strong><small>{note}</small></span><ExternalLink aria-hidden="true" /></a>)}
        </div>
      </div>
      <div id="politica" className="audience-candidates mt-7 scroll-mt-24"><CandidatesPanel /></div>
    </section>
  );
}
