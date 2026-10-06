import { BusFront, Coins, ExternalLink, RotateCcw, Share2, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { observatorioData as d } from '../data/observatorioData';
import { calculateTransportCost, formatBRL } from '../lib/transport';
import { copyText } from '../lib/clipboard';
import { Card } from './ui/Card';
import { SectionHeader } from './ui/SectionHeader';
import { useTransportScenario } from '../hooks/useTransportScenario';
import { TransportRouteComparisonGrid } from './transport/TransportRouteComparisonGrid';

export function TransportCalculator() {
  const routes = d.transport.routes;
  const defaultSalary = d.transport.minimumWageBrl;
  const minimumWageYear = d.transport.minimumWageYear;
  const {
    routeId,
    setRouteId,
    daysPerWeek,
    setDaysPerWeek,
    days,
    trips,
    setTrips,
    people,
    setPeople,
    salary,
    setSalary,
    resetScenario,
  } = useTransportScenario({
    routeIds: routes.map(item => item.id),
    defaultRouteId: 'brasilia',
    defaultTrips: d.transport.defaultTripsPerDay,
    defaultSalary,
  });
  const [shareStatus, setShareStatus] = useState('');
  const shareTimerRef = useRef<number | null>(null);
  useEffect(() => () => {
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
  }, []);
  const flashShareStatus = (message: string) => {
    setShareStatus(message);
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    shareTimerRef.current = window.setTimeout(() => {
      shareTimerRef.current = null;
      setShareStatus('');
    }, 1800);
  };
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

  const routeComparisons = useMemo(
    () => routes.map(compareRoute => ({
      route: compareRoute,
      result: calculateTransportCost({
        fareBrl: compareRoute.fareBrl,
        tripsPerDay: trips,
        workDaysPerMonth: days,
        people: 1,
        monthsPerYear: 12,
        salaryReferenceBrl: salary,
      }),
    })),
    [routes, trips, days, salary],
  );

  const source = d.sources.find(sourceItem => sourceItem.id === route.sourceId);
  const salaryShare = result.monthlyPctOfSalaryPerPerson ?? 0;
  const salaryIsDefault = Math.abs(salary - defaultSalary) < 0.01;
  const salaryBarWidth = Math.min(100, Math.max(0, salaryShare));
  const share = async () => {
    const shareUrl = window.location.href.split('#')[0] + '#transporte';
    const text = `Simulação de transporte · ${route.label}. ${formatBRL(result.monthlyPerPersonBrl)} por pessoa/mês no cenário de ${daysPerWeek} dias/semana (~${days} dias/mês) e ${trips} trechos/dia. Tarifa usada: ${formatBRL(route.fareBrl)} por trecho. Veja e ajuste as premissas: ${shareUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Simulador de bolso · Águas Lindas', text, url: shareUrl });
        flashShareStatus('Compartilhado');
        return;
      }
      const copied = await copyText(text);
      flashShareStatus(copied ? 'Cenário copiado' : 'Não foi possível compartilhar');
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') flashShareStatus('Não foi possível compartilhar');
    }
  };

  return (
    <section id="transporte" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="transporte-title">
      <SectionHeader
        titleId="transporte-title"
        eyebrow="Mobilidade"
        title="Simulador de bolso"
        description={`Informe quantos dias por semana você faz o trajeto, veja o custo mensal e compare esse gasto com uma renda de referência. O padrão é o salário mínimo de ${minimumWageYear} e pode ser ajustado.`}
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
              max={20}
              step={1}
              value={people}
              onChange={event => setPeople(Number(event.target.value))}
              aria-label="Quantidade de pessoas da família que usam o ônibus"
            />
            <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-500">
              <span>1 pessoa</span>
              <span>20 pessoas</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 light:bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <BusFront className="h-4 w-4 text-sky-300" aria-hidden="true" />
                Total do cenário / mês
              </div>
              <div className="mt-2 text-3xl font-black text-white light:text-slate-900">{formatBRL(result.monthlyTotalBrl)}</div>
              <div className="mt-1 text-xs text-slate-500">{formatBRL(route.fareBrl)} por trecho · valor calculado para {people} {people === 1 ? 'pessoa' : 'pessoas'}</div>
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
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                {salaryIsDefault ? `padrão · salário mínimo ${minimumWageYear}` : 'valor ajustado pelo usuário'}
              </div>
            </div>
          </div>
        </div>

        <TransportRouteComparisonGrid
          comparisons={routeComparisons}
          activeRouteId={route.id}
          trips={trips}
          daysPerWeek={daysPerWeek}
          onSelectRoute={setRouteId}
        />

        <details className="mt-6 rounded-2xl border border-white/8 bg-black/10 p-4 light:bg-slate-50">
          <summary className="cursor-pointer list-none text-sm font-bold text-slate-300 light:text-slate-700">
            Ajustar premissas do cálculo
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-slate-300 light:text-slate-700">
              Destino
              <select className="transport-input mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" value={route.id} onChange={event => setRouteId(event.target.value)}>
                {routes.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Trechos por dia
              <input className="transport-input mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={8} value={trips} onChange={event => setTrips(Math.min(8, Math.max(1, Number.isFinite(Number(event.target.value)) ? Math.trunc(Number(event.target.value)) : 1)))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Dias por semana
              <input className="transport-input mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={7} value={daysPerWeek} onChange={event => setDaysPerWeek(Math.min(7, Math.max(1, Number.isFinite(Number(event.target.value)) ? Math.trunc(Number(event.target.value)) : 1)))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Pessoas
              <input className="transport-input mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} max={20} value={people} onChange={event => setPeople(Math.min(20, Math.max(1, Number.isFinite(Number(event.target.value)) ? Math.trunc(Number(event.target.value)) : 1)))} />
            </label>
            <label className="text-sm text-slate-300 light:text-slate-700">
              Renda de referência
              <input className="transport-input mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0b1117] px-3 text-sm text-white outline-none focus:border-sky-300/40 light:bg-white light:text-slate-900" type="number" min={1} step={1} value={salary} onChange={event => setSalary(Math.min(1_000_000, Math.max(1, Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : 1)))} />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={resetScenario}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-400 hover:border-sky-300/20 hover:text-white light:border-slate-200 light:text-slate-600 light:hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Restaurar padrão
            </button>
          </div>
        </details>

        <div className="mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.025] p-4 text-xs leading-5 text-slate-400">
          <strong className="text-slate-300 light:text-slate-700">Integração em acompanhamento:</strong> Águas Lindas foi definida como projeto-piloto para integração do transporte no Entorno, com previsão de terminal de integração e unificação da bilhetagem. O observatório registra isso como iniciativa pública em acompanhamento, não como obra concluída.
          <a className="ml-1 inline-flex items-center gap-1 font-bold text-sky-300 hover:text-sky-200" href="https://goias.gov.br/entorno/aguas-lindas-sera-projeto-piloto-para-integracao-do-transporte-no-entorno/" target="_blank" rel="noopener noreferrer" aria-label="Abrir fonte oficial sobre a integração do transporte no Entorno em nova aba">Fonte oficial <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300 light:text-slate-700">Como o cenário é calculado:</strong> tarifa × trechos/dia × dias/semana × 4,4 semanas/mês × pessoas.
          O resultado não considera vale-transporte, integrações, gratuidades, faltas ou feriados. O campo de renda é ajustável: o padrão é {formatBRL(defaultSalary)}, correspondente ao salário mínimo nacional de {minimumWageYear}, usado apenas como denominador de contexto.
        </div>
      </Card>
    </section>
  );
}
