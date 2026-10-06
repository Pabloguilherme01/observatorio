import { observatorioData as d } from '../../data/observatorioData';
import { calculateTransportCost, formatBRL } from '../../lib/transport';

type TransportRoute = (typeof d.transport.routes)[number];
type TransportResult = ReturnType<typeof calculateTransportCost>;

interface RouteComparison {
  readonly route: TransportRoute;
  readonly result: TransportResult;
}

interface TransportRouteComparisonGridProps {
  readonly comparisons: readonly RouteComparison[];
  readonly activeRouteId: string;
  readonly trips: number;
  readonly daysPerWeek: number;
  readonly onSelectRoute: (routeId: string) => void;
}

export function TransportRouteComparisonGrid({
  comparisons,
  activeRouteId,
  trips,
  daysPerWeek,
  onSelectRoute,
}: TransportRouteComparisonGridProps) {
  return (
    <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.018] p-4 light:border-slate-200 light:bg-slate-50/70">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300/80 light:text-sky-700">Comparação de rotas</div>
          <h3 className="mt-1 text-base font-black text-white light:text-slate-900">Mesmo cenário, destinos diferentes</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">Os três cartões usam os mesmos trechos por dia, dias por semana e renda de referência. A comparação é descritiva e não inclui integrações, gratuidades ou vale-transporte.</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">{trips} trechos/dia · {daysPerWeek} dias/semana</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3" aria-label="Comparação de custo mensal entre rotas">
        {comparisons.map(({ route, result }) => {
          const isActive = route.id === activeRouteId;
          return (
            <button
              key={route.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectRoute(route.id)}
              className={"metric-interactive rounded-2xl border p-4 text-left " + (isActive ? "border-sky-300/30 bg-sky-300/[0.055]" : "border-white/8 bg-black/10 hover:border-sky-300/20 light:bg-white")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-300 light:text-slate-700">{route.label}</div>
                  <div className="mt-2 text-2xl font-black text-white light:text-slate-900">{formatBRL(result.monthlyPerPersonBrl)}</div>
                  <div className="mt-1 text-[11px] text-slate-500">por pessoa/mês · tarifa {formatBRL(route.fareBrl)}</div>
                </div>
                {isActive && <span className="rounded-full border border-sky-300/20 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-sky-300">Em uso</span>}
              </div>
              <div className="mt-3 text-[11px] text-slate-500">
                {(result.monthlyPctOfSalaryPerPerson ?? 0).toFixed(1).replace('.', ',')}% da renda de referência
              </div>
              <span className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-wide text-sky-300/80">{isActive ? 'Rota selecionada' : 'Usar esta rota'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
