import { describe, it, expect, beforeEach } from 'vitest';
import {
  extractQuestionsPerCategory,
  shuffleArray,
  shuffleChoices,
  initGameSession,
  isCorrectAnswer,
  recordAnswer,
  getGameProgress,
  isGameComplete,
  getCurrentCategory,
} from './quizEngine';
import { Question } from './types';

const mockQuestions: Question[] = [
  // History (10개)
  ...Array(10)
    .fill(null)
    .map((_, i) => ({
      id: `history_${i}`,
      category: 'history' as const,
      question: `한국사 문제 ${i}`,
      choices: ['선택지1', '선택지2', '선택지3', '선택지4'],
      answerIndex: 0,
      explanation: '설명',
      difficulty: 'medium' as const,
      source: '출처',
      active: true,
    })),
  // Science (10개)
  ...Array(10)
    .fill(null)
    .map((_, i) => ({
      id: `science_${i}`,
      category: 'science' as const,
      question: `과학 문제 ${i}`,
      choices: ['선택지1', '선택지2', '선택지3', '선택지4'],
      answerIndex: 1,
      explanation: '설명',
      difficulty: 'medium' as const,
      source: '출처',
      active: true,
    })),
  // Geography (10개)
  ...Array(10)
    .fill(null)
    .map((_, i) => ({
      id: `geography_${i}`,
      category: 'geography' as const,
      question: `지리 문제 ${i}`,
      choices: ['선택지1', '선택지2', '선택지3', '선택지4'],
      answerIndex: 2,
      explanation: '설명',
      difficulty: 'medium' as const,
      source: '출처',
      active: true,
    })),
  // General (10개)
  ...Array(10)
    .fill(null)
    .map((_, i) => ({
      id: `general_${i}`,
      category: 'general' as const,
      question: `일반상식 문제 ${i}`,
      choices: ['선택지1', '선택지2', '선택지3', '선택지4'],
      answerIndex: 3,
      explanation: '설명',
      difficulty: 'medium' as const,
      source: '출처',
      active: true,
    })),
];

describe('quizEngine', () => {
  describe('extractQuestionsPerCategory', () => {
    it('카테고리별로 정확히 10개씩 추출', () => {
      const extracted = extractQuestionsPerCategory(mockQuestions);
      expect(extracted).toHaveLength(40);

      const historyCount = extracted.filter(q => q.category === 'history').length;
      const scienceCount = extracted.filter(q => q.category === 'science').length;
      const geographyCount = extracted.filter(q => q.category === 'geography').length;
      const generalCount = extracted.filter(q => q.category === 'general').length;

      expect(historyCount).toBe(10);
      expect(scienceCount).toBe(10);
      expect(geographyCount).toBe(10);
      expect(generalCount).toBe(10);
    });

    it('카테고리 순서 유지 (한국사 → 과학 → 지리 → 일반상식)', () => {
      const extracted = extractQuestionsPerCategory(mockQuestions);

      for (let i = 0; i < 10; i++) {
        expect(extracted[i].category).toBe('history');
      }
      for (let i = 10; i < 20; i++) {
        expect(extracted[i].category).toBe('science');
      }
      for (let i = 20; i < 30; i++) {
        expect(extracted[i].category).toBe('geography');
      }
      for (let i = 30; i < 40; i++) {
        expect(extracted[i].category).toBe('general');
      }
    });

    it('비활성 문제는 제외', () => {
      const inactiveQuestions = mockQuestions.map((q, i) => ({
        ...q,
        active: i !== 0,
      }));
      expect(() => extractQuestionsPerCategory(inactiveQuestions)).toThrow();
    });
  });

  describe('shuffleArray', () => {
    it('배열 길이 유지', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled).toHaveLength(5);
    });

    it('원본 배열 변경 없음', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(original);
    });

    it('모든 요소 포함', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      arr.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });
  });

  describe('shuffleChoices', () => {
    it('보기 순서 셔플 후 정답 인덱스 추적', () => {
      const question = mockQuestions[0];
      const shuffled = shuffleChoices(question);

      // 원본 정답 인덱스는 0
      expect(shuffled.originalAnswerIndex).toBe(0);
      // 셔플 후 정답 인덱스가 변경될 수 있음
      expect(shuffled.currentAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(shuffled.currentAnswerIndex).toBeLessThan(4);
      // 정답 보기는 유지되어야 함
      expect(shuffled.choices[shuffled.currentAnswerIndex]).toBe(
        question.choices[question.answerIndex]
      );
    });
  });

  describe('initGameSession', () => {
    it('게임 세션 초기화', () => {
      const questionIds = mockQuestions.map(q => q.id);
      const session = initGameSession('홍길동', questionIds);

      expect(session.nickname).toBe('홍길동');
      expect(session.questionIds).toHaveLength(40);
      expect(session.totalScore).toBe(0);
      expect(session.currentQuestionIndex).toBe(0);
      expect(session.answers).toHaveLength(0);
    });
  });

  describe('isCorrectAnswer', () => {
    it('정답 판정 정확', () => {
      const question = mockQuestions[0];
      const shuffled = shuffleChoices(question);
      const isCorrect = isCorrectAnswer(shuffled.currentAnswerIndex, shuffled);
      expect(isCorrect).toBe(true);
    });

    it('오답 판정 정확', () => {
      const question = mockQuestions[0];
      const shuffled = shuffleChoices(question);
      const wrongIndex = (shuffled.currentAnswerIndex + 1) % 4;
      const isCorrect = isCorrectAnswer(wrongIndex, shuffled);
      expect(isCorrect).toBe(false);
    });
  });

  describe('recordAnswer', () => {
    it('답안 기록 후 현재 인덱스 증가', () => {
      const questionIds = mockQuestions.map(q => q.id);
      let session = initGameSession('홍길동', questionIds);
      expect(session.currentQuestionIndex).toBe(0);

      session = recordAnswer(
        session,
        mockQuestions[0].id,
        0,
        10000,
        true,
        15
      );
      expect(session.currentQuestionIndex).toBe(1);
      expect(session.answers).toHaveLength(1);
      expect(session.totalScore).toBe(15);
    });
  });

  describe('getGameProgress', () => {
    it('게임 진행도 반환', () => {
      const questionIds = mockQuestions.map(q => q.id);
      const session = initGameSession('홍길동', questionIds);
      session.currentQuestionIndex = 5;

      const progress = getGameProgress(session);
      expect(progress.current).toBe(6);
      expect(progress.total).toBe(40);
    });
  });

  describe('isGameComplete', () => {
    it('40문제 풀면 완료', () => {
      const questionIds = mockQuestions.map(q => q.id);
      const session = initGameSession('홍길동', questionIds);
      session.currentQuestionIndex = 40;

      expect(isGameComplete(session)).toBe(true);
    });

    it('39문제까지는 미완료', () => {
      const questionIds = mockQuestions.map(q => q.id);
      const session = initGameSession('홍길동', questionIds);
      session.currentQuestionIndex = 39;

      expect(isGameComplete(session)).toBe(false);
    });
  });

  describe('getCurrentCategory', () => {
    it('문제 인덱스별 카테고리 판정', () => {
      expect(getCurrentCategory(0)).toBe('history');
      expect(getCurrentCategory(9)).toBe('history');
      expect(getCurrentCategory(10)).toBe('science');
      expect(getCurrentCategory(19)).toBe('science');
      expect(getCurrentCategory(20)).toBe('geography');
      expect(getCurrentCategory(29)).toBe('geography');
      expect(getCurrentCategory(30)).toBe('general');
      expect(getCurrentCategory(39)).toBe('general');
    });
  });
});
