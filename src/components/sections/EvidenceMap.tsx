import { ExternalLink } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { SectionHeader } from '../ui/SectionHeader';
import { formatDate } from '../../utils/formatters';

function natureLabel(nature: string) {
  if (nature === 'official') return 'Fonte oficial';
  if (nature === 'secondary') return 'Fonte secundária';
  return 'Fonte registrada';
}

function dateLabel(value: string | undefined) {
  return value ? formatDate(value) : 'Data de referência não registrada';
}

export function EvidenceMap() {
  return (
    <section id="fontes" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="fontes-title">
      <SectionHeader
        titleId="fontes-title"
        eyebrow="Rastreabilidade"
        title="Mapa de evidências"
        description="Cada cartão identifica a instituição, a natureza da fonte e as datas disponíveis. Acesse a origem original para conferir o contexto completo."
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {d.sources.map(source => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            title={'Abrir fonte: ' + source.label}
            className="source-card group"
          >
            <div className="source-card-header">
              <div className="min-w-0">
                <div className="source-card-title">{source.label}</div>
                <div className="source-card-institution">{source.institution}</div>
              </div>
              <span className="source-card-icon" aria-hidden="true">
                <ExternalLink className="h-4 w-4" />
              </span>
            </div>

            <div className="source-card-meta">
              <span className={'source-nature source-nature-' + source.nature}>{natureLabel(source.nature)}</span>
              <span>{dateLabel(source.referenceDate ?? source.publishedAt)}</span>
            </div>

            {source.note && <p className="source-card-note">{source.note}</p>}

            <div className="source-card-footer">
              <span>Conferir fonte original</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
