export type CategoryType = 'history' | 'science' | 'geography' | 'general';
export type DifficultyType = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: CategoryType;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  difficulty: DifficultyType;
  source: string;
  active: boolean;
}

export interface Answer {
  questionId: string;
  selectedIndex: number;
  timeRemainingMs: number;
  score: number;
  isCorrect: boolean;
}

export interface GameSession {
  sessionId: string;
  nickname: string;
  questionIds: string[];
  answers: Answer[];
  totalScore: number;
  totalTimeMs: number;
  currentQuestionIndex: number;
  startedAt: number;
  finishedAt?: number;
}

export interface CategoryResult {
  category: CategoryType;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}

export interface GameResult {
  sessionId: string;
  nickname: string;
  totalScore: number;
  totalTimeMs: number;
  categoryResults: CategoryResult[];
  finishedAt: number;
}
