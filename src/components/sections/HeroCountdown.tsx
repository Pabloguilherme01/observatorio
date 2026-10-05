import { ArrowRight, Database, ExternalLink, Search } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { EDITION } from '../../config/version';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { useLanguageMode } from '../../context/LanguageModeContext';

export function HeroCountdown() {
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
          <span className="hero-updated"><Database aria-hidden="true" /> Painel atualizado em {updatedAt}</span>
        </div>
        <div className="hero-layout">
          <div className="hero-copy">
            <span className="hero-kicker">Observatório cívico e eleitoral</span>
            <h1 id="hero-title">Águas Lindas de Goiás <em>2026</em></h1>
            <p>
              {summary
                ? 'Uma visão rápida da cidade e do ciclo eleitoral de 2026, com números centrais e fontes rastreáveis.'
                : technical
                  ? 'Um arquivo auditável do ciclo eleitoral: resultados, fontes, método, recortes e limitações ficam separados e verificáveis.'
                  : guided
                    ? 'Aprenda a ler os resultados e os indicadores sem misturar apuração, contexto municipal, estimativa e dado derivado.'
                    : 'Dados públicos de Águas Lindas organizados para consulta, conferência e fiscalização cívica depois da eleição.'}
            </p>
            <div className="hero-actions">
              <a href="#resultados" className="hero-action primary">Ver resultados <ArrowRight aria-hidden="true" /></a>
              <a href="#fontes" className="hero-action secondary">Conferir fontes</a>
              <button type="button" className="hero-action ghost" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:search'))}>
                <Search aria-hidden="true" /> Buscar
              </button>
            </div>
            {technical && (
              <div className="hero-reference-strip" aria-label="Referências rápidas">
                <span className="hero-reference-card"><small>Resultados</small><strong>TSE</strong></span>
                <span className="hero-reference-card"><small>Eleitorado</small><strong>TSE</strong></span>
                <span className="hero-reference-card"><small>Indicadores municipais</small><strong>IBGE · SINISA · LOA</strong></span>
              </div>
            )}
          </div>
          <div className="hero-election-panel">
            <div className="hero-election-card">
              <div className="hero-election-heading">
                <div>
                  <span>Estado do ciclo</span>
                  <strong>Eleição 2026 · pós-1º turno</strong>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                A contagem regressiva foi retirada da interface pública. A votação de 4 de outubro passa a ser tratada como registro histórico, mantendo a arquitetura preparada para um eventual segundo turno.
              </p>
              <div className="mt-4 grid gap-2 text-xs text-slate-400">
                <span>• Resultados oficiais versionados</span>
                <span>• Proveniência e integridade visíveis</span>
                <span>• Dados municipais separados da apuração</span>
              </div>
              <a href="https://www.tse.jus.br/eleicoes/eleicoes-2026" target="_blank" rel="noopener noreferrer" className="hero-official-link">
                Página oficial das Eleições 2026 <ExternalLink aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
