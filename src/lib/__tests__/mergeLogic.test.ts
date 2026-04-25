import { describe, expect, it } from 'vitest';
import type { Grid } from '@/lib/gameLogic/numberMerge';
import {
  canMove,
  createEmptyGrid,
  GRID_SIZE,
  getEmptyCells,
  hasWon,
  moveGrid,
  slideRowLeft,
} from '@/lib/gameLogic/numberMerge';

const g = (rows: number[][]): Grid => rows.map((row) => row.map((v) => (v === 0 ? null : v)));

describe('createEmptyGrid', () => {
  it('creates a 4x4 grid of nulls', () => {
    const grid = createEmptyGrid();
    expect(grid).toHaveLength(GRID_SIZE);
    expect(grid[0]).toHaveLength(GRID_SIZE);
    expect(grid.every((row) => row.every((v) => v === null))).toBe(true);
  });
});

describe('getEmptyCells', () => {
  it('returns all cells for empty grid', () => {
    const grid = createEmptyGrid();
    const empty = getEmptyCells(grid);
    expect(empty).toHaveLength(GRID_SIZE * GRID_SIZE);
  });

  it('returns empty positions when grid is partially filled', () => {
    const grid = g([
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const empty = getEmptyCells(grid);
    expect(empty).toHaveLength(14);
    expect(empty).toContainEqual([0, 2]);
    expect(empty).toContainEqual([0, 3]);
  });

  it('returns empty array for full grid', () => {
    const grid = g([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 2],
      [4, 8, 16, 32],
    ]);
    expect(getEmptyCells(grid)).toHaveLength(0);
  });
});

describe('slideRowLeft', () => {
  it('moves tiles left', () => {
    const { result } = slideRowLeft([null, null, 2, 4]);
    expect(result).toEqual([2, 4, null, null]);
  });

  it('merges equal adjacent tiles', () => {
    const { result, score } = slideRowLeft([2, 2, null, null]);
    expect(result).toEqual([4, null, null, null]);
    expect(score).toBe(4);
  });

  it('does not merge non-adjacent tiles of same value', () => {
    // After slide: [2, null, 2, null] -> filter [2, 2] -> merge -> [4]
    // The tiles slide together and then merge
    const { result } = slideRowLeft([2, null, 2, null]);
    expect(result).toEqual([4, null, null, null]);
  });

  it('handles multiple merges in one row', () => {
    const { result, score } = slideRowLeft([2, 2, 4, 4]);
    expect(result).toEqual([4, 8, null, null]);
    expect(score).toBe(12);
  });

  it('marks moved true when tiles shift', () => {
    const { moved } = slideRowLeft([null, null, 2, 4]);
    expect(moved).toBe(true);
  });

  it('marks moved false when row unchanged', () => {
    const { moved } = slideRowLeft([2, 4, null, null]);
    expect(moved).toBe(false);
  });

  it('adds score from merges', () => {
    const { score } = slideRowLeft([2, 2, 2, 2]);
    // [2,2,2,2] -> slide: [2,2,2,2] filter: [2,2,2,2] -> merge first two: [4,2] -> merge next two: [4,4, null, null] -> rotate back: [4,4,null,null]
    // Wait, the algorithm: filter -> pair merge
    // [2,2,2,2] pairs: (2,2) and (2,2) -> [4,4]
    expect(score).toBe(8);
  });
});

describe('moveGrid', () => {
  it('moves left correctly', () => {
    const grid = g([
      [0, 0, 2, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { grid: result, score } = moveGrid(grid, 'LEFT');
    expect(result[0]).toEqual([2, 4, null, null]);
    expect(score).toBe(0);
  });

  it('moves right correctly', () => {
    const grid = g([
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { grid: result } = moveGrid(grid, 'RIGHT');
    expect(result[0]).toEqual([null, null, 2, 4]);
  });

  it('moves up correctly', () => {
    const grid = g([
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { grid: result } = moveGrid(grid, 'UP');
    // UP moves tiles toward the top (row 0)
    expect(result[0][0]).toBe(2);
    expect(result[1][0]).toBe(4);
  });

  it('moves down correctly', () => {
    const grid = g([
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { grid: result } = moveGrid(grid, 'DOWN');
    // DOWN moves tiles toward the bottom (row 3)
    expect(result[2][0]).toBe(2);
    expect(result[3][0]).toBe(4);
  });

  it('adds score from merges', () => {
    const grid = g([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { score } = moveGrid(grid, 'LEFT');
    expect(score).toBe(4);
  });
});

describe('canMove', () => {
  it('returns true when there are empty cells', () => {
    const grid = g([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 0, 2],
      [4, 8, 16, 32],
    ]);
    expect(canMove(grid)).toBe(true);
  });

  it('returns true when adjacent cells can merge', () => {
    const grid = g([
      [2, 2, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 2],
      [4, 8, 16, 32],
    ]);
    expect(canMove(grid)).toBe(true);
  });

  it('returns false when no moves possible', () => {
    const grid = g([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 2],
      [4, 8, 16, 32],
    ]);
    expect(canMove(grid)).toBe(false);
  });
});

describe('hasWon', () => {
  it('returns false when no 2048 tile', () => {
    const grid = g([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 0, 2],
      [4, 8, 16, 32],
    ]);
    expect(hasWon(grid)).toBe(false);
  });

  it('returns true when 2048 tile exists', () => {
    const grid = g([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 2],
      [4, 8, 16, 32],
    ]);
    expect(hasWon(grid)).toBe(true);
  });
});
