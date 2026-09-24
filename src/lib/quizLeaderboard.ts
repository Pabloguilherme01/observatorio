import { STORAGE_NAMESPACE } from '../config/version';

export type QuizHighScore = {
  readonly id: string;
  readonly phase: number;
  readonly level: string;
  readonly score: number;
  readonly total: number;
  readonly percentage: number;
  readonly playedAt: string;
};

const KEY = STORAGE_NAMESPACE + '-quiz-high-scores';
const LIMIT = 10;

function readRaw(): QuizHighScore[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.filter(item =>
      item
      && typeof item.id === 'string'
      && Number.isInteger(item.phase)
      && typeof item.level === 'string'
      && Number.isInteger(item.score)
      && Number.isInteger(item.total)
      && typeof item.percentage === 'number'
      && typeof item.playedAt === 'string'
    );
  } catch {
    return [];
  }
}

function sortScores(scores: readonly QuizHighScore[]): QuizHighScore[] {
  return [...scores]
    .sort((a, b) =>
      b.score - a.score
      || b.percentage - a.percentage
      || b.phase - a.phase
      || b.playedAt.localeCompare(a.playedAt)
    )
    .slice(0, LIMIT);
}

export function readQuizHighScores(): readonly QuizHighScore[] {
  return sortScores(readRaw());
}

export function recordQuizHighScore(entry: Omit<QuizHighScore, 'id'>): readonly QuizHighScore[] {
  const next = sortScores([
    ...readRaw(),
    { ...entry, id: entry.playedAt + '-' + entry.phase + '-' + entry.score + '-' + Math.random().toString(36).slice(2, 8) },
  ]);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
