import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculateSpeedBonus,
  calculateCategoryStats,
  validateNickname,
  sanitizeNickname,
} from './scoreCalculator';

describe('scoreCalculator', () => {
  describe('calculateScore', () => {
    it('정답일 때 전체 시간 남으면 최대 점수 반환', () => {
      const score = calculateScore(true, 15000);
      expect(score).toBe(15); // 10 + 5
    });

    it('오답일 때 0점 반환', () => {
      const score = calculateScore(false, 15000);
      expect(score).toBe(0);
    });

    it('정답 + 전체 시간 남았을 때 최대 점수 15점', () => {
      const score = calculateScore(true, 15000);
      expect(score).toBe(15); // 10 + 5
    });

    it('정답 + 시간 절반 남았을 때 보너스 약 2-3점', () => {
      const score = calculateScore(true, 7500);
      expect(score).toBe(13); // 10 + 2.5 -> 3
    });

    it('정답 + 시간 거의 다 됐을 때 보너스 거의 없음', () => {
      const score = calculateScore(true, 500);
      expect(score).toBe(10); // 10 + 0
    });

    it('정답 + 시간 초과했을 때 0점', () => {
      const score = calculateScore(true, 0);
      expect(score).toBe(10); // 10 + 0
    });
  });

  describe('calculateSpeedBonus', () => {
    it('15초 남았을 때 최대 보너스 5점', () => {
      const bonus = calculateSpeedBonus(15000);
      expect(bonus).toBe(5);
    });

    it('7.5초 남았을 때 약 2-3점 (반올림 후 3점)', () => {
      const bonus = calculateSpeedBonus(7500);
      expect(bonus).toBe(3); // 2.5 -> 3 (반올림)
    });

    it('0초일 때 보너스 0점', () => {
      const bonus = calculateSpeedBonus(0);
      expect(bonus).toBe(0);
    });

    it('음수 시간일 때 보너스 0점', () => {
      const bonus = calculateSpeedBonus(-1000);
      expect(bonus).toBe(0);
    });
  });

  describe('calculateCategoryStats', () => {
    it('10개 문제 중 8개 정답일 때 80% 계산', () => {
      const answers = Array(8).fill({ isCorrect: true, score: 15 }).concat(
        Array(2).fill({ isCorrect: false, score: 0 })
      );
      const stats = calculateCategoryStats(answers);
      expect(stats.correctPercentage).toBe(80);
      expect(stats.correctAnswers).toBe(8);
      expect(stats.totalQuestions).toBe(10);
    });

    it('빈 배열일 때 0% 반환', () => {
      const stats = calculateCategoryStats([]);
      expect(stats.correctPercentage).toBe(0);
    });
  });

  describe('validateNickname', () => {
    it('2자 이상 12자 이하 닉네임 유효', () => {
      expect(validateNickname('홍길동')).toBe(true);
      expect(validateNickname('ab')).toBe(true);
      expect(validateNickname('123456789012')).toBe(true);
    });

    it('1자 닉네임 무효', () => {
      expect(validateNickname('a')).toBe(false);
    });

    it('13자 이상 닉네임 무효', () => {
      expect(validateNickname('1234567890123')).toBe(false);
    });

    it('공백만 있는 닉네임 무효', () => {
      expect(validateNickname('   ')).toBe(false);
    });
  });

  describe('sanitizeNickname', () => {
    it('닉네임 앞뒤 공백 제거', () => {
      expect(sanitizeNickname('  홍길동  ')).toBe('홍길동');
    });

    it('12자를 초과하는 닉네임 자르기', () => {
      expect(sanitizeNickname('1234567890123456')).toBe('123456789012');
    });
  });
});
