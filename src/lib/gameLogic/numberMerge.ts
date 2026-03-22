/**
 * Pure 2048/NumberMerge logic — extracted for testability.
 */

export type CellValue = number | null;
export type Grid = CellValue[][];
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const GRID_SIZE = 4;

const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

export const createEmptyGrid = (): Grid =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

export const getEmptyCells = (grid: Grid): [number, number][] => {
  const empty: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) empty.push([r, c]);
    }
  }
  return empty;
};

export const slideRowLeft = (
  row: CellValue[]
): { result: CellValue[]; score: number; moved: boolean } => {
  let score = 0;
  const filtered = row.filter((v) => v !== null) as number[];
  const result: CellValue[] = [];
  let moved = false;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      result.push(merged);
      score += merged;
      i += 2;
    } else {
      result.push(filtered[i]);
      i++;
    }
  }
  while (result.length < GRID_SIZE) result.push(null);
  for (let c = 0; c < GRID_SIZE; c++) {
    if (row[c] !== result[c]) moved = true;
  }
  return { result, score, moved };
};

const rotateGrid = (grid: Grid, times: number): Grid => {
  let g = cloneGrid(grid);
  for (let t = 0; t < times; t++) {
    const rotated: Grid = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => g[GRID_SIZE - 1 - c][r])
    );
    g = rotated;
  }
  return g;
};

export const moveGrid = (
  grid: Grid,
  dir: Direction
): { grid: Grid; score: number; moved: boolean } => {
  // LEFT=0, UP=1, RIGHT=2, DOWN=3
  const rotations: Record<Direction, number> = { LEFT: 0, UP: 1, RIGHT: 2, DOWN: 3 };
  const g = rotateGrid(grid, rotations[dir]);
  let totalScore = 0;
  let moved = false;
  const newGrid: Grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const { result, score, moved: rowMoved } = slideRowLeft(g[r]);
    newGrid.push(result);
    totalScore += score;
    if (rowMoved) moved = true;
  }
  const backRotations = (4 - rotations[dir]) % 4;
  const finalGrid = rotateGrid(newGrid, backRotations);
  return { grid: finalGrid, score: totalScore, moved };
};

export const canMove = (grid: Grid): boolean => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) return true;
      const v = grid[r][c]!;
      if (c < GRID_SIZE - 1 && grid[r][c + 1] === v) return true;
      if (r < GRID_SIZE - 1 && grid[r + 1][c] === v) return true;
    }
  }
  return false;
};

export const addRandomTile = (grid: Grid): [Grid, [number, number] | null] => {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return [grid, null];
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = cloneGrid(grid);
  newGrid[r][c] = 2; // deterministic 2 for testing
  return [newGrid, [r, c]];
};

export const hasWon = (grid: Grid): boolean => grid.some((row) => row.some((v) => v === 2048));
