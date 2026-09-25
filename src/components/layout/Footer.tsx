import { ExternalLink } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatDate } from '../../utils/formatters';

export function Footer() {
  return (
    <footer className="site-footer px-4 py-6 sm:py-8" aria-label="Informações do observatório">
      <div className="site-footer-panel mx-auto max-w-7xl">
        <div className="site-footer-brand">
          <span className="site-footer-kicker">Observatório público</span>
          <strong>Águas Lindas de Goiás · {d.meta.edition}</strong>
          <small>Atualizado em {formatDate(d.meta.updatedAt)} · dados públicos com fontes identificadas.</small>
        </div>

        <nav className="site-footer-links" aria-label="Links do rodapé">
          <a href="#fontes">Fontes</a>
          <a href="#contexto">Contexto</a>
          <a href="#acao">Como usar</a>
          <a href="#principios">Princípios</a>
          <a href="https://github.com/Pabloguilherme01/observatorio" target="_blank" rel="noopener noreferrer">
            Código-fonte <ExternalLink aria-hidden="true" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
