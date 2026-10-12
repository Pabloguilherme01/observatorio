import { Bookmark, ExternalLink } from 'lucide-react';
import type { PublicServiceResource } from '../../../data/publicServices';

interface OfficialResourceCardProps {
  readonly service: PublicServiceResource;
  readonly compact?: boolean;
  readonly saved?: boolean;
  readonly onToggleSaved?: (service: PublicServiceResource) => void;
}

export function OfficialResourceCard({ service, compact = false, saved = false, onToggleSaved }: OfficialResourceCardProps) {
  const Icon = service.icon;
  const cta = typeof service.cta === 'string' ? service.cta : null;

  return (
    <div className="citizen-service-card"><a
      href={service.href}
      target="_blank"
      rel="noopener noreferrer"
      className={'official-resource-card' + (compact ? ' compact' : '')}
      aria-label={(cta ?? 'Abrir serviço') + ': ' + service.title + ' — canal oficial em nova aba'}
    >
      <span className={'official-resource-icon' + (compact ? ' small' : '')} aria-hidden="true">
        <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </span>
      <span className="min-w-0 flex-1">
        <strong>{service.title}</strong>
        <small>{service.description}</small>
        {cta && <em>{cta}</em>}
      </span>
      <ExternalLink className={'official-resource-arrow ' + (compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} aria-hidden="true" />
    </a>
    {onToggleSaved && <button type="button" className="citizen-save-button" aria-label={`Salvar serviço: ${service.title}`} aria-pressed={saved} onClick={() => onToggleSaved(service)}><Bookmark aria-hidden="true" />{saved ? 'Serviço salvo' : 'Salvar serviço'}</button>}
    </div>
  );
}
