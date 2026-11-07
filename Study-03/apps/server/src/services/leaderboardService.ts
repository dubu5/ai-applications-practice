import { getDatabase } from '../db/db.js';
import { generateLeaderboardId } from '../utils/helpers.js';
import { LeaderboardEntry } from '../db/schema.js';

export interface FinishGameInput {
  sessionId: string;
}

export interface FinishGameResponse {
  success: boolean;
  totalScore: number;
  totalTime: number;
  categoryScores: Record<string, number>;
  rank: number;
  leaderboardId: string;
  message: string;
}

export function finishGame(input: FinishGameInput): FinishGameResponse {
  const db = getDatabase();

  // Get session
  const session = db.prepare(`
    SELECT id, nickname, status, question_ids FROM sessions WHERE id = ?
  `).get(input.sessionId) as any;

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'active') {
    throw new Error('Session already completed');
  }

  // Calculate stats from session_answers
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_answered,
      SUM(is_correct) as correct_count,
      SUM(points_earned) as total_points,
      SUM(time_spent) as total_time
    FROM session_answers
    WHERE session_id = ?
  `).get(input.sessionId) as any;

  const totalScore = stats?.total_points || 0;
  const totalTime = stats?.total_time || 0;

  // Calculate category scores
  const categoryStats = db.prepare(`
    SELECT
      q.category,
      SUM(CASE WHEN sa.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
      COUNT(*) as total_count
    FROM session_answers sa
    JOIN questions q ON sa.question_id = q.id
    WHERE sa.session_id = ?
    GROUP BY q.category
  `).all(input.sessionId) as any[];

  const categoryScores: Record<string, number> = {};
  for (const cat of categoryStats) {
    const points = Math.round((cat.correct_count / cat.total_count) * 100);
    categoryScores[cat.category] = points;
  }

  // Update session as completed
  db.prepare(`
    UPDATE sessions
    SET status = 'completed', total_score = ?, total_time = ?, category_scores = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(totalScore, totalTime, JSON.stringify(categoryScores), input.sessionId);

  // Check if already in leaderboard
  const existing = db.prepare(`
    SELECT id FROM leaderboard WHERE session_id = ?
  `).get(input.sessionId);

  let leaderboardId = existing?.id;

  if (!existing) {
    // Insert into leaderboard
    leaderboardId = generateLeaderboardId();
    db.prepare(`
      INSERT INTO leaderboard (id, session_id, nickname, total_score, total_time, category_scores)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(leaderboardId, input.sessionId, session.nickname, totalScore, totalTime, JSON.stringify(categoryScores));
  }

  // Get rank
  const rankResult = db.prepare(`
    SELECT COUNT(*) as rank FROM leaderboard
    WHERE total_score > ? OR (total_score = ? AND total_time < ?) OR (total_score = ? AND total_time = ? AND created_at < (SELECT created_at FROM leaderboard WHERE id = ?))
  `).get(totalScore, totalScore, totalTime, totalScore, totalTime, leaderboardId) as any;

  const rank = (rankResult?.rank || 0) + 1;

  return {
    success: true,
    totalScore,
    totalTime,
    categoryScores,
    rank,
    leaderboardId,
    message: `${rank}등입니다! 축하합니다!`,
  };
}

export function getLeaderboard(limit: number = 100): LeaderboardEntry[] {
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT id, session_id, nickname, total_score, total_time, category_scores, created_at
    FROM leaderboard
    ORDER BY total_score DESC, total_time ASC, created_at ASC
    LIMIT ?
  `).all(limit) as any[];

  return rows.map((row, index) => ({
    id: row.id,
    session_id: row.session_id,
    nickname: row.nickname,
    total_score: row.total_score,
    total_time: row.total_time,
    category_scores: row.category_scores ? JSON.parse(row.category_scores) : null,
    rank: index + 1,
    created_at: row.created_at,
  }));
}

export function getMyRank(sessionId: string): { myEntry: LeaderboardEntry; aroundMe: LeaderboardEntry[] } | null {
  const db = getDatabase();

  const myEntry = db.prepare(`
    SELECT id, session_id, nickname, total_score, total_time, category_scores, created_at
    FROM leaderboard
    WHERE session_id = ?
  `).get(sessionId) as any;

  if (!myEntry) return null;

  // Calculate rank
  const rankResult = db.prepare(`
    SELECT COUNT(*) as rank FROM leaderboard
    WHERE total_score > ? OR (total_score = ? AND total_time < ?) OR (total_score = ? AND total_time = ? AND created_at < ?)
  `).get(myEntry.total_score, myEntry.total_score, myEntry.total_time, myEntry.total_score, myEntry.total_time, myEntry.created_at) as any;

  const myRank = (rankResult?.rank || 0) + 1;

  // Get surrounding entries (±2)
  const aroundMe = db.prepare(`
    SELECT id, session_id, nickname, total_score, total_time, category_scores, created_at
    FROM leaderboard
    ORDER BY total_score DESC, total_time ASC, created_at ASC
    LIMIT ? OFFSET ?
  `).all(5, Math.max(0, myRank - 3)) as any[];

  const formattedAroundMe = aroundMe.map((row, index) => ({
    id: row.id,
    session_id: row.session_id,
    nickname: row.nickname,
    total_score: row.total_score,
    total_time: row.total_time,
    category_scores: row.category_scores ? JSON.parse(row.category_scores) : null,
    rank: myRank - 3 + index + 1,
    created_at: row.created_at,
  }));

  return {
    myEntry: {
      id: myEntry.id,
      session_id: myEntry.session_id,
      nickname: myEntry.nickname,
      total_score: myEntry.total_score,
      total_time: myEntry.total_time,
      category_scores: myEntry.category_scores ? JSON.parse(myEntry.category_scores) : null,
      rank: myRank,
      created_at: myEntry.created_at,
    },
    aroundMe: formattedAroundMe,
  };
}
