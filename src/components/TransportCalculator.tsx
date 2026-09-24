import { BusFront, Coins, ExternalLink, Share2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { observatorioData as d } from '../data/observatorioData';
import { calculateTransportCost, formatBRL, workDaysPerMonthFromWeeks } from '../lib/transport';
import { Card } from './ui/Card';
import { SectionHeader } from './ui/SectionHeader';

export function TransportCalculator() {
  const routes = d.transport.routes;
  const [routeId, setRouteId] = useState('brasilia');
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const days = workDaysPerMonthFromWeeks(daysPerWeek);
  const [trips, setTrips] = useState(d.transport.defaultTripsPerDay);
  const [people, setPeople] = useState(1);
  const [salary, setSalary] = useState(d.transport.minimumWageBrl);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('observatorio:transport-preferences:v1');
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{ routeId: string; daysPerWeek: number; trips: number; people: number; salary: number }>;
        if (typeof saved.routeId === 'string' && routes.some(item => item.id === saved.routeId)) setRouteId(saved.routeId);
        if (Number.isFinite(saved.daysPerWeek)) setDaysPerWeek(Math.min(7, Math.max(1, Math.trunc(saved.daysPerWeek!))));
        if (Number.isFinite(saved.trips)) setTrips(Math.min(8, Math.max(1, Math.trunc(saved.trips!))));
        if (Number.isFinite(saved.people)) setPeople(Math.min(20, Math.max(1, Math.trunc(saved.people!))));
        if (Number.isFinite(saved.salary)) setSalary(Math.min(1_000_000, Math.max(1, saved.salary!)));
      }
    } catch {
      // Preferências locais são opcionais; um cache inválido não impede a calculadora.
    } finally {
      setPreferencesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    try {
      localStorage.setItem('observatorio:transport-preferences:v1', JSON.stringify({ routeId, daysPerWeek, trips, people, salary }));
    } catch {
      // Armazenamento local pode estar indisponível em navegação privada ou políticas restritivas.
    }
  }, [preferencesLoaded, routeId, daysPerWeek, trips, people, salary]);
  const [shareStatus, setShareStatus] = useState('');
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
  const share = async () => {
    const text = `Simulador de bolso · ${route.label}. ${formatBRL(result.monthlyPerPersonBrl)} por pessoa/mês no cenário de ${days} dias e ${trips} trechos/dia. Veja e ajuste as premissas: ${window.location.href}#transporte`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Simulador de bolso · Águas Lindas', text, url: window.location.href + '#transporte' });
        setShareStatus('Compartilhado');
        window.setTimeout(() => setShareStatus(''), 1800);
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareStatus('Link copiado');
        window.setTimeout(() => setShareStatus(''), 1800);
      }
    } catch {
      // O compartilhamento pode ser cancelado pelo usuário.
    }
  };

  return (
    <section id="transporte" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="transporte-title">
      <SectionHeader
        titleId="transporte-title"
        eyebrow="Mobilidade"
        title="Simulador de bolso"
        description="Informe quantos dias por semana você faz o trajeto, veja o custo mensal e compare esse gasto com o salário mínimo de 2026. As premissas ficam abertas abaixo."
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
              <div className="mt-1 text-xs text-slate-500">{trips} trechos/dia · {daysPerWeek} dias/semana · 4,4 semanas/mês</div>
              <button type="button" onClick={share} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:border-sky-300/20 hover:text-white light:border-slate-200 light:text-slate-700">
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Compartilhar cenário
              </button>
              {shareStatus && <div className="mt-2 text-[11px] font-semibold text-emerald-300" role="status" aria-live="polite">{shareStatus}</div>}
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
              <input className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={8} value={trips} onChange={event => setTrips(Math.min(8, Math.max(1, Number.isFinite(Number(event.target.value)) ? Math.trunc(Number(event.target.value)) : 1)))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Dias por semana
              <input className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={7} value={daysPerWeek} onChange={event => setDaysPerWeek(Math.min(7, Math.max(1, Number.isFinite(Number(event.target.value)) ? Math.trunc(Number(event.target.value)) : 1)))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Pessoas
              <input className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={20} value={people} onChange={event => setPeople(Math.min(20, Math.max(1, Number.isFinite(Number(event.target.value)) ? Math.trunc(Number(event.target.value)) : 1)))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Renda de referência
              <input className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} step={1} value={salary} onChange={event => setSalary(Math.min(1_000_000, Math.max(1, Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : 1)))} />
            </label>
          </div>
        </details>

        <div className="mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4 text-xs leading-5 text-slate-400">
          <strong className="text-slate-300 light:text-slate-700">Integração em acompanhamento:</strong> Águas Lindas foi definida como projeto-piloto para integração do transporte no Entorno, com previsão de terminal de integração e unificação da bilhetagem. O observatório registra isso como iniciativa pública em acompanhamento, não como obra concluída.
          <a className="ml-1 inline-flex items-center gap-1 font-bold text-sky-300 hover:text-sky-200" href="https://goias.gov.br/entorno/aguas-lindas-sera-projeto-piloto-para-integracao-do-transporte-no-entorno/" target="_blank" rel="noopener noreferrer">Fonte oficial <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300 light:text-slate-700">Como o valor é calculado:</strong> tarifa × trechos/dia × dias/semana × 4,4 semanas/mês × pessoas.
          O resultado não considera vale-transporte, integrações, gratuidades, faltas ou feriados. A referência salarial de R$ 1.621,00 é o salário mínimo nacional vigente em 2026 e serve apenas como denominador de contexto.
        </div>
      </Card>
    </section>
  );
}
