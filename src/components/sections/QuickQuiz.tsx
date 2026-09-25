import { CheckCircle2, Lock, RotateCcw, Share2 } from 'lucide-react';
import { useState } from 'react';
import '../../assets/styles/quick-quiz.css';
import { readQuizBestScores, readQuizUnlockedPhase } from '../../lib/quizLeaderboard';

import { QUESTIONS_PER_LEVEL, QUIZ_LEVELS, QUIZ_TOTAL, QUESTION_BANK } from '../../data/quiz/questionBank';

export { QUESTIONS_PER_LEVEL, QUIZ_LEVELS, QUIZ_TOTAL, QUESTION_BANK } from '../../data/quiz/questionBank';


if (QUESTION_BANK.length !== QUIZ_TOTAL) {
  throw new Error('Contrato do quiz violado: QUESTION_BANK deve conter exatamente ' + QUIZ_TOTAL + ' perguntas.');
}
if (!QUIZ_LEVELS.every(level => QUESTION_BANK.filter(q => q.difficulty === level).length === QUESTIONS_PER_LEVEL)) {
  throw new Error('Contrato do quiz violado: cada nível deve conter exatamente ' + QUESTIONS_PER_LEVEL + ' perguntas.');
}

const PHASES = QUIZ_LEVELS.map((level, index) => ({ level, index, questions: QUESTION_BANK.filter(q => q.difficulty === level) }));
const PASS_THRESHOLD = Math.ceil(QUESTIONS_PER_LEVEL * 0.6);

export function QuickQuiz() {
  const [unlockedPhase, setUnlockedPhase] = useState(() => readQuizUnlockedPhase());
  const [activePhase, setActivePhase] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<readonly number[]>(() => readQuizBestScores());
  const [showResult, setShowResult] = useState(false);
  const [shared, setShared] = useState('');

  const phaseData = PHASES[activePhase];
  const questions = phaseData?.questions ?? [];
  const totalQuestions = questions.length;
  const safeIndex = Math.min(index, totalQuestions - 1);
  const question = totalQuestions > 0 ? questions[safeIndex] : undefined;
  const nextIndex = safeIndex + 1;
  const isLast = nextIndex >= totalQuestions;
  const unlockedNext = activePhase < QUIZ_LEVELS.length - 1 && unlockedPhase > activePhase;
  const displayedScore = score;

  const startPhase = (phaseIndex: number) => {
    setActivePhase(phaseIndex);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setShared('');
  };

  const answer = (optionIndex: number) => {
    if (selected !== null || !question) return;
    setSelected(optionIndex);
    if (optionIndex === question.answerIndex) setScore(previous => previous + 1);
  };

  const next = () => {
    if (selected === null || !question) return;
    if (isLast) {
      // O clique em "Próxima" pode ocorrer antes de o update de score ser refletido nesta closure.
      const finalScore = score + (selected === question.answerIndex ? 1 : 0);
      const nextScores = best.map((value, phaseIndex) => (phaseIndex === activePhase ? Math.max(value, finalScore) : value));
      setBest(nextScores);
      if (finalScore >= PASS_THRESHOLD && activePhase < QUIZ_LEVELS.length - 1) {
        setUnlockedPhase(previous => Math.max(previous, activePhase + 1));
      }
      setShowResult(true);
      return;
    }
    setIndex(nextIndex);
    setSelected(null);
  };

  const restart = () => startPhase(activePhase);

  const share = async () => {
    const text = 'Observatório Eleitoral Águas Lindas 2026 — quiz: ' + displayedScore + ' de ' + QUESTIONS_PER_LEVEL + ' acertos na fase ' + (activePhase + 1) + ' (' + (phaseData?.level ?? '') + ').';
    try {
      if (navigator.share) {
        await navigator.share({ text });
        setShared('Compartilhado!');
      } else {
        await navigator.clipboard.writeText(text);
        setShared('Copiado!');
      }
    } catch {
      setShared('');
    }
  };

  return (
    <section id="quiz" className="quiz-shell" aria-labelledby="quiz-title">
      <header className="quiz-head">
        <p className="quiz-kicker">Aprenda conferindo as fontes</p>
        <h2 id="quiz-title">Quiz de dados · 2026</h2>
        <p className="quiz-subtitle">{QUIZ_TOTAL} perguntas · {QUIZ_LEVELS.length} fases · 40 por fase. Cada resposta mostra sua fonte.</p>
      </header>

      <div className="quiz-phase-grid" aria-label="Fases do quiz">
        {PHASES.map((phase, index) => {
          const locked = index > unlockedPhase;
          const isActive = index === activePhase && !showResult;
          const phaseBest = best[index] ?? 0;
          return (
            <button
              key={phase.level}
              type="button"
              disabled={locked}
              aria-disabled={locked}
              aria-label={locked ? 'Fase ' + (index + 1) + ', ' + phase.level + ', bloqueada. Libere com 60% na fase anterior.' : 'Fase ' + (index + 1) + ', ' + phase.level + ', disponível.'}
              onClick={() => startPhase(index)}
              className={'quiz-phase-card' + (isActive ? ' is-active' : '') + (locked ? ' is-locked' : '')}
            >
              <span className="quiz-phase-kicker">Fase {index + 1}</span>
              <strong className="quiz-phase-name">{phase.level}</strong>
              <span className="quiz-phase-meta">{locked ? 'Bloqueada' : QUESTIONS_PER_LEVEL + ' perguntas'}</span>
              <span className="quiz-phase-best">{locked ? 'Complete a fase anterior com 60% para liberar' : 'Melhor marca: ' + phaseBest + '/' + QUESTIONS_PER_LEVEL}</span>
              {locked ? <Lock className="quiz-phase-lock" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      {showResult ? (
        <div className="quiz-card quiz-result" role="status">
          <CheckCircle2 className="quiz-result-icon" aria-hidden="true" />
          <h3>Fase {activePhase + 1} · {phaseData?.level} concluída</h3>
          <p className="quiz-result-score">{displayedScore} de {QUESTIONS_PER_LEVEL} acertos</p>
          <p className="quiz-result-hint">{displayedScore >= PASS_THRESHOLD ? 'Sua melhor marca fica salva neste dispositivo. A fonte de cada resposta está disponível no painel de fontes.' : 'Revise o Resumo e tente novamente. A próxima fase exige 60% de acertos.'}</p>
          <div className="quiz-result-actions">
            <button type="button" onClick={restart} className="quiz-action"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Refazer fase</button>
            <button type="button" onClick={() => { void share(); }} className="quiz-action"><Share2 className="h-4 w-4" aria-hidden="true" /> Compartilhar</button>
            {unlockedNext ? (
              <button type="button" onClick={() => startPhase(activePhase + 1)} className="quiz-action is-primary">Próxima fase →</button>
            ) : null}
          </div>
          {shared ? <span className="quiz-shared" role="status">{shared}</span> : null}
        </div>
      ) : null}

      {!showResult && question ? (
        <div className="quiz-card">
          <div className="quiz-progress" aria-label={'Pergunta ' + (safeIndex + 1) + ' de ' + totalQuestions}>
            <div className="quiz-progress-track">
              <div className="quiz-progress-fill" style={{ width: (((safeIndex + (selected !== null ? 1 : 0)) / totalQuestions) * 100) + '%' }} />
            </div>
            <span className="quiz-progress-label">{safeIndex + 1} / {totalQuestions}</span>
          </div>
          <p className="quiz-prompt">{question.prompt}</p>
          <div className="quiz-options" role="group" aria-label="Alternativas">
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const reveal = selected !== null;
              const isCorrect = optionIndex === question.answerIndex;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => answer(optionIndex)}
                  disabled={reveal}
                  aria-pressed={isSelected}
                  className={'quiz-option' + (isSelected ? ' is-selected' : '') + (reveal && isCorrect ? ' is-correct' : '') + (reveal && isSelected && !isCorrect ? ' is-wrong' : '')}
                >
                  <span className="quiz-option-dot" aria-hidden="true" />
                  <span className="quiz-option-text">{option}</span>
                  {reveal && isCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
          {selected !== null ? (
            <div className={'quiz-feedback ' + (selected === question.answerIndex ? 'correct' : 'wrong')} role="status">
              <strong>{selected === question.answerIndex ? 'Resposta correta' : 'Resposta conferida'}</strong>
              <p>{question.explanation}</p>
            </div>
          ) : null}
          <div className="quiz-footer">
            <span>{selected !== null ? 'Resposta registrada' : 'Escolha uma resposta'}</span>
            <button type="button" onClick={next} disabled={selected === null} className="quiz-next">
              {isLast ? 'Finalizar fase' : 'Próxima'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
