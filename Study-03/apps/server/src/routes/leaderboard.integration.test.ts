import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initDatabase, closeDatabase } from '../db/db.js';
import { createSession } from '../services/sessionService.js';
import { submitAnswer } from '../services/answerService.js';
import { finishGame, getLeaderboard, getMyRank } from '../services/leaderboardService.js';

describe('Leaderboard API Integration Tests', () => {
  let sessionIds: string[] = [];

  beforeAll(() => {
    initDatabase(':memory:');
  });

  afterAll(() => {
    closeDatabase();
  });

  it('should complete a game and record leaderboard entry', () => {
    const session = createSession({ nickname: 'LeaderboardTester1' });
    sessionIds.push(session.sessionId);

    // Answer all 40 questions
    for (const question of session.questions) {
      submitAnswer({
        sessionId: session.sessionId,
        questionId: question.id,
        answerIndex: 0,
        timeSpent: 10,
      });
    }

    const result = finishGame({ sessionId: session.sessionId });

    expect(result.success).toBe(true);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalTime).toBeGreaterThan(0);
    expect(result.rank).toBeGreaterThan(0);
    expect(result.leaderboardId).toBeDefined();
    expect(result.categoryScores).toHaveProperty('history');
    expect(result.categoryScores).toHaveProperty('science');
    expect(result.categoryScores).toHaveProperty('geography');
    expect(result.categoryScores).toHaveProperty('general');
  });

  it('should prevent double completion', () => {
    const session = createSession({ nickname: 'LeaderboardTester2' });
    sessionIds.push(session.sessionId);

    // Answer all questions
    for (const question of session.questions) {
      submitAnswer({
        sessionId: session.sessionId,
        questionId: question.id,
        answerIndex: 0,
        timeSpent: 10,
      });
    }

    finishGame({ sessionId: session.sessionId });

    expect(() => {
      finishGame({ sessionId: session.sessionId });
    }).toThrow();
  });

  it('should rank higher score before lower score', () => {
    // Player with high score
    const session1 = createSession({ nickname: 'HighScorer' });
    for (const question of session1.questions) {
      submitAnswer({
        sessionId: session1.sessionId,
        questionId: question.id,
        answerIndex: 0,
        timeSpent: 5,
      });
    }
    const result1 = finishGame({ sessionId: session1.sessionId });

    // Player with lower score
    const session2 = createSession({ nickname: 'LowerScorer' });
    for (let i = 0; i < 20; i++) {
      submitAnswer({
        sessionId: session2.sessionId,
        questionId: session2.questions[i].id,
        answerIndex: 0,
        timeSpent: 10,
      });
    }
    const result2 = finishGame({ sessionId: session2.sessionId });

    expect(result1.rank).toBeLessThan(result2.rank);
  });

  it('should rank by time when scores are equal', () => {
    // Both get same score but first one is faster
    const session1 = createSession({ nickname: 'FastPlayer' });
    for (const question of session1.questions) {
      submitAnswer({
        sessionId: session1.sessionId,
        questionId: question.id,
        answerIndex: 0,
        timeSpent: 5,
      });
    }
    const result1 = finishGame({ sessionId: session1.sessionId });

    const session2 = createSession({ nickname: 'SlowPlayer' });
    for (const question of session2.questions) {
      submitAnswer({
        sessionId: session2.sessionId,
        questionId: question.id,
        answerIndex: 0,
        timeSpent: 20,
      });
    }
    const result2 = finishGame({ sessionId: session2.sessionId });

    if (result1.totalScore === result2.totalScore) {
      expect(result1.rank).toBeLessThan(result2.rank);
    }
  });

  it('should retrieve leaderboard with ranking', () => {
    const leaderboard = getLeaderboard(10);

    expect(leaderboard.length).toBeGreaterThan(0);
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[leaderboard.length - 1].rank).toBeLessThanOrEqual(10);

    // Check sorting
    for (let i = 0; i < leaderboard.length - 1; i++) {
      const current = leaderboard[i];
      const next = leaderboard[i + 1];
      expect(current.total_score).toBeGreaterThanOrEqual(next.total_score);
    }
  });

  it('should get my rank correctly', () => {
    const session = createSession({ nickname: 'MyRankTester' });
    sessionIds.push(session.sessionId);

    for (const question of session.questions) {
      submitAnswer({
        sessionId: session.sessionId,
        questionId: question.id,
        answerIndex: 0,
        timeSpent: 10,
      });
    }

    finishGame({ sessionId: session.sessionId });

    const result = getMyRank(session.sessionId);

    expect(result).toBeDefined();
    expect(result?.myEntry).toBeDefined();
    expect(result?.aroundMe).toBeDefined();
    expect(result?.myEntry.rank).toBeGreaterThan(0);
  });
});
