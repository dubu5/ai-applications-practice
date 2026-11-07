import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initDatabase, closeDatabase, getDatabase } from '../db/db.js';
import { createSession, getSession, getSessionWithQuestions } from '../services/sessionService.js';

describe('Sessions API Integration Tests', () => {
  beforeAll(() => {
    // Use in-memory database for tests
    initDatabase(':memory:');
  });

  afterAll(() => {
    closeDatabase();
  });

  it('should create a session with valid nickname', () => {
    const response = createSession({
      nickname: 'TestPlayer',
    });

    expect(response.sessionId).toBeDefined();
    expect(response.sessionId).toMatch(/^sess_/);
    expect(response.questions).toHaveLength(40);
    expect(response.questions[0]).toHaveProperty('id');
    expect(response.questions[0]).toHaveProperty('question');
    expect(response.questions[0]).toHaveProperty('choices');
    expect(response.questions[0]).not.toHaveProperty('answerIndex');
    expect(response.questions[0]).not.toHaveProperty('explanation');
  });

  it('should reject nickname with invalid length', () => {
    expect(() => {
      createSession({ nickname: '' });
    }).toThrow();

    expect(() => {
      createSession({ nickname: 'a'.repeat(21) });
    }).toThrow();
  });

  it('should reject nickname with banned words', () => {
    expect(() => {
      createSession({ nickname: 'admin' });
    }).toThrow();

    expect(() => {
      createSession({ nickname: 'system' });
    }).toThrow();
  });

  it('should retrieve session details', () => {
    const created = createSession({ nickname: 'Player1' });
    const session = getSession(created.sessionId);

    expect(session).toBeDefined();
    expect(session?.id).toBe(created.sessionId);
    expect(session?.nickname).toBe('Player1');
    expect(session?.status).toBe('active');
    expect(session?.question_ids).toHaveLength(40);
  });

  it('should hide answers in active session', () => {
    const created = createSession({ nickname: 'Player2' });
    const session = getSessionWithQuestions(created.sessionId);

    expect(session?.questions).toBeDefined();
    session?.questions.forEach(q => {
      expect(q).not.toHaveProperty('answerIndex');
      expect(q).not.toHaveProperty('explanation');
    });
  });

  it('should return null for non-existent session', () => {
    const session = getSession('sess_nonexistent');
    expect(session).toBeNull();
  });
});
