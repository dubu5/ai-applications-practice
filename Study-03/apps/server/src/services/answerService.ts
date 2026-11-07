import { getDatabase } from '../db/db.js';
import { calculatePoints } from '../utils/helpers.js';

export interface SubmitAnswerInput {
  sessionId: string;
  questionId: string;
  answerIndex: number;
  timeSpent: number; // in seconds
}

export interface AnswerResponse {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  points: number;
  feedback: {
    totalCorrect: number;
    currentScore: number;
  };
}

export function submitAnswer(input: SubmitAnswerInput): AnswerResponse {
  const db = getDatabase();

  // Validate session exists and is active
  const session = db.prepare(`
    SELECT id, status, question_ids FROM sessions WHERE id = ?
  `).get(input.sessionId) as any;

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'active') {
    throw new Error('Session is not active');
  }

  // Validate question belongs to this session
  const questionIds = JSON.parse(session.question_ids);
  if (!questionIds.includes(input.questionId)) {
    throw new Error('Question does not belong to this session');
  }

  // Check for duplicate submission
  const existing = db.prepare(`
    SELECT id FROM session_answers WHERE session_id = ? AND question_id = ?
  `).get(input.sessionId, input.questionId);

  if (existing) {
    throw new Error('This question has already been answered');
  }

  // Get question details
  const question = db.prepare(`
    SELECT id, answerIndex, explanation, difficulty FROM questions WHERE id = ?
  `).get(input.questionId) as any;

  if (!question) {
    throw new Error('Question not found');
  }

  // Check answer
  const isCorrect = input.answerIndex === question.answerIndex;
  const points = calculatePoints(isCorrect, question.difficulty);

  // Save answer
  db.prepare(`
    INSERT INTO session_answers (session_id, question_id, answer_index, time_spent, is_correct, points_earned)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(input.sessionId, input.questionId, input.answerIndex, input.timeSpent, isCorrect ? 1 : 0, points);

  // Get current stats
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_answered,
      SUM(is_correct) as correct_count,
      SUM(points_earned) as total_points
    FROM session_answers
    WHERE session_id = ?
  `).get(input.sessionId) as any;

  return {
    isCorrect,
    correctIndex: question.answerIndex,
    explanation: question.explanation,
    points,
    feedback: {
      totalCorrect: stats?.correct_count || 0,
      currentScore: stats?.total_points || 0,
    },
  };
}

export function isQuestionAnswered(sessionId: string, questionId: string): boolean {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT id FROM session_answers WHERE session_id = ? AND question_id = ?
  `).get(sessionId, questionId);

  return !!result;
}
