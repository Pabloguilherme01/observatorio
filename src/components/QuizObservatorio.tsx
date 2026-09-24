import { useState } from 'react';

const questions = [
  {
    text: 'Qual é a proposta principal do Observatório?',
    options: ['Organizar dados públicos para facilitar a compreensão', 'Divulgar previsões eleitorais garantidas', 'Substituir órgãos oficiais'],
    answer: 0,
  },
  {
    text: 'Qual instituição é referência para dados eleitorais oficiais?',
    options: ['TSE', 'Comentários de redes sociais', 'Enquetes sem metodologia'],
    answer: 0,
  },
  {
    text: 'Ao ver uma análise, o que deve ser observado?',
    options: ['Fonte, contexto e explicação dos dados', 'Somente o resultado final', 'Apenas opiniões pessoais'],
    answer: 0,
  },
  {
    text: 'Como aproveitar melhor o Observatório?',
    options: ['Comparando informações e explorando os dados', 'Tratando análises como certezas futuras', 'Ignorando as fontes'],
    answer: 0,
  },
  {
    text: 'Qual é a função dos dados públicos?',
    options: ['Ajudar na compreensão da realidade local', 'Criar resultados sem análise', 'Eliminar a necessidade de fontes'],
    answer: 0,
  },
];

export function QuizObservatorio() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState<number | null>(null);

  const choose = (index: number) => {
    if (answered !== null) return;
    setAnswered(index);
    if (index === questions[step].answer) setScore((value) => value + 1);

    window.setTimeout(() => {
      if (step === questions.length - 1) setFinished(true);
      else setStep((value) => value + 1);
      setAnswered(null);
    }, 450);
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setFinished(false);
    setAnswered(null);
  };

  return (
    <section id="quiz" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="text-xs font-bold uppercase tracking-wider text-sky-300">Interação</div>
      <h2 className="mt-2 text-xl font-black text-white">Teste seus conhecimentos sobre o Observatório</h2>

      {finished ? (
        <div className="mt-5">
          <p className="text-sm text-slate-300">Resultado: {score} de {questions.length} respostas corretas.</p>
          <p className="mt-2 text-xs text-slate-400">Continue explorando os dados e fontes do projeto.</p>
          <button type="button" onClick={restart} className="mt-4 rounded-xl bg-sky-300 px-4 py-2 font-bold text-slate-950">
            Refazer quiz
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 flex justify-between text-xs text-slate-400">
            <span>Pergunta {step + 1} de {questions.length}</span>
            <span>{score} pontos</span>
          </div>
          <p className="mt-4 text-sm font-bold text-white">{questions[step].text}</p>
          <div className="mt-4 grid gap-3">
            {questions[step].options.map((option, index) => (
              <button key={option} type="button" disabled={answered !== null} onClick={() => choose(index)} className={`rounded-xl border p-3 text-left text-sm text-white transition hover:bg-white/10 ${answered === index ? 'border-sky-300 bg-sky-300/10' : 'border-white/10'}`}>
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
