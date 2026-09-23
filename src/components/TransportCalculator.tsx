import { BusFront, Coins, Users } from 'lucide-react';
import { useMemo, useState, type ComponentType } from 'react';
import { observatorioData as d } from '../data/observatorioData';
import { calculateTransportCost, formatBRL } from '../lib/transport';
import { Card } from './ui/Card';
import { SectionHeader } from './ui/SectionHeader';

export function TransportCalculator() {
  const routes = d.transport.routes;
  const [routeId, setRouteId] = useState('brasilia');
  const [days, setDays] = useState(d.transport.defaultWorkDaysPerMonth);
  const [trips, setTrips] = useState(d.transport.defaultTripsPerDay);
  const [people, setPeople] = useState(1);
  const [salary, setSalary] = useState(d.transport.minimumWageBrl);
  const route = routes.find(r => r.id === routeId) ?? routes[0];
  const result = useMemo(() => calculateTransportCost({ fareBrl: route.fareBrl, tripsPerDay: trips, workDaysPerMonth: days, people, monthsPerYear: 12, salaryReferenceBrl: salary }), [route.fareBrl, trips, days, people, salary]);
  const input = 'mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40';

  return <section id="transporte" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="transporte-title">
    <SectionHeader eyebrow="Mobilidade" title="Simulador de custo do deslocamento" description="A regra é simples e auditável: tarifa × trechos/dia × dias/mês × pessoas." />
    <Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm text-slate-300">Destino<select className={input} value={route.id} onChange={e => setRouteId(e.target.value)}>{routes.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
        <label className="text-sm text-slate-300">Trechos por dia<input className={input} type="number" min={1} max={8} value={trips} onChange={e => setTrips(Math.max(1, Number(e.target.value) || 1))} /></label>
        <label className="text-sm text-slate-300">Dias/mês<input className={input} type="number" min={1} max={31} value={days} onChange={e => setDays(Math.max(1, Number(e.target.value) || 1))} /></label>
        <label className="text-sm text-slate-300">Pessoas<input className={input} type="number" min={1} max={20} value={people} onChange={e => setPeople(Math.max(1, Number(e.target.value) || 1))} /></label>
        <label className="text-sm text-slate-300">Renda de referência<input className={input} type="number" min={1} step={1} value={salary} onChange={e => setSalary(Math.max(1, Number(e.target.value) || 1))} /></label>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {([['Por pessoa / mês', formatBRL(result.monthlyPerPersonBrl), BusFront], ['Por pessoa / ano', formatBRL(result.annualPerPersonBrl), Coins], ['Grupo / mês', formatBRL(result.monthlyTotalBrl), Users], ['Grupo / ano', formatBRL(result.annualTotalBrl), Coins]] as const).map(([label, value, Icon]) => <div key={String(label)} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Icon className="h-4 w-4" aria-hidden="true" />{label}</div><div className="mt-3 text-2xl font-black text-white">{value}</div></div>)}
      </div>
      <div className="mt-4 rounded-2xl border border-sky-400/10 bg-sky-400/[0.03] p-4 text-xs leading-5 text-slate-400"><strong className="text-slate-200">Cenário padrão:</strong> R$ 11,45 × 2 × 22 = R$ 503,80/mês e R$ 6.045,60/ano. O resultado não considera vale-transporte, integrações, gratuidades, faltas ou feriados.</div>
    </Card>
  </section>;
}