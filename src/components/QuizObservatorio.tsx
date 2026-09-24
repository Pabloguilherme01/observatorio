import { useMemo, useState } from 'react';

const questions = [
  ['Para interpretar um número público corretamente, o que conferir junto?', ['Fonte e data de referência', 'Somente o gráfico', 'Apenas o valor'], 0],
  ['Qual é a função de uma fonte oficial?', ['Indicar a origem do dado', 'Garantir uma previsão futura', 'Substituir análise'], 0],
  ['Um snapshot representa:', ['Um recorte em determinado momento', 'Uma certeza permanente', 'Uma opinião'], 0],
  ['Ao comparar dados, é importante observar:', ['Período e metodologia', 'Somente cores', 'Somente títulos'], 0],
  ['Um cálculo derivado deve informar:', ['Como foi calculado', 'Apenas o resultado', 'Somente a imagem'], 0],
  ['Dados públicos devem ser lidos com:', ['Contexto e limitações', 'Pressa', 'Conclusões automáticas'], 0],
  ['Uma correção de dado deve apresentar:', ['Fonte para conferência', 'Apenas comentário', 'Novo número sem origem'], 0],
  ['O Observatório organiza:', ['Dados, fontes e evidências', 'Resultados eleitorais futuros', 'Opiniões pessoais'], 0],
  ['Uma comparação justa precisa:', ['Usar referências equivalentes', 'Misturar anos diferentes', 'Ignorar origem'], 0],
  ['A melhor forma de usar o projeto é:', ['Explorar dados e conferir fontes', 'Aceitar tudo sem verificar', 'Ignorar metodologia'], 0],
] as const;

export function QuizObservatorio() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const progress = useMemo(() => finished ? 100 : ((step) / questions.length) * 100, [step, finished]);

  function answer(index: number) {
    if (answered !== null) return;
    setAnswered(index);
    if (index === questions[step][2]) setScore(v => v + 1);
    setTimeout(() => {
      if (step === questions.length - 1) setFinished(true);
      else setStep(v => v + 1);
      setAnswered(null);
    }, 500);
  }

  function restart() {
    setStep(0); setScore(0); setFinished(false); setAnswered(null); setCopied(false);
  }

  async function share() {
    const text = `Fiz o Quiz do Observatório e acertei ${score}/10 perguntas.`;
    if (navigator.share) await navigator.share({ title: 'Quiz do Observatório', text, url: location.href });
    else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    }
  }

  return <section id="quiz" className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
    <p className="text-xs font-bold uppercase text-sky-300">Aprendizado rápido · 1 minuto</p>
    <h2 className="mt-2 text-xl font-black text-white">Teste sua leitura de dados</h2>
    <p className="mt-1 text-sm text-slate-400">Dez perguntas curtas. Cada resposta reforça uma regra de interpretação.</p>
    <div className="mt-5 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-300" style={{width: `${progress}%`}} /></div>
    {finished ? <div className="mt-6 rounded-2xl bg-white/5 p-5"><p className="text-3xl font-black text-white">{score}/10</p><p className="mt-2 text-slate-300">Resultado concluído. Continue conferindo fontes e limitações.</p><div className="mt-4 flex gap-2"><button onClick={restart} className="rounded-xl bg-sky-300 px-4 py-2 font-bold text-slate-950">Refazer</button><button onClick={share} className="rounded-xl border border-white/10 px-4 py-2 text-white">{copied ? 'Copiado' : 'Compartilhar'}</button></div></div> : <div className="mt-5"><p className="font-bold text-white">{String(step + 1).padStart(2,'0')} / 10</p><p className="mt-3 text-white">{questions[step][0]}</p><div className="mt-4 grid gap-3">{questions[step][1].map((option,i)=><button key={option} disabled={answered !== null} onClick={()=>answer(i)} className="rounded-xl border border-white/10 p-3 text-left text-white">{option}</button>)}</div></div>}
  </section>;
}
