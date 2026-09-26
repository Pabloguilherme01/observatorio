import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type PremiumTone = 'sky' | 'violet' | 'emerald' | 'amber' | 'slate';

export function PremiumInfoCard({
  icon: Icon,
  eyebrow,
  title,
  children,
  tone = 'sky',
  compact = false,
  footer,
  className = '',
}: {
  readonly icon: LucideIcon;
  readonly eyebrow: string;
  readonly title: string;
  readonly children: ReactNode;
  readonly tone?: PremiumTone;
  readonly compact?: boolean;
  readonly footer?: ReactNode;
  readonly className?: string;
}) {
  return (
    <article
      className={`premium-info-card ${compact ? 'is-compact' : ''} ${className}`}
      data-tone={tone}
    >
      <div className="premium-info-icon" aria-hidden="true">
        <Icon />
      </div>
      <div className="premium-info-copy">
        <span className="premium-info-eyebrow">{eyebrow}</span>
        <strong className="premium-info-title">{title}</strong>
        <div className="premium-info-body">{children}</div>
        {footer && <div className="premium-info-footer">{footer}</div>}
      </div>
    </article>
  );
}
