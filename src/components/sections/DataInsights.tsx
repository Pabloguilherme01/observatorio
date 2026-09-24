import { useMemo, useState } from 'react';
import { HeartPulse, Route, Users } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { dispatchInspect } from '../DataInspector';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const formatBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function DataInsights() {
  const [routeId, setRouteId] = useState('taguatinga');
  const [beds, setBeds] = useState(d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds);
  const selectedRoute = d.transport.routes.find(route => route.id === routeId) ?? d.transport.routes[0];
  const brasilia = d.transport.routes.find(route => route.id === 'brasilia') ?? d.transport.routes[0];
  const monthlySavings = Math.max(0, (brasilia.fareBrl - selectedRoute.fareBrl) * d.transport.defaultTripsPerDay * d.transport.defaultWorkDaysPerMonth);
  const savingsShare = brasilia.fareBrl ? ((brasilia.fareBrl - selectedRoute.fareBrl) / brasilia.fareBrl) * 100 : 0;
  const pressure = useMemo(() => {
    const reference = 200000 / d.health.openingReportedBeds;
    const perBed = d.health.firstYearAttendancesAtLeast / beds;
    const reduction = (1 - perBed / reference) * 100;
    const status = perBed > 2000 ? 'Crítico' : perBed > 1200 ? 'Alta pressão' : 'Menor pressão';
    return { perBed, reduction, status };
  }, [beds]);
  const ageTotal = d.electoral.ageGroups.reduce((sum, group) => sum + group.voters, 0);

  const genderStyle = { background: `conic-gradient(#8cc8f2 0 ${d.electoral.womenPct}%, #315a75 ${d.electoral.womenPct}% 100%)` };

  return (
    <section id="insights" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="insights-title">
      <SectionHeader titleId="insights-title" eyebrow="Exploração" title="Comparadores e simuladores" description="Ferramentas interativas para explorar os dados sem produzir ranking ou recomendação eleitoral." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card id="rotas">
          <div className="flex items-center gap-3"><Route className="h-5 w-5 text-sky-300" aria-hidden="true" /><div><h3 className="text-lg font-black text-white">Comparativa de rotas</h3><p className="text-xs text-slate-400">Economia matemática em relação ao trecho para Brasília.</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{d.transport.routes.map(route => <button key={route.id} type="button" onClick={() => setRouteId(route.id)} aria-pressed={route.id === selectedRoute.id} className={`rounded-2xl border p-3 text-left transition ${route.id === selectedRoute.id ? 'border-sky-300/50 bg-sky-300/10' : 'border-white/10 bg-white/[0.02]'}`}><span className="block text-xs text-slate-400">{route.label.replace('Águas Lindas → ', '')}</span><strong className="mt-2 block text-lg text-white">{formatBRL(route.fareBrl)}</strong></button>)}</div>
          <button type="button" className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-sky-300/20" onClick={() => dispatchInspect({ label: 'Tarifa · ' + selectedRoute.label, value: formatBRL(selectedRoute.fareBrl), sourceId: selectedRoute.sourceId, status: 'current', note: 'Valor por trecho usado no simulador de transporte.' })}><div className="flex items-center justify-between text-sm"><span className="text-slate-400">Diferença por trecho</span><strong className="text-white">{formatBRL(Math.abs(brasilia.fareBrl - selectedRoute.fareBrl))}</strong></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-400">Economia no cenário padrão/mês</span><strong className="text-emerald-300">{formatBRL(monthlySavings)}</strong></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-400">Variação relativa</span><strong className="text-white">{savingsShare.toFixed(1).replace('.', ',')}%</strong></div><div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-sky-300/70">Abrir metodologia</div></button>
        </Card>

        <Card id="healgo">
          <div className="flex items-center gap-3"><HeartPulse className="h-5 w-5 text-rose-300" aria-hidden="true" /><div><h3 className="text-lg font-black text-white">Simulador de capacidade HEAL</h3><p className="text-xs text-slate-400">Explora 164 leitos reportados na inauguração até 298 planejados.</p></div></div>
          <label className="mt-5 block text-sm text-slate-300" htmlFor="heal-beds">Leitos simulados: <strong className="text-white">{beds}</strong></label>
          <input id="heal-beds" type="range" min={164} max={298} value={beds} onChange={event => setBeds(clamp(Number(event.target.value), 164, 298))} className="mt-3 min-h-12 w-full accent-sky-300" aria-valuemin={164} aria-valuemax={298} aria-valuenow={beds} aria-valuetext={`${beds} leitos`} />
          <div className="mt-4 grid grid-cols-1 gap-2 text-center sm:grid-cols-3">{[['Atend./leito', Math.round(pressure.perBed).toLocaleString('pt-BR')],['Redução', Math.max(0, pressure.reduction).toFixed(1).replace('.', ',') + '%'],['Leitura', pressure.status]].map(([label,value]) => <button key={label} type="button" onClick={() => dispatchInspect({ label: 'HEAL · ' + label, value, sourceId: 'healgo', status: 'derivado', note: 'Resultado de simulação matemática; a classificação de pressão é heurística do observatório.' })} className="min-h-12 rounded-2xl bg-white/[0.02] p-3 text-left"><span className="block text-xs text-slate-500">{label}</span><strong className="mt-1 block text-lg text-white">{value}</strong></button>)}</div>
          <p className="mt-3 text-xs leading-5 text-slate-500">A classificação é uma heurística deste simulador, não uma classificação oficial do hospital.</p>
        </Card>

        <Card id="perfil-etario">
          <div className="flex items-center gap-3"><Users className="h-5 w-5 text-sky-300" aria-hidden="true" /><div><h3 className="text-lg font-black text-white">Perfil do eleitorado</h3><p className="text-xs text-slate-400">Distribuição do snapshot eleitoral usado nesta edição.</p></div></div>
          <div className="mt-5 grid gap-5 md:grid-cols-[170px_1fr] md:items-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full p-4" style={genderStyle} role="img" aria-label={`Distribuição por gênero: ${d.electoral.womenPct}% mulheres e ${d.electoral.menPct}% homens`}><div className="grid h-full w-full place-items-center rounded-full bg-[#0b1117]"><div className="text-center"><strong className="text-xl text-white">{d.electoral.womenPct}%</strong><span className="block text-[10px] text-slate-500">mulheres</span></div></div></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs"><button type="button" onClick={() => dispatchInspect({ label: 'Eleitorado · mulheres', value: d.electoral.womenPct + '%', sourceId: d.electoral.sourceId, referenceDate: d.electoral.snapshotDate })} className="rounded-xl border border-white/8 p-3 text-left"><span className="text-slate-500">Mulheres</span><strong className="mt-1 block text-white">{d.electoral.womenPct}%</strong></button><button type="button" onClick={() => dispatchInspect({ label: 'Eleitorado · homens', value: d.electoral.menPct + '%', sourceId: d.electoral.sourceId, referenceDate: d.electoral.snapshotDate })} className="rounded-xl border border-white/8 p-3 text-left"><span className="text-slate-500">Homens</span><strong className="mt-1 block text-white">{d.electoral.menPct}%</strong></button></div>
              {d.electoral.ageGroups.map(group => <button key={group.id} type="button" onClick={() => dispatchInspect({ label: 'Eleitorado · ' + group.label, value: group.sharePct + '% · ' + group.voters.toLocaleString('pt-BR') + ' eleitores', sourceId: d.electoral.sourceId, referenceDate: d.electoral.snapshotDate })} className="block w-full text-left"><div className="flex justify-between text-xs"><span className="text-slate-400">{group.label}</span><strong className="text-white">{group.sharePct}%</strong></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-300" style={{ width: group.sharePct + '%' }} /></div><div className="mt-1 text-[11px] text-slate-600">{group.voters.toLocaleString('pt-BR')} eleitores</div></button>)}
              <p className="text-[11px] text-slate-600">Soma do recorte etário: {ageTotal.toLocaleString('pt-BR')} eleitores.</p>
            </div>
          </div>
        </Card>

      </div>
    </section>
  );
}
