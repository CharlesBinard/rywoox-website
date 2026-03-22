/**
 * Pure TicTacToe logic — extracted for testability.
 */

export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export interface WinnerResult {
  winner: Player;
  pattern: readonly number[];
}

/**
 * Check if there's a winner on the current board.
 */
export const checkWinner = (board: Board): WinnerResult | null => {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, pattern };
    }
  }
  return null;
};

/**
 * Check if the board is full (draw condition).
 */
export const isBoardFull = (board: Board): boolean => board.every((cell) => cell !== null);

/**
 * Check if the game is over (winner or draw).
 */
export const isGameOver = (board: Board): boolean =>
  checkWinner(board) !== null || isBoardFull(board);

/**
 * Get list of empty cell indices.
 */
export const getEmptyCells = (board: Board): number[] =>
  board.map((cell, idx) => (cell === null ? idx : -1)).filter((idx) => idx !== -1);

/**
 * Apply a move to a copy of the board.
 */
export const applyMove = (board: Board, index: number, player: Player): Board => {
  if (board[index] !== null) return board;
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
};
