import { BusFront, Coins, ExternalLink, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
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

  const result = useMemo(
    () => calculateTransportCost({
      fareBrl: route.fareBrl,
      tripsPerDay: trips,
      workDaysPerMonth: days,
      people,
      monthsPerYear: 12,
      salaryReferenceBrl: salary,
    }),
    [route.fareBrl, trips, days, people, salary],
  );

  const input = 'mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40';

  return (
    <section id="transporte" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="transporte-title">
      <SectionHeader
        titleId="transporte-title"
        eyebrow="Mobilidade"
        title="Simulador de custo do deslocamento"
        description="A regra é simples e auditável: tarifa × trechos/dia × dias/mês × pessoas."
        action={
          <a href={d.sources.find(source => source.id === route.sourceId)?.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-sky-300">
            Fonte da tarifa <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        }
      />
      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm text-slate-300">
            Destino
            <select className={input} value={route.id} onChange={event => setRouteId(event.target.value)}>
              {routes.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Trechos por dia
            <input className={input} type="number" min={1} max={8} value={trips} onChange={event => setTrips(Math.max(1, Number(event.target.value) || 1))} />
          </label>
          <label className="text-sm text-slate-300">
            Dias/mês
            <input className={input} type="number" min={1} max={31} value={days} onChange={event => setDays(Math.max(1, Number(event.target.value) || 1))} />
          </label>
          <label className="text-sm text-slate-300">
            Pessoas
            <input className={input} type="number" min={1} max={20} value={people} onChange={event => setPeople(Math.max(1, Number(event.target.value) || 1))} />
          </label>
          <label className="text-sm text-slate-300">
            Renda de referência
            <input className={input} type="number" min={1} step={1} value={salary} onChange={event => setSalary(Math.max(1, Number(event.target.value) || 1))} />
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ['Por pessoa / mês', formatBRL(result.monthlyPerPersonBrl), BusFront],
            ['Por pessoa / ano', formatBRL(result.annualPerPersonBrl), Coins],
            ['Grupo / mês', formatBRL(result.monthlyTotalBrl), Users],
            ['Grupo / ano', formatBRL(result.annualTotalBrl), Coins],
          ] as const).map(([label, value, Icon]) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Icon className="h-4 w-4" aria-hidden="true" />{label}
              </div>
              <div className="mt-3 text-2xl font-black text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs">
            <span className="text-slate-500">Peso mensal sobre a renda de referência</span>
            <strong className="mt-1 block text-lg text-white">
              {result.monthlyPctOfSalaryPerPerson == null ? '—' : result.monthlyPctOfSalaryPerPerson.toFixed(1).replace('.', ',') + '%'}
            </strong>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs">
            <span className="text-slate-500">Cenário selecionado</span>
            <strong className="mt-1 block text-lg text-white">{formatBRL(route.fareBrl)} por trecho</strong>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-sky-400/10 bg-sky-400/[0.03] p-4 text-xs leading-5 text-slate-400">
          <strong className="text-slate-200">Cenário padrão:</strong> {formatBRL(routes[0].fareBrl)} × {d.transport.defaultTripsPerDay} × {d.transport.defaultWorkDaysPerMonth} = {formatBRL(routes[0].fareBrl * d.transport.defaultTripsPerDay * d.transport.defaultWorkDaysPerMonth)}/mês e {formatBRL(routes[0].fareBrl * d.transport.defaultTripsPerDay * d.transport.defaultWorkDaysPerMonth * 12)}/ano. O resultado não considera vale-transporte, integrações, gratuidades, faltas ou feriados.
        </div>
      </Card>
    </section>
  );
}
