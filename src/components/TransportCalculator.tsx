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

  const source = d.sources.find(sourceItem => sourceItem.id === route.sourceId);
  const salaryShare = result.monthlyPctOfSalaryPerPerson ?? 0;
  const salaryBarWidth = Math.min(100, Math.max(0, salaryShare));

  return (
    <section id="transporte" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="transporte-title">
      <SectionHeader
        titleId="transporte-title"
        eyebrow="Mobilidade"
        title="Simulador de bolso"
        description="Escolha quantas pessoas da família fazem esse deslocamento e veja o custo mensal. As premissas detalhadas ficam abertas abaixo."
        action={source?.url ? (
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-sky-300">
            Fonte da tarifa <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : undefined}
      />

      <Card className="overflow-hidden border-sky-300/12 bg-sky-300/[0.025]">
        <div className="grid gap-6 lg:grid-cols-[1fr_.78fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              <Users className="h-4 w-4 text-sky-300" aria-hidden="true" />
              Pessoas que usam o ônibus
            </div>
            <div className="mt-3 flex items-end gap-3">
              <div className="text-6xl font-black tabular-nums text-white light:text-slate-900">{people}</div>
              <div className="pb-2 text-sm text-slate-400">{people === 1 ? 'pessoa' : 'pessoas'} · {route.label}</div>
            </div>
            <input
              className="mt-6 h-3 w-full cursor-pointer accent-sky-300"
              type="range"
              min={1}
              max={6}
              step={1}
              value={people}
              onChange={event => setPeople(Number(event.target.value))}
              aria-label="Quantidade de pessoas da família que usam o ônibus"
            />
            <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-500">
              <span>1 pessoa</span>
              <span>6 pessoas</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 light:bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <BusFront className="h-4 w-4 text-sky-300" aria-hidden="true" />
                Família / mês
              </div>
              <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatBRL(result.monthlyTotalBrl)}</div>
              <div className="mt-1 text-xs text-slate-500">{formatBRL(route.fareBrl)} por trecho</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 light:bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Coins className="h-4 w-4 text-sky-300" aria-hidden="true" />
                Por pessoa / mês
              </div>
              <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatBRL(result.monthlyPerPersonBrl)}</div>
              <div className="mt-1 text-xs text-slate-500">{trips} trechos/dia · {days} dias</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 light:bg-white">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Referência de renda</span>
                <span>{formatBRL(salary)}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/8 light:bg-slate-200">
                <div className="h-full rounded-full bg-sky-300 transition-[width] duration-200" style={{ width: salaryBarWidth + '%' }} />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <strong className="text-lg text-white light:text-slate-900">{salaryShare.toFixed(1).replace('.', ',')}%</strong>
                <span className="text-[11px] text-slate-500">do valor de referência</span>
              </div>
            </div>
          </div>
        </div>

        <details className="mt-6 rounded-2xl border border-white/8 bg-black/10 p-4 light:bg-slate-50">
          <summary className="cursor-pointer list-none text-sm font-bold text-slate-300 light:text-slate-700">
            Ajustar premissas do cálculo
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-slate-300 light:text-slate-700">
              Destino
              <select className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" value={route.id} onChange={event => setRouteId(event.target.value)}>
                {routes.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Trechos por dia
              <input className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={8} value={trips} onChange={event => setTrips(Math.max(1, Number(event.target.value) || 1))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Dias/mês
              <input className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={31} value={days} onChange={event => setDays(Math.max(1, Number(event.target.value) || 1))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Pessoas
              <input className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={20} value={people} onChange={event => setPeople(Math.max(1, Number(event.target.value) || 1))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Renda de referência
              <input className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} step={1} value={salary} onChange={event => setSalary(Math.max(1, Number(event.target.value) || 1))} />
            </label>
          </div>
        </details>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300 light:text-slate-700">Como o valor é calculado:</strong> tarifa × trechos/dia × dias/mês × pessoas.
          O resultado não considera vale-transporte, integrações, gratuidades, faltas ou feriados. A referência salarial é apenas um denominador de contexto.
        </div>
      </Card>
    </section>
  );
}
