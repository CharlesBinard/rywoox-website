'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Board,
  checkWin,
  cloneBoard,
  countFlags,
  createBoard,
  revealAllMines,
  revealCell,
  toggleFlag,
} from '@/lib/gameLogic/minesweeper';

type GameState = 'ready' | 'playing' | 'won' | 'lost';

const ROWS = 9;
const COLS = 9;
const MINE_COUNT = 10;

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-green-400',
  3: 'text-red-400',
  4: 'text-purple-500',
  5: 'text-red-600',
  6: 'text-cyan-500',
  7: 'text-white',
  8: 'text-gray-400',
};

const ScoreModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-card border border-dark-border rounded-2xl p-6 w-80 max-w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-neon-gray">🏆 Scores</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
        <p className="text-gray-500 text-sm text-center py-8">Aucun score encore. Jouez !</p>
      </motion.div>
    </motion.div>
  );
};

const StatusBar = ({
  flagsUsed,
  mineCount,
  elapsed,
  gameState,
}: {
  flagsUsed: number;
  mineCount: number;
  elapsed: number;
  gameState: GameState;
}) => {
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="flex items-center justify-between w-full max-w-xs px-2">
      <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-xl px-4 py-2">
        <span className="text-lg">🚩</span>
        <span className="font-mono font-black text-neon-gray text-lg">
          {String(mineCount - flagsUsed).padStart(2, '0')}
        </span>
      </div>

      <div
        className={`font-mono font-black text-xl px-4 py-2 rounded-xl border
          ${gameState === 'won' ? 'bg-green-500/20 border-green-500 text-green-400' : ''}
          ${gameState === 'lost' ? 'bg-red-500/20 border-red-500 text-red-400' : ''}
          ${gameState === 'playing' || gameState === 'ready' ? 'bg-dark-card border-dark-border text-gray-300' : ''}
        `}
      >
        {gameState === 'won' ? '🎉' : gameState === 'lost' ? '💥' : '⏱️'} {mins}:{secs}
      </div>
    </div>
  );
};

const Cell = ({
  cell,
  row,
  col,
  isLost,
  onReveal,
  onFlag,
}: {
  cell: { isMine: boolean; isRevealed: boolean; isFlagged: boolean; adjacentMines: number };
  row: number;
  col: number;
  isLost: boolean;
  onReveal: (r: number, c: number) => void;
  onFlag: (r: number, c: number) => void;
}) => {
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handlePointerDown = (_e: React.PointerEvent) => {
    if (cell.isRevealed) return;
    isLongPress.current = false;
    longPressRef.current = setTimeout(() => {
      isLongPress.current = true;
      onFlag(row, col);
    }, 400);
  };

  const handlePointerUp = (_e: React.PointerEvent) => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    if (!cell.isRevealed && !cell.isFlagged) {
      onReveal(row, col);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onFlag(row, col);
  };

  const revealed = cell.isRevealed;
  const flagged = cell.isFlagged;
  const isMine = cell.isMine;
  

  let bgClass = 'bg-dark-card border-dark-border';
  let content: React.ReactNode = null;
  let textColor = 'text-gray-500';

  if (revealed) {
    if (isMine) {
      bgClass = 'bg-red-500/30 border-red-500';
      content = '💣';
    } else if (cell.adjacentMines > 0) {
      bgClass = 'bg-dark-bg border-dark-border';
      content = cell.adjacentMines;
      textColor = NUMBER_COLORS[cell.adjacentMines] ?? 'text-gray-400';
    } else {
      bgClass = 'bg-dark-bg border-dark-border';
    }
  } else if (flagged) {
    content = '🚩';
  }

  if (isLost && isMine && !revealed) {
    bgClass = 'bg-red-500/20 border-red-500/50';
    content = '💣';
  }

  return (
    <motion.button
      key={`${row}-${col}`}
      whileHover={!revealed ? { scale: 1.05 } : {}}
      whileTap={!revealed ? { scale: 0.95 } : {}}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      className={`
        w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm md:text-base font-black
        flex items-center justify-center
        border transition-all duration-150 cursor-pointer select-none
        focus:outline-none focus:ring-2 focus:ring-neon-cyan/50
        ${bgClass}
        ${revealed && isMine ? 'shadow-[0_0_12px_rgba(239,68,68,0.6)]' : ''}
        ${!revealed ? 'hover:border-gray-500' : ''}
      `}
    >
      {content !== null ? (
        <span className={textColor}>{content}</span>
      ) : (
        <span className="text-gray-600">·</span>
      )}
    </motion.button>
  );
};

export const MinesweeperGame = () => {
  const [board, setBoard] = useState<Board>(() => createBoard(ROWS, COLS, MINE_COUNT));
  const [gameState, setGameState] = useState<GameState>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flagCount = countFlags(board);

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleReveal = useCallback(
    (row: number, col: number) => {
      if (gameState !== 'playing' && gameState !== 'ready') return;

      let newBoard: Board;
      if (gameState === 'ready') {
        // First reveal: create a new board but ensure the clicked cell is not a mine
        let attempts = 0;
        let b: Board;
        do {
          b = createBoard(ROWS, COLS, MINE_COUNT);
          attempts++;
        } while (b[row][col].isMine && attempts < 100);

        b = cloneBoard(b);
        b[row][col].isRevealed = true;
        // Flood fill if adjacentMines is 0
        if (b[row][col].adjacentMines === 0) {
          const stack: { row: number; col: number }[] = [{ row, col }];
          const visited = new Set<string>();
          visited.add(`${row},${col}`);
          const rows = b.length;
          const cols = b[0].length;
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
                  const neighbor = b[nr][nc];
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
        newBoard = b;
        setGameState('playing');
      } else {
        newBoard = revealCell(board, row, col);
      }

      setBoard(newBoard);

      // Check if hit a mine
      const cell =
        gameState === 'ready'
          ? (() => {
              let attempts = 0;
              let b: Board;
              do {
                b = createBoard(ROWS, COLS, MINE_COUNT);
                attempts++;
              } while (b[row][col].isMine && attempts < 100);
              return b[row][col];
            })()
          : board[row][col];

      if (cell.isMine) {
        setBoard(revealAllMines(newBoard));
        setGameState('lost');
        return;
      }

      // Check win
      if (checkWin(newBoard)) {
        setGameState('won');
      }
    },
    [board, gameState]
  );

  const handleFlag = useCallback(
    (row: number, col: number) => {
      if (gameState !== 'playing' && gameState !== 'ready') return;
      if (gameState === 'ready') setGameState('playing');
      const newBoard = toggleFlag(board, row, col);
      setBoard(newBoard);
    },
    [board, gameState]
  );

  const handleReset = () => {
    setBoard(createBoard(ROWS, COLS, MINE_COUNT));
    setGameState('ready');
    setElapsed(0);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <AnimatePresence>
        {showScores && <ScoreModal onClose={() => setShowScores(false)} />}
      </AnimatePresence>

      <StatusBar
        flagsUsed={flagCount}
        mineCount={MINE_COUNT}
        elapsed={elapsed}
        gameState={gameState}
      />

      <div className="grid gap-[3px] p-3 rounded-2xl glass border border-dark-border">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              row={r}
              col={c}
              isLost={gameState === 'lost'}
              onReveal={handleReveal}
              onFlag={handleFlag}
            />
          ))
        )}
      </div>

      <div className="flex items-center gap-3">
        {gameState === 'won' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-green-400"
          >
            🎉 GAGNÉ en {elapsed}s !
          </motion.div>
        )}
        {gameState === 'lost' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-red-400"
          >
            💥 PERDU...
          </motion.div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="px-8 py-3 rounded-xl bg-dark-card border border-dark-border text-gray-300 font-bold hover:border-gray-500 hover:text-white transition-all cursor-pointer"
        >
          🔄 Recommencer
        </button>
        <button
          onClick={() => setShowScores(true)}
          className="px-6 py-3 rounded-xl bg-dark-card border border-dark-border text-gray-400 text-sm hover:text-neon-gray hover:border-gray-500 transition-all cursor-pointer"
        >
          🏆 Scores
        </button>
      </div>

      <p className="text-gray-600 text-xs text-center">
        Clic gauche = révéler &nbsp;|&nbsp; Clic droit / long-press = 🚩
      </p>
    </div>
  );
};
