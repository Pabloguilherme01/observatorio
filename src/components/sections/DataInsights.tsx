import { useMemo, useState } from 'react';
import { ArrowRight, Brain, HeartPulse, Route, Users } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const formatBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function DataInsights() {
  const [routeId, setRouteId] = useState('taguatinga');
  const [beds, setBeds] = useState(d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds);
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);

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
  const questions = [
    { question: 'Qual é a população estimada de 2026?', options: ['245.352', '249.978', '250.391'], correct: 1 },
    { question: 'Qual é a tarifa informada para Brasília?', options: ['R$ 7,65', 'R$ 11,43', 'R$ 5,85'], correct: 1 },
    { question: 'Qual faixa de Ideb 2025 foi registrada no levantamento desta edição?', options: ['5,0–5,4', '5,9–6,2', '6,5–6,9'], correct: 1 },
  ];
  const currentQuestion = questions[quizStep];

  return (
    <section id="insights" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="insights-title">
      <SectionHeader titleId="insights-title" eyebrow="Exploração" title="Comparadores e simuladores" description="Ferramentas interativas para explorar os dados sem produzir ranking ou recomendação eleitoral." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card id="rotas">
          <div className="flex items-center gap-3"><Route className="h-5 w-5 text-sky-300" aria-hidden="true" /><div><h3 className="text-lg font-black text-white">Comparativa de rotas</h3><p className="text-xs text-slate-400">Economia matemática em relação ao trecho para Brasília.</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {d.transport.routes.map(route => (
              <button key={route.id} type="button" onClick={() => setRouteId(route.id)} aria-pressed={route.id === selectedRoute.id} className={`rounded-2xl border p-3 text-left transition ${route.id === selectedRoute.id ? 'border-sky-300/50 bg-sky-300/10' : 'border-white/10 bg-white/[0.02]'}`}>
                <span className="block text-xs text-slate-400">{route.label.replace('Águas Lindas → ', '')}</span>
                <strong className="mt-2 block text-lg text-white">{formatBRL(route.fareBrl)}</strong>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between text-sm"><span className="text-slate-400">Diferença por trecho</span><strong className="text-white">{formatBRL(Math.abs(brasilia.fareBrl - selectedRoute.fareBrl))}</strong></div>
            <div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-400">Economia no cenário padrão/mês</span><strong className="text-emerald-300">{formatBRL(monthlySavings)}</strong></div>
            <div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-400">Variação relativa</span><strong className="text-white">{savingsShare.toFixed(1).replace('.', ',')}%</strong></div>
          </div>
        </Card>

        <Card id="healgo">
          <div className="flex items-center gap-3"><HeartPulse className="h-5 w-5 text-rose-300" aria-hidden="true" /><div><h3 className="text-lg font-black text-white">Simulador de capacidade HEAL</h3><p className="text-xs text-slate-400">Explora 164 leitos reportados na inauguração até 298 planejados.</p></div></div>
          <label className="mt-5 block text-sm text-slate-300" htmlFor="heal-beds">Leitos simulados: <strong className="text-white">{beds}</strong></label>
          <input id="heal-beds" type="range" min={164} max={298} value={beds} onChange={event => setBeds(clamp(Number(event.target.value), 164, 298))} className="mt-3 w-full accent-sky-300" aria-valuemin={164} aria-valuemax={298} aria-valuenow={beds} aria-valuetext={`${beds} leitos`} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/[0.02] p-3"><span className="block text-xs text-slate-500">Atend./leito</span><strong className="mt-1 block text-lg text-white">{Math.round(pressure.perBed).toLocaleString('pt-BR')}</strong></div>
            <div className="rounded-2xl bg-white/[0.02] p-3"><span className="block text-xs text-slate-500">Redução</span><strong className="mt-1 block text-lg text-white">{Math.max(0, pressure.reduction).toFixed(1).replace('.', ',')}%</strong></div>
            <div className="rounded-2xl bg-white/[0.02] p-3"><span className="block text-xs text-slate-500">Leitura</span><strong className="mt-1 block text-lg text-white">{pressure.status}</strong></div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">A classificação é uma heurística deste simulador, não uma classificação oficial do hospital. Capacidade instalada e planejamento permanecem separados.</p>
        </Card>

        <Card id="perfil-etario">
          <div className="flex items-center gap-3"><Users className="h-5 w-5 text-sky-300" aria-hidden="true" /><div><h3 className="text-lg font-black text-white">Perfil do eleitorado</h3><p className="text-xs text-slate-400">Distribuição do snapshot eleitoral usado nesta edição.</p></div></div>
          <div className="mt-5 grid gap-5 md:grid-cols-[150px_1fr] md:items-center">
            <div className="mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full border-[18px] border-sky-300/50 bg-transparent" role="img" aria-label={`Distribuição por gênero: ${d.electoral.womenPct}% mulheres e ${d.electoral.menPct}% homens`}>
              <strong className="text-xl text-white">{d.electoral.womenPct}%</strong><span className="text-[10px] text-slate-500">mulheres</span>
            </div>
            <div className="space-y-3">
              {d.electoral.ageGroups.map(group => <div key={group.id}><div className="flex justify-between text-xs"><span className="text-slate-400">{group.label}</span><strong className="text-white">{group.sharePct}%</strong></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-300" style={{ width: `${group.sharePct}%` }} /></div><div className="mt-1 text-[11px] text-slate-600">{group.voters.toLocaleString('pt-BR')} eleitores</div></div>)}
              <p className="text-[11px] text-slate-600">Soma do recorte etário: {ageTotal.toLocaleString('pt-BR')} eleitores.</p>
            </div>
          </div>
        </Card>

        <Card id="quiz">
          <div className="flex items-center gap-3"><Brain className="h-5 w-5 text-violet-300" aria-hidden="true" /><div><h3 className="text-lg font-black text-white">Quiz do observatório</h3><p className="text-xs text-slate-400">Teste a leitura dos dados desta edição.</p></div></div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-xs text-slate-500">Pergunta {quizStep + 1} de {questions.length} · acertos: {score}</div>
            <h4 className="mt-2 text-base font-bold text-white">{currentQuestion.question}</h4>
            <div className="mt-4 grid gap-2">{currentQuestion.options.map((option, index) => <button key={option} type="button" onClick={() => { if (index === currentQuestion.correct) setScore(value => value + 1); setQuizStep(value => value < questions.length - 1 ? value + 1 : 0); }} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.04]"><span>{option}</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>)}</div>
          </div>
        </Card>
      </div>
    </section>
  );
}
