const BASE_SCORE = 10;
const MAX_BONUS = 5;
const TIME_LIMIT_MS = 15000;

export function calculateScore(
  isCorrect: boolean,
  timeRemainingMs: number
): number {
  if (!isCorrect) {
    return 0;
  }

  const baseScore = BASE_SCORE;
  const speedBonus = calculateSpeedBonus(timeRemainingMs);
  return baseScore + speedBonus;
}

export function calculateSpeedBonus(timeRemainingMs: number): number {
  if (timeRemainingMs <= 0) {
    return 0;
  }

  const ratio = Math.max(0, Math.min(1, timeRemainingMs / TIME_LIMIT_MS));
  const bonus = ratio * MAX_BONUS;
  return Math.round(bonus);
}

export function calculateCategoryStats(
  answers: Array<{
    isCorrect: boolean;
    score: number;
  }>
): {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  correctPercentage: number;
} {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const score = answers.reduce((sum, a) => sum + a.score, 0);
  const correctPercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return {
    totalQuestions,
    correctAnswers,
    score,
    correctPercentage,
  };
}

export function validateNickname(nickname: string): boolean {
  const trimmed = nickname.trim();
  return trimmed.length >= 2 && trimmed.length <= 12;
}

export function sanitizeNickname(nickname: string): string {
  return nickname.trim().substring(0, 12);
}
