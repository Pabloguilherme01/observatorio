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
          <small>Edição-base em {formatDate(d.meta.updatedAt)} · cada indicador mantém sua própria referência temporal, publicação e fonte.</small>
        </div>

        <nav className="site-footer-links" aria-label="Links do rodapé">
          <a href="#dashboard">Indicadores</a>
          <a href="#acao">Serviços públicos</a>
          <a href="#fontes">Fontes e método</a>
          <a href="#exportacao">Baixar dados</a>
          <a href={import.meta.env.BASE_URL + 'acessibilidade.html'}>Acessibilidade</a>
          <a href={import.meta.env.BASE_URL + 'privacidade.html'}>Privacidade</a>
          <a href="https://github.com/Pabloguilherme01/observatorio" target="_blank" rel="noopener noreferrer" aria-label="Abrir código-fonte do Observatório no GitHub em nova aba">
            Código-fonte <ExternalLink aria-hidden="true" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
