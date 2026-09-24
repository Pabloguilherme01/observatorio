import { useMemo } from 'react';
import { Fingerprint, UserRound, UsersRound } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

function Donut({ women, men }: { readonly women: number; readonly men: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const womenLength = circumference * (women / 100);
  return (
    <svg viewBox="0 0 110 110" className="h-32 w-32" role="img" aria-label={`Distribuição do eleitorado por gênero: ${women.toFixed(2)}% mulheres e ${men.toFixed(2)}% homens.`}>
      <circle cx="55" cy="55" r={radius} fill="none" stroke="currentColor" className="text-slate-700/30" strokeWidth="12" />
      <circle cx="55" cy="55" r={radius} fill="none" stroke="currentColor" className="text-sky-300" strokeWidth="12" strokeDasharray={`${womenLength} ${circumference - womenLength}`} strokeLinecap="round" transform="rotate(-90 55 55)" />
      <text x="55" y="52" textAnchor="middle" className="fill-current text-xl font-black text-white">{women.toFixed(1)}%</text>
      <text x="55" y="68" textAnchor="middle" className="fill-slate-500 text-[8px]">mulheres</text>
    </svg>
  );
}

export function ElectoralProfile() {
  const totalAgeVoters = useMemo(() => d.electoral.ageGroups.reduce((sum, group) => sum + group.voters, 0), []);
  return <section id="eleitorado" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="eleitorado-title">
    <SectionHeader titleId="eleitorado-title" eyebrow="Eleitorado" title="Perfil eleitoral sem confundir universos" description="O observatório separa o snapshot da 28ª Zona, o consolidado do TSE e os indicadores derivados." />
    <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <Card>
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid place-items-center">
            <Donut women={d.electoral.womenPct ?? 0} men={d.electoral.menPct ?? 0} />
            <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
              <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-300" aria-hidden="true" />mulheres</span>
              <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-600" aria-hidden="true" />homens</span>
            </div>
          </div>
          <div className="space-y-3">
            {d.electoral.ageGroups.map(group => {
              const pct = totalAgeVoters ? (group.voters / totalAgeVoters) * 100 : 0;
              return (
                <div key={group.id}>
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="font-semibold text-slate-300">{group.label}</span>
                    <strong className="text-white">{formatNumber(group.voters)}</strong>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/5 light:bg-slate-200" aria-hidden="true">
                    <div className="h-full rounded-full bg-sky-300 light:bg-sky-600" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 p-4"><UserRound className="mb-2 h-4 w-4 text-sky-300" aria-hidden="true" /><strong className="block text-white">{(d.electoral.womenPct ?? 0).toFixed(2).replace('.', ',')}%</strong><span className="text-xs text-slate-500">mulheres</span></div>
          <div className="rounded-2xl border border-white/8 p-4"><UsersRound className="mb-2 h-4 w-4 text-sky-300" aria-hidden="true" /><strong className="block text-white">{(d.electoral.menPct ?? 0).toFixed(2).replace('.', ',')}%</strong><span className="text-xs text-slate-500">homens</span></div>
          <div className="rounded-2xl border border-white/8 p-4"><Fingerprint className="mb-2 h-4 w-4 text-sky-300" aria-hidden="true" /><strong className="block text-white">{formatNumber(d.electoral.socialNameCount ?? 0)}</strong><span className="text-xs text-slate-500">nome social</span></div>
        </div>
      </Card>
      <Card>
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Conferência cadastral</div>
        <div className="mt-3 text-3xl font-black text-white">{formatNumber(d.electoral.zoneVsTseDifference ?? 0)}</div>
        <p className="mt-1 text-sm text-slate-400">diferença entre 125.062 na 28ª Zona e 125.501 no consolidado mantido como reconciliação editorial.</p>
        <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4 text-xs leading-5 text-amber-100"><strong>Nota:</strong> a diferença é mantida como dado de auditoria. Diferenças entre recortes eleitorais podem ocorrer por data de referência, universo e sincronização das bases. O valor consolidado está marcado como reconciliação editorial e não como nova captura oficial independente.</div>
        <div className="mt-4 text-xs text-slate-500">Fonte do consolidado: reconciliação editorial local. Indígenas: 941 pessoas no Censo · 33 registros eleitorais informados no material de origem.</div>
      </Card>
    </div>

      <Card className="lg:col-span-2 border-sky-300/12 bg-sky-300/[0.025]">
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Contexto de mobilidade eleitoral</div>
        <div className="mt-3 grid gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
          <div>
            <div className="text-4xl font-black text-white light:text-slate-900">4.063</div>
            <div className="text-xs text-slate-500">títulos transferidos do DF para Águas Lindas em 2024</div>
          </div>
          <div className="text-sm leading-6 text-slate-400">
            Em levantamento com dados do TRE-GO, Águas Lindas foi o município do Entorno que mais recebeu títulos transferidos da capital no ciclo de 2022–2024. O dado é histórico e não deve ser interpretado como composição atual do eleitorado de 2026.
            <a className="ml-1 inline-flex items-center gap-1 font-bold text-sky-300 hover:text-sky-200" href="https://www12.senado.leg.br/tv/programas/noticias-1/2024/10/aguas-lindas-e-o-municipio-do-entorno-do-df-que-mais-recebeu-titulos-transferidos-da-capital-federal" target="_blank" rel="noopener noreferrer">Fonte: TV Senado · dados TRE-GO</a>
          </div>
        </div>
      </Card>
  </section>;
}
