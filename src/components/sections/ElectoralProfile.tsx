import { Fingerprint, UserRound, UsersRound } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { formatNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

export function ElectoralProfile() {
  return <section id="eleitorado" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="eleitorado-title">
    <SectionHeader eyebrow="Eleitorado" title="Perfil eleitoral sem confundir universos" description="O observatório separa o snapshot da 28ª Zona, o consolidado do TSE e os indicadores derivados." />
    <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <Card><div className="grid gap-3 sm:grid-cols-3">{d.electoral.ageGroups.map(g => <div key={g.id} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><div className="text-xs font-bold uppercase tracking-widest text-slate-500">{g.label}</div><div className="mt-2 text-2xl font-black text-white">{formatNumber(g.voters)}</div><div className="mt-1 text-xs text-sky-200">{g.sharePct.toFixed(1).replace('.', ',')}%</div></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/8 p-4"><UserRound className="mb-2 h-4 w-4 text-sky-300" /><strong className="block text-white">52,98%</strong><span className="text-xs text-slate-500">mulheres</span></div><div className="rounded-2xl border border-white/8 p-4"><UsersRound className="mb-2 h-4 w-4 text-sky-300" /><strong className="block text-white">47,02%</strong><span className="text-xs text-slate-500">homens</span></div><div className="rounded-2xl border border-white/8 p-4"><Fingerprint className="mb-2 h-4 w-4 text-sky-300" /><strong className="block text-white">891</strong><span className="text-xs text-slate-500">nome social</span></div></div></Card>
      <Card><div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Conferência cadastral</div><div className="mt-3 text-3xl font-black text-white">439</div><p className="mt-1 text-sm text-slate-400">diferença entre 125.062 na 28ª Zona e 125.501 no consolidado usado no modelo.</p><div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4 text-xs leading-5 text-amber-100"><strong>Nota:</strong> a diferença é mantida como dado de auditoria; não é “erro” presumido sem reconciliação entre os arquivos e os universos.</div><div className="mt-4 text-xs text-slate-500">Indígenas: 941 pessoas no Censo · 33 registros eleitorais informados no material de origem.</div></Card>
    </div>
  </section>;
}