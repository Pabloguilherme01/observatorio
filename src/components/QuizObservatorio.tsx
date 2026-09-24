import { useState } from 'react';

const questions = [
  {
    text: 'Qual é o objetivo principal do Observatório?',
    options: ['Analisar dados públicos', 'Prever resultados eleitorais', 'Substituir fontes oficiais'],
    answer: 0,
  },
  {
    text: 'Qual fonte é usada para dados eleitorais oficiais?',
    options: ['TSE', 'Redes sociais', 'Opiniões de usuários'],
    answer: 0,
  },
  {
    text: 'Como os dados derivados devem ser apresentados?',
    options: ['Como cálculos explicados', 'Como fatos sem contexto', 'Sem indicar origem'],
    answer: 0,
  },
];

export function QuizObservatorio() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const choose = (index: number) => {
    if (index === questions[step].answer) setScore(value => value + 1);
    if (step + 1 >= questions.length) setFinished(true);
    else setStep(value => value + 1);
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-black text-white">Resultado do quiz</h2>
        <p className="mt-2 text-sm text-slate-300">Você acertou {score} de {questions.length} perguntas.</p>
        <button type="button" onClick={restart} className="mt-4 rounded-xl bg-sky-300 px-4 py-2 font-bold text-slate-950">Tentar novamente</button>
      </section>
    );
  }

  const question = questions[step];

  return (
    <section id="quiz" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="text-xs font-bold uppercase tracking-wider text-sky-300">Quiz do Observatório</div>
      <h2 className="mt-2 text-xl font-black text-white">{question.text}</h2>
      <div className="mt-4 grid gap-3">
        {question.options.map((option, index) => (
          <button key={option} type="button" onClick={() => choose(index)} className="rounded-xl border border-white/10 p-3 text-left text-sm text-white hover:bg-white/10">
            {option}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">Pergunta {step + 1} de {questions.length}</p>
    </section>
  );
}
