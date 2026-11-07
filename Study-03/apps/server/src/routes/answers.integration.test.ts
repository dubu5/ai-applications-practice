import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initDatabase, closeDatabase } from '../db/db.js';
import { createSession } from '../services/sessionService.js';
import { submitAnswer } from '../services/answerService.js';

describe('Answers API Integration Tests', () => {
  let sessionId: string;
  let firstQuestionId: string;

  beforeAll(() => {
    initDatabase(':memory:');
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeAll(() => {
    const session = createSession({ nickname: 'AnswerTester' });
    sessionId = session.sessionId;
    firstQuestionId = session.questions[0].id;
  });

  it('should submit a correct answer', () => {
    const response = submitAnswer({
      sessionId,
      questionId: firstQuestionId,
      answerIndex: 0, // This might be correct or not, depending on the question
      timeSpent: 10,
    });

    expect(response).toHaveProperty('isCorrect');
    expect(response).toHaveProperty('correctIndex');
    expect(response).toHaveProperty('explanation');
    expect(response).toHaveProperty('points');
    expect(response.feedback).toHaveProperty('totalCorrect');
    expect(response.feedback).toHaveProperty('currentScore');
    expect(response.points).toBeGreaterThanOrEqual(0);
  });

  it('should reject duplicate submission for same question', () => {
    expect(() => {
      submitAnswer({
        sessionId,
        questionId: firstQuestionId,
        answerIndex: 1,
        timeSpent: 5,
      });
    }).toThrow('This question has already been answered');
  });

  it('should reject answer for non-existent question', () => {
    expect(() => {
      submitAnswer({
        sessionId,
        questionId: 'invalid_question',
        answerIndex: 0,
        timeSpent: 10,
      });
    }).toThrow();
  });

  it('should track points correctly across multiple answers', () => {
    const session = createSession({ nickname: 'PointsTester' });
    const questions = session.questions.slice(0, 3);

    let totalPoints = 0;
    for (const question of questions) {
      const response = submitAnswer({
        sessionId: session.sessionId,
        questionId: question.id,
        answerIndex: 0,
        timeSpent: 10,
      });
      totalPoints += response.points;
      expect(response.feedback.currentScore).toBe(totalPoints);
    }

    expect(totalPoints).toBeGreaterThan(0);
  });
});
