import { observatorioData as d } from '../../data/observatorioData';
import { formatDate } from '../../utils/formatters';

export function Footer() {
  return (
    <footer className="border-t border-white/8 px-4 py-10" aria-label="Informações do observatório">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold text-slate-400">Observatório Eleitoral Águas Lindas de Goiás</span>
          <span className="mx-2">·</span>
          <span>{d.meta.edition}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Atualizado em {formatDate(d.meta.updatedAt)}</span>
          <a href="#fontes" className="transition hover:text-sky-300">Fontes e metodologia</a>
          <a href="#contexto" className="transition hover:text-sky-300">Contexto</a>
          <a href="#acao" className="transition hover:text-sky-300">Como usar</a>
          <a href="#principios" className="transition hover:text-sky-300">Princípios e correções</a>
          <a href="https://github.com/Pabloguilherme01/observatorio" target="_blank" rel="noopener noreferrer" className="transition hover:text-sky-300">Código-fonte</a>
          <span>Dados e cálculos com proveniência identificada.</span>
        </div>
      </div>
    </footer>
  );
}
