import { nanoid } from 'nanoid';

// Banned words for nickname validation
const BANNED_WORDS = ['admin', 'null', 'undefined', 'system', '시스템', '관리자'];

export function generateSessionId(): string {
  return `sess_${nanoid(12)}`;
}

export function generateLeaderboardId(): string {
  return `lb_${nanoid(12)}`;
}

export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: 'Nickname is required' };
  }

  const trimmed = nickname.trim();

  if (trimmed.length < 1 || trimmed.length > 20) {
    return { valid: false, error: 'Nickname must be between 1 and 20 characters' };
  }

  const lowerNickname = trimmed.toLowerCase();
  if (BANNED_WORDS.some(word => lowerNickname.includes(word))) {
    return { valid: false, error: 'Nickname contains inappropriate words' };
  }

  return { valid: true };
}

export function calculatePoints(isCorrect: boolean, questionDifficulty?: string): number {
  if (!isCorrect) return 0;

  // Base points per difficulty
  const difficultyMultiplier: Record<string, number> = {
    'easy': 1,
    'medium': 1.2,
    'hard': 1.5,
  };

  const multiplier = difficultyMultiplier[questionDifficulty || 'easy'] || 1;
  return Math.round(10 * multiplier);
}

export function calculateTotalScore(points: number[]): number {
  return points.reduce((sum, p) => sum + p, 0);
}

export function getCategoryScore(categoryScores: Record<string, number>): Record<string, number> {
  return categoryScores || {};
}
