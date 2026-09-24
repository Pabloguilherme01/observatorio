import { CheckCircle2, ExternalLink, GitPullRequest, ShieldCheck, Database, CalendarClock } from 'lucide-react';
import { observatorioData as d } from '../data/observatorioData';
import { EDITION } from '../config/version';
import { formatDate } from '../utils/formatters';
import { useLanguageMode } from '../context/LanguageModeContext';

const correctionUrl = 'https://github.com/Pabloguilherme01/observatorio/issues/new?title=Corre%C3%A7%C3%A3o%20de%20dado%20ou%20fonte&labels=correcao';

export function ProjectTrustPanel() {
  const official = d.sources.filter(source => source.nature === 'official').length;
  const { mode } = useLanguageMode();
  return (
    <section id="principios" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="principles-title">
      <div className="trust-shell">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Confiança e método
            </div>
            <h2 id="principles-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Como conferir os dados</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{mode !== 'technical' ? 'Cada número tem fonte e data. Veja a origem antes de tirar uma conclusão.' : 'Fonte, data, natureza do dado e limitações acompanham a leitura.'}</p>
          </div>
          {mode === 'technical' && <div className="freshness-pill"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Edição / atualização</span><strong className="mt-1 block text-sm text-white">{EDITION} · {formatDate(d.meta.updatedAt)}</strong></div>}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="trust-card"><CheckCircle2 className="h-4 w-4 text-emerald-300" /><strong>Veja o dado</strong><p>Número ou cálculo, sem misturar os dois.</p></div>
          <div className="trust-card"><CheckCircle2 className="h-4 w-4 text-emerald-300" /><strong>Confira a fonte</strong><p>Abra a referência quando quiser conferir.</p></div>
          <div className="trust-card"><CheckCircle2 className="h-4 w-4 text-emerald-300" /><strong>Entenda a limitação</strong><p>Datas de referência diferentes continuam separadas.</p></div>
          <div className="trust-card"><GitPullRequest className="h-4 w-4 text-sky-300" /><strong>Encontrou um erro?</strong><p>Envie a fonte para análise.</p><a href={correctionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-sky-300">Propor correção <ExternalLink className="h-3.5 w-3.5" /></a></div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="trust-card"><Database className="h-4 w-4 text-sky-300" /><strong>Proveniência antes da interpretação</strong><p>Dados atuais, históricos, snapshots e cálculos derivados ficam identificados.</p></div>
          <div className="trust-card"><CalendarClock className="h-4 w-4 text-sky-300" /><strong>Data da fonte e captura</strong><p>A atualização do sistema não substitui a data original do dado.</p></div>
        </div>

        {mode === 'technical' && <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-5 text-slate-500"><strong className="text-slate-300">Compromisso editorial:</strong> o observatório não produz ranking automático, recomendação eleitoral ou previsão de resultado.</div>}
      </div>
    </section>
  );
}
