import { getDatabase } from '../db/db.js';
import { Session, Question } from '../db/schema.js';
import { generateSessionId, validateNickname } from '../utils/helpers.js';

export interface CreateSessionInput {
  nickname: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  questions: Array<Omit<Question, 'answerIndex' | 'explanation'>>;
}

export function createSession(input: CreateSessionInput): CreateSessionResponse {
  const db = getDatabase();

  // Validate nickname
  const validation = validateNickname(input.nickname);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const sessionId = generateSessionId();
  const nickname = input.nickname.trim();

  // Get random 40 questions
  const questionRows = db.prepare(`
    SELECT id, category, question, choices, difficulty
    FROM questions
    ORDER BY RANDOM()
    LIMIT 40
  `).all() as Array<any>;

  const questions = questionRows.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    choices: JSON.parse(q.choices),
    difficulty: q.difficulty,
  }));

  const questionIds = questions.map(q => q.id);

  // Insert session
  db.prepare(`
    INSERT INTO sessions (id, nickname, question_ids)
    VALUES (?, ?, ?)
  `).run(sessionId, nickname, JSON.stringify(questionIds));

  return {
    sessionId,
    questions,
  };
}

export function getSession(sessionId: string): Session | null {
  const db = getDatabase();

  const row = db.prepare(`
    SELECT id, nickname, status, total_score, total_time, category_scores, question_ids, created_at, completed_at
    FROM sessions
    WHERE id = ?
  `).get(sessionId) as any;

  if (!row) return null;

  return {
    id: row.id,
    nickname: row.nickname,
    status: row.status,
    total_score: row.total_score,
    total_time: row.total_time,
    category_scores: row.category_scores ? JSON.parse(row.category_scores) : null,
    question_ids: JSON.parse(row.question_ids),
    created_at: row.created_at,
    completed_at: row.completed_at,
  };
}

export function getSessionWithQuestions(sessionId: string): Session & { questions: any[] } | null {
  const db = getDatabase();

  const sessionRow = db.prepare(`
    SELECT id, nickname, status, total_score, total_time, category_scores, question_ids, created_at, completed_at
    FROM sessions
    WHERE id = ?
  `).get(sessionId) as any;

  if (!sessionRow) return null;

  const questionIds = JSON.parse(sessionRow.question_ids);

  // Get full question data
  const questionsRow = db.prepare(`
    SELECT id, category, question, choices, answerIndex, explanation, difficulty
    FROM questions
    WHERE id IN (${questionIds.map(() => '?').join(',')})
  `).all(...questionIds) as any[];

  const questions = questionsRow.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    choices: JSON.parse(q.choices),
    difficulty: q.difficulty,
    // Include answers only if session is completed
    ...(sessionRow.status === 'completed' ? {
      answerIndex: q.answerIndex,
      explanation: q.explanation,
    } : {}),
  }));

  return {
    id: sessionRow.id,
    nickname: sessionRow.nickname,
    status: sessionRow.status,
    total_score: sessionRow.total_score,
    total_time: sessionRow.total_time,
    category_scores: sessionRow.category_scores ? JSON.parse(sessionRow.category_scores) : null,
    question_ids: questionIds,
    created_at: sessionRow.created_at,
    completed_at: sessionRow.completed_at,
    questions,
  };
}

export function getAnsweredQuestionsCount(sessionId: string): number {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT COUNT(*) as count FROM session_answers WHERE session_id = ?
  `).get(sessionId) as any;

  return result?.count || 0;
}

export function calculateSessionStats(sessionId: string) {
  const db = getDatabase();

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_answered,
      SUM(is_correct) as correct_count,
      SUM(points_earned) as total_points
    FROM session_answers
    WHERE session_id = ?
  `).get(sessionId) as any;

  return {
    answeredCount: stats?.total_answered || 0,
    correctCount: stats?.correct_count || 0,
    totalPoints: stats?.total_points || 0,
  };
}
