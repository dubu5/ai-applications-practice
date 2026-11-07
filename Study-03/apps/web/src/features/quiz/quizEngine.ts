import { Question, GameSession, CategoryType, Answer } from './types';

const CATEGORIES_ORDER: CategoryType[] = ['history', 'science', 'geography', 'general'];
const QUESTIONS_PER_CATEGORY = 10;
const TOTAL_QUESTIONS = 40;
const TIME_LIMIT_MS = 15000;

export function extractQuestionsPerCategory(questions: Question[]): Question[] {
  const activeQuestions = questions.filter(q => q.active);
  const result: Question[] = [];

  for (const category of CATEGORIES_ORDER) {
    const categoryQuestions = activeQuestions.filter(q => q.category === category);
    if (categoryQuestions.length < QUESTIONS_PER_CATEGORY) {
      throw new Error(
        `Not enough questions for category "${category}". Found: ${categoryQuestions.length}, Required: ${QUESTIONS_PER_CATEGORY}`
      );
    }
    const shuffled = shuffleArray([...categoryQuestions]);
    result.push(...shuffled.slice(0, QUESTIONS_PER_CATEGORY));
  }

  return result;
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface ShuffledQuestion extends Question {
  originalAnswerIndex: number;
  currentAnswerIndex: number;
}

export function shuffleChoices(question: Question): ShuffledQuestion {
  const choicesWithIndices = question.choices.map((choice, index) => ({
    choice,
    originalIndex: index,
  }));

  const shuffled = shuffleArray(choicesWithIndices);
  const newAnswerIndex = shuffled.findIndex(
    item => item.originalIndex === question.answerIndex
  );

  return {
    ...question,
    choices: shuffled.map(item => item.choice),
    originalAnswerIndex: question.answerIndex,
    currentAnswerIndex: newAnswerIndex,
    answerIndex: newAnswerIndex,
  };
}

export function initGameSession(
  nickname: string,
  questionIds: string[]
): GameSession {
  return {
    sessionId: generateSessionId(),
    nickname,
    questionIds,
    answers: [],
    totalScore: 0,
    totalTimeMs: 0,
    currentQuestionIndex: 0,
    startedAt: Date.now(),
  };
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export function isCorrectAnswer(
  selectedIndex: number,
  question: ShuffledQuestion
): boolean {
  return selectedIndex === question.currentAnswerIndex;
}

export function recordAnswer(
  session: GameSession,
  questionId: string,
  selectedIndex: number,
  timeRemainingMs: number,
  isCorrect: boolean,
  score: number
): GameSession {
  const updatedSession = { ...session };
  updatedSession.answers.push({
    questionId,
    selectedIndex,
    timeRemainingMs,
    score,
    isCorrect,
  });
  updatedSession.totalScore += score;
  updatedSession.currentQuestionIndex += 1;
  return updatedSession;
}

export function getGameProgress(session: GameSession): {
  current: number;
  total: number;
} {
  return {
    current: session.currentQuestionIndex + 1,
    total: TOTAL_QUESTIONS,
  };
}

export function isGameComplete(session: GameSession): boolean {
  return session.currentQuestionIndex >= TOTAL_QUESTIONS;
}

export function getCurrentCategory(
  questionIndex: number
): CategoryType {
  const categoryIndex = Math.floor(questionIndex / QUESTIONS_PER_CATEGORY);
  return CATEGORIES_ORDER[categoryIndex];
}
