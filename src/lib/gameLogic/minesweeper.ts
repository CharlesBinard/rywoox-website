/**
 * Pure Minesweeper logic — extracted for testability.
 */

export interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export type Board = Cell[][];

export interface Position {
  row: number;
  col: number;
}

export const createBoard = (rows: number, cols: number, mineCount: number): Board => {
  // Initialize empty board
  const board: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );

  // Place mines randomly
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }

  // Calculate adjacent mines for each cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine) {
        board[r][c].adjacentMines = getMinesCount(board, r, c);
      }
    }
  }

  return board;
};

export const cloneBoard = (board: Board): Board =>
  board.map((row) => row.map((cell) => ({ ...cell })));

export const getMinesCount = (board: Board, row: number, col: number): number => {
  const rows = board.length;
  const cols = board[0].length;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
        count++;
      }
    }
  }
  return count;
};

export const revealCell = (board: Board, row: number, col: number): Board => {
  const newBoard = cloneBoard(board);
  const cell = newBoard[row][col];

  if (cell.isRevealed || cell.isFlagged) return newBoard;

  cell.isRevealed = true;

  // Flood fill for empty cells (adjacentMines === 0)
  if (!cell.isMine && cell.adjacentMines === 0) {
    const rows = board.length;
    const cols = board[0].length;
    const stack: Position[] = [{ row, col }];
    const visited = new Set<string>();
    visited.add(`${row},${col}`);

    while (stack.length > 0) {
      const { row: cr, col: cc } = stack.pop()!;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = cr + dr;
          const nc = cc + dc;
          const key = `${nr},${nc}`;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(key)) {
            visited.add(key);
            const neighbor = newBoard[nr][nc];
            if (!neighbor.isMine && !neighbor.isFlagged) {
              neighbor.isRevealed = true;
              if (neighbor.adjacentMines === 0) {
                stack.push({ row: nr, col: nc });
              }
            }
          }
        }
      }
    }
  }

  return newBoard;
};

export const toggleFlag = (board: Board, row: number, col: number): Board => {
  const newBoard = cloneBoard(board);
  const cell = newBoard[row][col];
  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }
  return newBoard;
};

export const checkWin = (board: Board): boolean => {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      // Win: all non-mine cells are revealed
      if (!cell.isMine && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
};

export const countFlags = (board: Board): number => {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) count++;
    }
  }
  return count;
};

export const countMines = (board: Board): number => {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine) count++;
    }
  }
  return count;
};

export const revealAllMines = (board: Board): Board => {
  const newBoard = cloneBoard(board);
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.isMine) cell.isRevealed = true;
    }
  }
  return newBoard;
};
