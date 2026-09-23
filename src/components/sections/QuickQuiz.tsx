import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

type Question = {
  readonly prompt: string;
  readonly options: readonly string[];
  readonly answer: number;
  readonly explanation: string;
  readonly anchor: string;
  readonly sourceLabel: string;
};

export function QuickQuiz() {
  const questions = useMemo<readonly Question[]>(() => [
    { prompt: 'Para ler um número público, o que deve vir junto dele?', options: ['Fonte e data', 'Só o número', 'A cor do gráfico'], answer: 0, explanation: 'Fonte e data mostram de onde veio o dado e qual período ele representa.', anchor: 'fontes', sourceLabel: 'Fontes' },
    { prompt: 'Um snapshot do eleitorado é melhor entendido como:', options: ['Uma fotografia da base em uma data', 'Uma previsão do resultado', 'Uma pesquisa de intenção de voto'], answer: 0, explanation: 'Snapshot é uma fotografia de uma base. Não é previsão nem resultado.', anchor: 'eleitorado', sourceLabel: 'Eleitorado' },
    { prompt: 'A LOA 2026 mostra principalmente:', options: ['Planejamento orçamentário do exercício', 'Gasto já pago em 100%', 'Pesquisa de opinião'], answer: 0, explanation: 'A LOA é uma peça de planejamento. Ela não deve ser confundida com execução financeira.', anchor: 'orcamento', sourceLabel: 'Orçamento' },
    { prompt: 'Por que dois números podem não ser comparáveis diretamente?', options: ['Datas, universos ou métodos podem ser diferentes', 'O número maior sempre é melhor', 'As cores dos gráficos mudam'], answer: 0, explanation: 'Sem mesma data, universo e metodologia, uma comparação pode ser enganosa.', anchor: 'principios', sourceLabel: 'Princípios' },
    { prompt: 'O que significa “primeiro snapshot” no histórico?', options: ['É a linha de base', 'É um dado inventado', 'É o resultado final da eleição'], answer: 0, explanation: 'A primeira captura cria a linha de base. Diffs temporais reais começam na captura seguinte.', anchor: 'mudancas-snapshot', sourceLabel: 'Snapshots' },
    { prompt: 'Em 2026, quais cargos estão em disputa?', options: ['Presidente, governador, senador e deputados', 'Prefeito e vereador', 'Somente senador'], answer: 0, explanation: 'As Eleições Gerais de 2026 abrangem presidente, governadores, senadores, deputados federais e deputados estaduais ou distritais.', anchor: 'politica', sourceLabel: 'Eleições' },
    { prompt: 'Um indicador calculado pelo observatório deve ser lido como:', options: ['Resultado derivado de outros dados', 'Dado oficial isolado da fonte', 'Previsão eleitoral'], answer: 0, explanation: 'Indicadores derivados usam valores de uma ou mais fontes e têm método próprio.', anchor: 'qualidade', sourceLabel: 'Qualidade dos dados' },
    { prompt: 'Qual é a melhor forma de compartilhar um número?', options: ['Levar o link e a fonte junto', 'Enviar só o número', 'Recortar apenas o gráfico'], answer: 0, explanation: 'O link permite que outra pessoa confira a fonte, a data e o contexto.', anchor: 'acao', sourceLabel: 'Como usar' },
    { prompt: 'Quando o observatório diz “não informado pela fonte”, isso significa:', options: ['A fonte consultada não informou o campo', 'O projeto inventou um valor', 'O candidato não possui o dado'], answer: 0, explanation: 'A interface diferencia ausência de informação de um zero ou de um valor estimado.', anchor: 'eleitoral360', sourceLabel: 'Eleitoral 360°' },
    { prompt: 'Qual regra vale para a leitura eleitoral deste projeto?', options: ['Dados e fontes, sem ranking automático', 'Escolher o melhor candidato', 'Prever quem vai vencer'], answer: 0, explanation: 'O observatório organiza dados públicos e contexto sem atribuir ranking, escolha ou previsão.', anchor: 'principios', sourceLabel: 'Princípios' },
  ], []);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const finished = step >= questions.length;
  const current = questions[step];

  const choose = (index: number) => {
    if (selected !== null || !current) return;
    setSelected(index);
    if (index === current.answer) setScore(value => value + 1);
  };

  const next = () => {
    setSelected(null);
    setStep(value => value + 1);
  };

  const reset = () => {
    setStep(0);
    setSelected(null);
    setScore(0);
  };

  return (
    <section id="quiz" className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="quiz-title">
      <div className="quiz-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200/80">Aprendizado rápido</div>
            <h2 id="quiz-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">1 minuto para testar o que você entendeu</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Dez perguntas curtas. Cada resposta explica a regra e aponta para a área correspondente.</p>
          </div>
          {!finished && <div className="quiz-progress-wrap">
            <div className="quiz-progress" aria-label={`Pergunta ${step + 1} de ${questions.length}`}>
              <span>{String(step + 1).padStart(2, '0')}</span>/<span>{String(questions.length).padStart(2, '0')}</span>
            </div>
            <div className="quiz-progress-bar" aria-hidden="true"><span style={{ width: (((step + 1) / questions.length) * 100) + '%' }} /></div>
          </div>}
        </div>

        {!finished && current ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Pergunta {step + 1}</div>
              <h3 className="mt-3 text-xl font-black leading-tight text-white">{current.prompt}</h3>
              <div className="mt-5 grid gap-2">
                {current.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isCorrect = index === current.answer;
                  const state = selected === null
                    ? 'idle'
                    : isCorrect
                      ? 'correct'
                      : isSelected
                        ? 'wrong'
                        : 'muted';
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(index)}
                      disabled={selected !== null}
                      aria-pressed={isSelected}
                      className={`quiz-option ${state}`}
                    >
                      <span className="quiz-option-key">{String.fromCharCode(65 + index)}</span>
                      <span className="text-left">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-violet-300/10 bg-violet-300/[0.035] p-5">
              {selected === null ? (
                <>
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-200/80">Como usar</div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">Escolha uma resposta. A explicação aparece na hora e você pode seguir para a próxima.</p>
                  <div className="mt-5 rounded-2xl border border-white/8 bg-black/10 p-4 text-xs leading-5 text-slate-500">O objetivo é reforçar leitura crítica de dados, não testar conhecimento político.</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <CheckCircle2 className={selected === current.answer ? 'h-5 w-5 text-emerald-300' : 'h-5 w-5 text-amber-300'} aria-hidden="true" />
                    {selected === current.answer ? 'Resposta correta' : 'Resposta revisada'}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{current.explanation}</p>
                  <a href={`#${current.anchor}`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:border-violet-300/20">
                    Ver {current.sourceLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <button type="button" onClick={next} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-violet-300 px-4 py-2 text-xs font-black text-slate-950">
                    {step + 1 === questions.length ? 'Ver resultado' : 'Próxima pergunta'}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.04] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200/80">Resultado</div>
              <div className="mt-2 text-3xl font-black text-white">{score}/{questions.length}</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">Use o resultado como sinal de compreensão das regras de leitura do observatório, não como avaliação de pessoas, partidos ou candidatos.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#fontes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-300 px-4 py-2 text-xs font-black text-slate-950">Conferir fontes <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-200"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Refazer</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
