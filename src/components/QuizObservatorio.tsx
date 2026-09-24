import { useMemo, useState } from 'react';

const questions = [
  { text: 'Qual é a proposta principal do Observatório?', options: ['Organizar dados públicos para facilitar a compreensão', 'Divulgar previsões eleitorais garantidas', 'Substituir órgãos oficiais'], answer: 0 },
  { text: 'Qual instituição é referência para dados eleitorais oficiais?', options: ['TSE', 'Comentários de redes sociais', 'Enquetes sem metodologia'], answer: 0 },
  { text: 'Ao ver uma análise, o que deve ser observado?', options: ['Fonte, contexto e explicação dos dados', 'Somente o resultado final', 'Apenas opiniões pessoais'], answer: 0 },
  { text: 'Como aproveitar melhor o Observatório?', options: ['Comparando informações e explorando os dados', 'Tratando análises como certezas futuras', 'Ignorando as fontes'], answer: 0 },
  { text: 'Qual é a função dos dados públicos?', options: ['Ajudar na compreensão da realidade local', 'Criar resultados sem análise', 'Eliminar a necessidade de fontes'], answer: 0 },
] as const;

export function QuizObservatorio() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const progress = useMemo(() => ((step + (finished ? 1 : 0)) / questions.length) * 100, [step, finished]);

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
    setCopied(false);
  };

  const share = async () => {
    const text = 'Fiz o Quiz do Observatório: acertei ' + score + ' de ' + questions.length + ' perguntas.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Quiz do Observatório', text, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="quiz" aria-labelledby="quiz-title" className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="text-xs font-bold uppercase tracking-wider text-sky-300">Interação</div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h2 id="quiz-title" className="text-xl font-black text-white">Teste seus conhecimentos sobre o Observatório</h2>
          <p className="mt-1 text-sm text-slate-400">Responda às perguntas e veja seu resultado.</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">5 perguntas</span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={'Progresso: ' + Math.round(progress) + '%'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <div className="h-full rounded-full bg-sky-300 transition-all duration-300" style={{ width: Math.min(100, progress) + '%' }} />
      </div>

      {finished ? (
        <div className="mt-6 rounded-2xl border border-sky-300/15 bg-sky-300/5 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Resultado</p>
          <p className="mt-2 text-3xl font-black text-white">{score}/{questions.length}</p>
          <p className="mt-1 text-sm text-slate-300">
            Você acertou {score === questions.length ? 'todas as perguntas' : score + ' de ' + questions.length}.
            Continue explorando os dados e fontes do projeto.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={restart} className="min-h-11 rounded-xl bg-sky-300 px-4 py-2 font-bold text-slate-950">Refazer quiz</button>
            <button type="button" onClick={share} className="min-h-11 rounded-xl border border-white/10 px-4 py-2 font-bold text-white hover:bg-white/10">
              {copied ? 'Resultado copiado' : 'Compartilhar resultado'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex justify-between text-xs text-slate-400">
            <span>Pergunta {step + 1} de {questions.length}</span>
            <span>{score} ponto{score === 1 ? '' : 's'}</span>
          </div>
          <p className="mt-4 text-base font-bold leading-6 text-white">{questions[step].text}</p>
          <div className="mt-4 grid gap-3">
            {questions[step].options.map((option, index) => {
              const selected = answered === index;
              const correct = answered !== null && index === questions[step].answer;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={answered !== null}
                  aria-pressed={selected}
                  onClick={() => choose(index)}
                  className={'min-h-12 rounded-xl border p-3 text-left text-sm text-white transition ' + (
                    selected
                      ? 'border-sky-300 bg-sky-300/10'
                      : correct
                        ? 'border-emerald-300/50 bg-emerald-300/5'
                        : 'border-white/10 hover:bg-white/10'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
