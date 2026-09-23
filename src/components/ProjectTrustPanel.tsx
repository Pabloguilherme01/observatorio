import { CheckCircle2, ExternalLink, GitPullRequest, ShieldCheck } from '../components/icons.mjs';
import { observatorioData as d } from '../data/observatorioData';
import { EDITION } from '../config/version';
import { formatDate } from '../utils/formatters';

const correctionUrl = 'https://github.com/Pabloguilherme01/observatorio/issues/new?title=Corre%C3%A7%C3%A3o%20de%20dado%20ou%20fonte&labels=correcao';

export function ProjectTrustPanel() {
  const official = d.sources.filter(source => source.nature === 'official').length;
  return (
    <section id="principios" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="principles-title">
      <div className="trust-shell">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Confiança e método
            </div>
            <h2 id="principles-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Como o Observatório funciona</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Fonte, data, natureza do dado e limitações acompanham a leitura. O projeto organiza informação pública e não substitui os órgãos oficiais.</p>
          </div>
          <div className="freshness-pill">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Edição / atualização</span>
            <strong className="mt-1 block text-sm text-white">{EDITION} · {formatDate(d.meta.updatedAt)}</strong>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="trust-card">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <strong>Veja o dado</strong>
            <p>Números e cálculos ficam identificados como observados ou derivados.</p>
          </div>
          <div className="trust-card">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <strong>Confira a fonte</strong>
            <p>{official} fontes catalogadas como oficiais nesta edição.</p>
          </div>
          <div className="trust-card">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <strong>Entenda a limitação</strong>
            <p>Snapshots diferentes não são misturados como se fossem a mesma fotografia.</p>
          </div>
          <div className="trust-card">
            <GitPullRequest className="h-4 w-4 text-sky-300" aria-hidden="true" />
            <strong>Encontrou um erro?</strong>
            <p>Envie uma correção com a fonte ou evidência para análise do projeto.</p>
            <a href={correctionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-sky-300">
              Propor correção <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300">Compromisso editorial:</strong> o observatório não produz ranking automático, recomendação eleitoral ou previsão de resultado. Para decisões e providências, consulte a fonte oficial correspondente.
        </div>
      </div>
    </section>
  );
}
