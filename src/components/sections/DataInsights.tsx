import { useMemo, useState } from 'react';
import { ArrowRight, Brain, CheckCircle2, HeartPulse, Route, Users, XCircle } from 'lucide-react';
import { observatorioData as d } from '../../data/observatorioData';
import { dispatchInspect } from '../DataInspector';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const formatBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function DataInsights() {
  const [routeId, setRouteId] = useState('taguatinga');
  const [beds, setBeds] = useState(d.health.currentStatedWardBeds + d.health.currentStatedIcuBeds);
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);
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
    { question: 'Qual é a população estimada de 2026?', options: ['245.352', '249.978', '250.391'], correct: 1, explanation: 'A estimativa populacional usada nesta edição é de 249.978 habitantes, com referência em 1º de julho de 2026.', sourceId: 'ibge-estimativas-2026' },
    { question: 'Qual é a tarifa informada para Brasília?', options: ['R$ 7,65', 'R$ 11,45', 'R$ 5,85'], correct: 1, explanation: 'O valor atual usado pelo observatório para Brasília é R$ 11,45 por trecho; Taguatinga e Ceilândia aparecem separadamente.', sourceId: 'utb-tarifas' },
    { question: 'Quantos leitos são explicitados atualmente no portal do HEAL?', options: ['53', '85', '164'], correct: 1, explanation: 'A página atual da SES-GO explicita 32 leitos de enfermaria e 53 de UTI, totalizando 85 leitos.', sourceId: 'healgo' },
    { question: 'Qual é o acesso ao serviço público de esgoto no recorte SINISA 2024?', options: ['49,7%', '84,8%', '95,8%'], correct: 1, explanation: 'O recorte SINISA 2024 usado pelo observatório registra 84,8% de acesso ao serviço público de esgoto.', sourceId: 'sinisa-2024' },
    { question: 'Qual é o acesso à água no recorte SINISA 2024?', options: ['60,1%', '84,8%', '95,8%'], correct: 2, explanation: 'O recorte SINISA 2024 usado pelo observatório registra 95,8% de acesso à água.', sourceId: 'sinisa-2024' },
  ];
  const currentQuestion = questions[quizStep];
  const answer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === currentQuestion.correct) setScore(value => value + 1);
  };
  const next = () => {
    if (quizStep < questions.length - 1) { setQuizStep(value => value + 1); setSelectedAnswer(null); }
    else setQuizDone(true);
  };
  const restart = () => { setQuizStep(0); setScore(0); setSelectedAnswer(null); setQuizDone(false); };
  const shareHeal = async () => {
    const text = `Simulador HEAL · ${beds} leitos. Cenário derivado: ${Math.round(pressure.perBed).toLocaleString('pt-BR')} atendimentos por leito e ${Math.max(0, pressure.reduction).toFixed(1).replace('.', ',')}% de redução teórica da pressão em relação à referência. #healgo`;
    try {
      if (navigator.share) { await navigator.share({ title: 'Simulador HEAL · Observatório', text, url: window.location.href + '#healgo' }); return; }
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text + '\\n' + window.location.href + '#healgo');
    } catch {}
  };

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

        <Card id="quiz">
          <div className="flex items-center gap-3"><Brain className="h-5 w-5 text-violet-300" aria-hidden="true" /><div><h3 className="text-lg font-black text-white">Quiz do observatório</h3><p className="text-xs text-slate-400">Teste a leitura dos dados desta edição. As perguntas usam registros e indicadores já presentes no dataset publicado.</p></div></div>
          {!quizDone ? <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-xs text-slate-500">Pergunta {quizStep + 1} de {questions.length} · acertos: {score}</div>
            <h4 className="mt-2 text-base font-bold text-white">{currentQuestion.question}</h4>
            <div className="mt-4 grid gap-2">{currentQuestion.options.map((option, index) => {
              const selected = selectedAnswer === index, correct = index === currentQuestion.correct;
              const cls = selectedAnswer === null ? 'border-white/10 hover:bg-white/[0.04]' : correct ? 'border-emerald-300/40 bg-emerald-300/10' : selected ? 'border-rose-300/40 bg-rose-300/10' : 'border-white/10 opacity-60';
              return <button key={option} type="button" disabled={selectedAnswer !== null} onClick={() => answer(index)} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm text-slate-300 ${cls}`}><span>{option}</span>{selectedAnswer !== null && correct ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : selected && !correct ? <XCircle className="h-4 w-4 text-rose-300" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}</button>;
            })}</div>
            {selectedAnswer !== null && <div className="mt-4 rounded-xl border border-white/8 p-3 text-xs leading-5 text-slate-400"><strong className="text-slate-300">{selectedAnswer === currentQuestion.correct ? 'Resposta correta.' : 'Resposta incorreta.'}</strong> {currentQuestion.explanation}<button type="button" onClick={() => dispatchInspect({ label: currentQuestion.question, value: currentQuestion.options[currentQuestion.correct], sourceId: currentQuestion.sourceId, status: 'explicação', note: currentQuestion.explanation })} className="ml-2 font-bold text-sky-300">Ver fonte</button></div>}
            {selectedAnswer !== null && <button type="button" onClick={next} className="mt-3 rounded-xl bg-sky-300 px-4 py-2 text-xs font-black text-slate-950">{quizStep === questions.length - 1 ? 'Ver resultado' : 'Próxima pergunta'}</button>}
          </div> : <div className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-300/5 p-5"><div className="text-xs uppercase tracking-wider text-slate-500">Resultado</div><div className="mt-2 text-4xl font-black text-white">{score}/{questions.length}</div><p className="mt-2 text-sm text-slate-400">Você concluiu as três perguntas. O resultado é apenas uma interação de leitura, não uma avaliação política.</p><button type="button" onClick={restart} className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300">Refazer quiz</button></div>}
        </Card>
      </div>
    </section>
  );
}
