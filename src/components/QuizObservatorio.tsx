import { useState } from 'react';

const questions = [
  {
    text: 'O que o Observatório apresenta?',
    options: ['Dados e análises públicas', 'Resultados oficiais futuros', 'Opiniões sem fonte'],
    answer: 0,
  },
  {
    text: 'Qual fonte é referência para dados eleitorais oficiais?',
    options: ['TSE', 'Comentários online', 'Enquetes informais'],
    answer: 0,
  },
  {
    text: 'Como interpretar uma análise derivada?',
    options: ['Entendendo a origem e o método', 'Como garantia de previsão', 'Sem verificar a fonte'],
    answer: 0,
  },
  {
    text: 'Qual é a melhor forma de usar o Observatório?',
    options: ['Comparar informações e consultar fontes', 'Substituir todos os dados oficiais', 'Ignorar contexto'],
    answer: 0,
  },
];

export function QuizObservatorio() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const choose = (index: number) => {
    if (index === questions[step].answer) setScore((value) => value + 1);
    if (step === questions.length - 1) setFinished(true);
    else setStep((value) => value + 1);
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setFinished(false);
  };

  return (
    <section id="quiz" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="text-xs font-bold uppercase tracking-wider text-sky-300">Interação</div>
      <h2 className="mt-2 text-xl font-black text-white">Teste seus conhecimentos sobre o Observatório</h2>

      {finished ? (
        <div className="mt-5">
          <p className="text-sm text-slate-300">Você acertou {score} de {questions.length} perguntas.</p>
          <button type="button" onClick={restart} className="mt-4 rounded-xl bg-sky-300 px-4 py-2 font-bold text-slate-950">
            Refazer quiz
          </button>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm font-bold text-white">{questions[step].text}</p>
          <div className="mt-4 grid gap-3">
            {questions[step].options.map((option, index) => (
              <button key={option} type="button" onClick={() => choose(index)} className="rounded-xl border border-white/10 p-3 text-left text-sm text-white transition hover:bg-white/10">
                {option}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">Pergunta {step + 1} de {questions.length}</p>
        </>
      )}
    </section>
  );
}
