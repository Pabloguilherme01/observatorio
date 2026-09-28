import { ExternalLink } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { observatorioData as d } from '../../data/observatorioData';
import { formatDate } from '../../utils/formatters';

function natureLabel(nature: string) {
  if (nature === 'official') return 'Fonte oficial';
  if (nature === 'secondary') return 'Fonte secundária';
  return 'Fonte registrada';
}

export function EvidenceMap() {
  const { mode } = useLanguageMode();

  // Resumo e Explicado já recebem proveniência nos próprios indicadores.
  // O mapa completo é uma ferramenta de auditoria e fica reservado ao Detalhado.
  if (mode !== 'technical') return null;

  return (
    <section id="mapa-evidencias" className="evidence-map-tech mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="fontes-title">
      <div className="evidence-tech-head">
        <div>
          <span className="quiz-eyebrow">Detalhado · rastreabilidade</span>
          <h2 id="fontes-title">Mapa de evidências</h2>
          <p>Mini cards para auditoria rápida. Abra a fonte original quando precisar conferir o dado, a data e a natureza do registro.</p>
        </div>
        <span className="evidence-tech-count">{d.sources.length} fontes</span>
      </div>

      <div className="evidence-mini-grid">
        {d.sources.map(source => {
          const displayedDate = source.referenceDate ?? source.publishedAt;
          const displayedDateLabel = source.referenceDate ? 'ref.' : source.publishedAt ? 'publ.' : 'data';
          return (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="evidence-mini-card"
            title={'Abrir fonte: ' + source.label}
            aria-label={`Abrir fonte externa: ${source.label} — ${source.institution}`}
          >
            <div className="evidence-mini-top">
              <span>{natureLabel(source.nature)}</span>
              <ExternalLink aria-hidden="true" />
            </div>
            <strong>{source.label}</strong>
            <small>{source.institution}</small>
            <div className="evidence-mini-meta">
              <span>{displayedDate ? `${displayedDateLabel} ${formatDate(displayedDate)}` : 'data não registrada'}</span>
              <span>abrir fonte</span>
            </div>
          </a>
          );
        })}
      </div>
    </section>
  );
}
