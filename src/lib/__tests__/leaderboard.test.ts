import { beforeEach, describe, expect, it } from 'vitest';
import { clearScores, getScores, saveScore } from '@/lib/leaderboard';

describe('leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveScore', () => {
    it('saves a score to localStorage', () => {
      saveScore('tictactoe', 100);
      const scores = getScores('tictactoe');
      expect(scores).toHaveLength(1);
      expect(scores[0].score).toBe(100);
    });

    it('saves multiple scores for the same game', () => {
      saveScore('tictactoe', 100);
      saveScore('tictactoe', 200);
      saveScore('tictactoe', 50);
      const scores = getScores('tictactoe');
      expect(scores).toHaveLength(3);
    });

    it('saves scores for different games separately', () => {
      saveScore('tictactoe', 100);
      saveScore('snake', 200);
      expect(getScores('tictactoe')).toHaveLength(1);
      expect(getScores('snake')).toHaveLength(1);
    });

    it('includes date and optional name', () => {
      saveScore('tictactoe', 100, 'Alice');
      const scores = getScores('tictactoe');
      expect(scores[0].name).toBe('Alice');
      expect(scores[0].date).toBeTruthy();
    });
  });

  describe('getScores', () => {
    it('returns empty array when no scores', () => {
      expect(getScores('nonexistent')).toEqual([]);
    });

    it('returns scores sorted descending by score', () => {
      saveScore('tictactoe', 100);
      saveScore('tictactoe', 300);
      saveScore('tictactoe', 200);
      const scores = getScores('tictactoe');
      expect(scores[0].score).toBe(300);
      expect(scores[1].score).toBe(200);
      expect(scores[2].score).toBe(100);
    });

    it('respects MAX_SCORES limit', () => {
      for (let i = 0; i < 150; i++) {
        saveScore('tictactoe', i);
      }
      const scores = getScores('tictactoe');
      expect(scores.length).toBeLessThanOrEqual(100);
    });
  });

  describe('clearScores', () => {
    it('removes all scores for a game', () => {
      saveScore('tictactoe', 100);
      saveScore('tictactoe', 200);
      clearScores('tictactoe');
      expect(getScores('tictactoe')).toEqual([]);
    });

    it('does not affect other games', () => {
      saveScore('tictactoe', 100);
      saveScore('snake', 200);
      clearScores('tictactoe');
      expect(getScores('tictactoe')).toEqual([]);
      expect(getScores('snake')).toHaveLength(1);
    });
  });
});
