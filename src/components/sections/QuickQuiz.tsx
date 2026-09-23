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
    {
      prompt: 'Para interpretar um número público corretamente, o que vale conferir junto com ele?',
      options: ['Fonte e data de referência', 'A cor do gráfico', 'Somente o valor absoluto'],
      answer: 0,
      explanation: 'A fonte e a data ajudam a identificar de onde veio o dado e qual período ou fotografia ele representa.',
      anchor: 'fontes',
      sourceLabel: 'Mapa de evidências',
    },
    {
      prompt: 'Um snapshot do eleitorado representa melhor qual ideia?',
      options: ['Uma fotografia de uma base em determinada data', 'Uma previsão de voto', 'O resultado final da eleição'],
      answer: 0,
      explanation: 'O observatório trata snapshots como fotografias de uma base e evita transformá-los em previsão ou resultado eleitoral.',
      anchor: 'eleitorado',
      sourceLabel: 'Perfil eleitoral',
    },
    {
      prompt: 'Como ler a LOA 2026 dentro do observatório?',
      options: ['Como orçamento previsto para o exercício', 'Como gasto já executado integralmente', 'Como uma pesquisa de opinião'],
      answer: 0,
      explanation: 'A LOA é uma peça orçamentária de planejamento. O observatório separa valores previstos de valores efetivamente executados quando essa distinção é relevante.',
      anchor: 'orcamento',
      sourceLabel: 'Orçamento',
    },
    {
      prompt: 'Por que dois números podem não ser comparáveis diretamente?',
      options: ['Porque podem ter datas, universos ou metodologias diferentes', 'Porque um número maior é sempre melhor', 'Porque gráficos diferentes usam cores diferentes'],
      answer: 0,
      explanation: 'Datas de referência, denominadores e metodologias podem mudar o significado de uma comparação.',
      anchor: 'principios',
      sourceLabel: 'Princípios e correções',
    },
    {
      prompt: 'Onde conferir as fontes catalogadas pelo projeto?',
      options: ['No Mapa de evidências', 'Apenas no rodapé do navegador', 'Somente nas redes sociais'],
      answer: 0,
      explanation: 'O Mapa de evidências reúne instituição, natureza do dado, datas de referência e o link utilizado pelo observatório.',
      anchor: 'fontes',
      sourceLabel: 'Mapa de evidências',
    },
    {
      prompt: 'O que diferencia um dado observado de um cálculo derivado?',
      options: ['O observado vem da fonte; o derivado é calculado a partir de outros dados', 'O derivado é sempre mais importante', 'Não existe diferença entre os dois'],
      answer: 0,
      explanation: 'O projeto identifica quando um valor é reproduzido da fonte e quando resulta de uma operação calculada pelo observatório.',
      anchor: 'qualidade',
      sourceLabel: 'Qualidade dos dados',
    },
    {
      prompt: 'Por que a data de referência importa ao comparar dois indicadores?',
      options: ['Porque os indicadores podem representar momentos diferentes', 'Porque a data muda automaticamente o valor para melhor', 'Porque toda data é apenas informativa'],
      answer: 0,
      explanation: 'Dois números podem ser corretos e ainda assim não serem diretamente comparáveis se representam períodos diferentes.',
      anchor: 'fontes',
      sourceLabel: 'Fontes e metodologia',
    },
    {
      prompt: 'O que fazer quando um registro ainda não tem evidência municipal suficiente?',
      options: ['Mantê-lo como pendente e não tratá-lo como registro local validado', 'Inferir o município pelo nome', 'Publicá-lo como confirmado para completar a lista'],
      answer: 0,
      explanation: 'Quando falta evidência municipal, o observatório preserva o estado pendente em vez de transformar uma correspondência estadual em fato local.',
      anchor: 'candidaturas',
      sourceLabel: 'Candidaturas locais',
    },
    {
      prompt: 'Para que serve um link para a fonte oficial?',
      options: ['Permitir a conferência do registro original', 'Substituir a necessidade de ler a metodologia', 'Transformar uma estimativa em resultado'],
      answer: 0,
      explanation: 'A fonte oficial permite que a pessoa confira o dado diretamente na instituição responsável pela publicação original.',
      anchor: 'fontes',
      sourceLabel: 'Mapa de evidências',
    },
    {
      prompt: 'O que uma fonte secundária representa no catálogo do projeto?',
      options: ['Um material de apoio que não substitui a fonte oficial quando ela existe', 'Uma fonte automaticamente mais precisa', 'Um resultado eleitoral'],
      answer: 0,
      explanation: 'Fontes secundárias podem ajudar no contexto, mas são identificadas separadamente das fontes oficiais.',
      anchor: 'fontes',
      sourceLabel: 'Mapa de evidências',
    },
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
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Dez perguntas curtas. Cada resposta explica uma regra de leitura e aponta para a área correspondente do observatório.</p>
          </div>
          {!finished && <div className="quiz-progress-wrap">
            <div className="quiz-progress" aria-label={`Pergunta ${step + 1} de ${questions.length}`}>
              <span>{String(step + 1).padStart(2, '0')}</span>/<span>{String(questions.length).padStart(2, '0')}</span>
            </div>
            <div className="quiz-progress-track" aria-hidden="true">
              <span style={{ width: (((step + 1) / questions.length) * 100) + '%' }} />
            </div>
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
