import { describe, expect, it } from 'vitest';
import type { Board, Player } from '@/lib/gameLogic/tictactoe';
import {
  applyMove,
  checkWinner,
  getEmptyCells,
  isBoardFull,
  isGameOver,
  WIN_PATTERNS,
} from '@/lib/gameLogic/tictactoe';

const b = (cells: (Player | null)[]): Board => cells as Board;

describe('checkWinner', () => {
  it('returns null on empty board', () => {
    expect(checkWinner(b([null, null, null, null, null, null, null, null, null]))).toBeNull();
  });

  it('returns null when no winner', () => {
    // Board: X O X / O . . / . O X — no winning pattern
    expect(checkWinner(b(['X', 'O', 'X', 'O', null, null, null, 'O', 'X']))).toBeNull();
  });

  it('detects horizontal win (top row)', () => {
    const result = checkWinner(b(['X', 'X', 'X', null, null, null, null, null, null]));
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.pattern).toEqual([0, 1, 2]);
  });

  it('detects horizontal win (middle row)', () => {
    const result = checkWinner(b([null, null, null, 'O', 'O', 'O', null, null, null]));
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('O');
    expect(result!.pattern).toEqual([3, 4, 5]);
  });

  it('detects horizontal win (bottom row)', () => {
    const result = checkWinner(b([null, null, null, null, null, null, 'X', 'X', 'X']));
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.pattern).toEqual([6, 7, 8]);
  });

  it('detects vertical win (left column)', () => {
    const result = checkWinner(b(['X', null, null, 'X', null, null, 'X', null, null]));
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.pattern).toEqual([0, 3, 6]);
  });

  it('detects vertical win (middle column)', () => {
    const result = checkWinner(b([null, 'O', null, null, 'O', null, null, 'O', null]));
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('O');
    expect(result!.pattern).toEqual([1, 4, 7]);
  });

  it('detects vertical win (right column)', () => {
    const result = checkWinner(b([null, null, 'X', null, null, 'X', null, null, 'X']));
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.pattern).toEqual([2, 5, 8]);
  });

  it('detects diagonal win (top-left to bottom-right)', () => {
    const result = checkWinner(b(['X', null, null, null, 'X', null, null, null, 'X']));
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.pattern).toEqual([0, 4, 8]);
  });

  it('detects diagonal win (top-right to bottom-left)', () => {
    const result = checkWinner(b([null, null, 'O', null, 'O', null, 'O', null, null]));
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('O');
    expect(result!.pattern).toEqual([2, 4, 6]);
  });

  it('wins take the first matching pattern', () => {
    // X wins in top row but also forms a diagonal
    const board = b(['X', 'X', 'X', null, 'X', null, 'O', null, null]);
    const result = checkWinner(board);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('X');
    expect(result!.pattern).toEqual([0, 1, 2]);
  });

  it('has all 8 win patterns', () => {
    expect(WIN_PATTERNS).toHaveLength(8);
  });
});

describe('isBoardFull', () => {
  it('returns false for partially filled board', () => {
    expect(isBoardFull(b(['X', null, null, null, null, null, null, null, null]))).toBe(false);
  });

  it('returns true for completely filled board', () => {
    expect(isBoardFull(b(['X', 'O', 'X', 'X', 'O', 'X', 'O', 'X', 'O']))).toBe(true);
  });
});

describe('isGameOver', () => {
  it('returns false when game can continue', () => {
    expect(isGameOver(b(['X', null, null, null, null, null, null, null, null]))).toBe(false);
  });

  it('returns true when there is a winner', () => {
    expect(isGameOver(b(['X', 'X', 'X', null, null, null, null, null, null]))).toBe(true);
  });

  it('returns true when board is full (draw)', () => {
    expect(isGameOver(b(['X', 'O', 'X', 'X', 'O', 'X', 'O', 'X', 'O']))).toBe(true);
  });
});

describe('getEmptyCells', () => {
  it('returns all indices on empty board', () => {
    expect(getEmptyCells(b([null, null, null, null, null, null, null, null, null]))).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it('returns no indices on full board', () => {
    expect(getEmptyCells(b(['X', 'O', 'X', 'X', 'O', 'X', 'O', 'X', 'O']))).toEqual([]);
  });

  it('returns only empty indices', () => {
    expect(getEmptyCells(b(['X', null, 'O', null, null, 'X', null, null, null]))).toEqual([
      1, 3, 4, 6, 7, 8,
    ]);
  });
});

describe('applyMove', () => {
  it('places player on empty cell', () => {
    const board = b([null, null, null, null, null, null, null, null, null]);
    const result = applyMove(board, 4, 'X');
    expect(result[4]).toBe('X');
  });

  it('does not modify board when cell is occupied', () => {
    const board = b(['X', null, null, null, null, null, null, null, null]);
    const result = applyMove(board, 0, 'O');
    expect(result[0]).toBe('X');
  });

  it('does not mutate original board', () => {
    const board = b([null, null, null, null, null, null, null, null, null]);
    applyMove(board, 0, 'X');
    expect(board[0]).toBeNull();
  });
});
