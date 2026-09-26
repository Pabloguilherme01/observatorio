import { ArrowRight, CalendarClock, Database, ExternalLink, Search } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { useCountdown } from '../../hooks/useCountdown';
import { EDITION } from '../../config/version';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { useLanguageMode } from '../../context/LanguageModeContext';

function Timer({ value, compact = false }: { value: ReturnType<typeof useCountdown>; compact?: boolean }) {
  if (value.completed) {
    return <div className="hero-timer-status" role="status">Encerrado</div>;
  }

  const values = [['Dias', value.days], ['Horas', value.hours], ['Min', value.minutes], ['Seg', value.seconds]] as const;
  return (
    <div className={compact ? 'hero-timer-grid compact' : 'hero-timer-grid'} role="timer" aria-label="Contagem regressiva para a votação">
      {values.map(([label, amount]) => (
        <div key={label} className="hero-timer-cell">
          <strong>{String(amount).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
      <span className="sr-only" aria-live="polite">{value.days > 0 ? `Faltam ${value.days} dias.` : 'Falta menos de um dia.'}</span>
    </div>
  );
}

export function HeroCountdown() {
  const election = useCountdown('2026-10-04T08:00:00-03:00');
  const secondRound = useCountdown('2026-10-25T08:00:00-03:00');
  const updatedAt = formatDate(d.meta.updatedAt);
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const summary = mode === 'summary';

  return (
    <section className="hero-shell relative overflow-hidden" aria-labelledby="hero-title">
      <div className="hero-inner mx-auto max-w-7xl">
        <div className="hero-topline">
          <div className="hero-badges">
            <Badge>{technical ? `${EDITION} · dados + método` : 'Dados públicos · fontes rastreáveis'}</Badge>
            {technical && <Badge>Fontes visíveis</Badge>}
          </div>
          <span className="hero-updated"><Database aria-hidden="true" /> Atualizado em {updatedAt}</span>
        </div>

        <div className="hero-layout">
          <div className="hero-copy">
            <span className="hero-kicker">Observatório Eleitoral</span>
            <h1 id="hero-title">Águas Lindas de Goiás <em>2026</em></h1>
            <p>
              {summary
                ? 'Uma visão executiva da cidade: números centrais, serviços e fontes a poucos toques.'
                : technical
                  ? 'Uma camada de auditoria dos dados: origem, método, recortes e limitações visíveis.'
                  : 'Números explicados com contexto suficiente para entender antes de aprofundar.'}
            </p>

            <div className="hero-actions">
              <a href="#descubra" className="hero-action primary">
                Explorar dados <ArrowRight aria-hidden="true" />
              </a>
              <a href="#fontes" className="hero-action secondary">
                Conferir fontes
              </a>
              <button type="button" className="hero-action ghost" onClick={() => window.dispatchEvent(new CustomEvent('observatorio:search'))}>
                <Search aria-hidden="true" /> Buscar
              </button>
            </div>

            {technical && (
              <div className="hero-reference-strip" aria-label="Referências rápidas">
                <span className="hero-reference-card"><small>População</small><strong>IBGE</strong></span>
                <span className="hero-reference-card"><small>Eleitorado</small><strong>TSE</strong></span>
                <span className="hero-reference-card"><small>Transporte</small><strong>Tarifa semiurbana · Entorno-DF</strong></span>
              </div>
            )}
          </div>

          <div className="hero-election-panel">
            <div className="hero-election-card">
              <div className="hero-election-heading">
                <div>
                  <span>Próximo marco</span>
                  <strong>1º turno · 04/10</strong>
                </div>
                <CalendarClock aria-hidden="true" />
              </div>
              <Timer value={election} />
              <a href="https://www.tse.jus.br/eleicoes/eleicoes-2026" target="_blank" rel="noopener noreferrer" className="hero-official-link">
                Calendário oficial do TSE <ExternalLink aria-hidden="true" />
              </a>
            </div>

            {technical && (
              <div className="hero-election-card secondary">
                <div className="hero-election-heading">
                  <div>
                    <span>Se houver segundo turno</span>
                    <strong>25/10</strong>
                  </div>
                  <CalendarClock aria-hidden="true" />
                </div>
                <Timer value={secondRound} compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
