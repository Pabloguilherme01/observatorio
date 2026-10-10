import { ArrowRight, Database, ExternalLink, Search } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { EDITION } from '../../config/version';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function PostElectionHero() {
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
            {technical && <Badge>Resultados consolidados</Badge>}
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
                  ? 'Uma visão completa do ciclo eleitoral, com resultados oficiais e fontes para quem quiser conferir cada detalhe.'
                  : guided
                    ? 'Entenda os resultados e os números da cidade passo a passo, sem precisar conhecer termos técnicos.'
                    : 'Dados públicos de Águas Lindas organizados para você consultar, entender e conferir depois da eleição.'}
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
                <span className="hero-reference-card" role="listitem"><small>Eleitorado</small><strong>TSE</strong></span>
                <span className="hero-reference-card" role="listitem"><small>Transporte</small><strong>Tarifa semiurbana · Entorno-DF</strong></span>
              </div>
            )}
          </div>
          <div className="hero-election-panel">
            <div className="hero-election-card">
              <div className="hero-election-heading">
                <div>
                  <span>Estado do ciclo</span>
                  <strong>Eleição 2026 · resultado de Goiás definido no 1º turno</strong>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                O resultado do 1º turno de 4 de outubro já faz parte do histórico. Em Goiás, o governo estadual foi definido no 1º turno. Se houver 2º turno para outros cargos, o Observatório tratará essa nova apuração separadamente.
              </p>
              <div className="mt-4 grid gap-2 text-xs text-slate-400">
                <span>• Registro histórico do 1º turno</span>
                <span>• Fonte oficial identificada</span>
                <span>• Dados da cidade separados do resultado eleitoral</span>
              </div>
              <a href="https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/daniel-vilela-mdb-e-eleito-governador-de-goias-no-1o-turno" target="_blank" rel="noopener noreferrer" className="hero-official-link">
                TSE · resultado de Goiás no 1º turno <ExternalLink aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
