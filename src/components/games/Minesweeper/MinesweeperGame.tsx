'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type Board,
  checkWin,
  countFlags,
  createBoard,
  revealAllMines,
  revealCell,
  toggleFlag,
} from '@/lib/gameLogic/minesweeper';
import { useAchievementStore } from '@/stores/achievementStore';
import { useGameStore } from '@/stores/gameStore';

type GameState = 'ready' | 'playing' | 'won' | 'lost';

const ROWS = 9;
const COLS = 9;
const MINE_COUNT = 10;
const GAME_ID = 'minesweeper';

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

const makeSafeBoard = (safeRow: number, safeCol: number): Board => {
  let board = createBoard(ROWS, COLS, MINE_COUNT);
  let attempts = 0;

  while (board[safeRow][safeCol].isMine && attempts < 200) {
    board = createBoard(ROWS, COLS, MINE_COUNT);
    attempts++;
  }

  return board;
};

const formatTime = (seconds: number) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
};

const ScoreModal = ({ onClose }: { onClose: () => void }) => {
  const scores = useGameStore((s) => s.leaderboard[GAME_ID] ?? []);

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
        className="bg-dark-card border border-dark-border rounded-xl p-6 w-80 max-w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-300">🏆 Scores</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none cursor-pointer"
          >
            x
          </button>
        </div>

        {scores.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Aucun score encore.</p>
        ) : (
          <ul className="space-y-2">
            {scores.slice(0, 10).map((entry, index) => (
              <li
                key={entry.date}
                className="flex items-center justify-between rounded-lg bg-dark-bg px-3 py-2 font-mono text-sm"
              >
                <span className="text-gray-500">#{index + 1}</span>
                <span className="text-gray-300">{formatTime(entry.score)}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
};

const CellButton = ({
  cell,
  disabled,
  isLost,
  row,
  col,
  onReveal,
  onFlag,
}: {
  cell: Board[number][number];
  disabled: boolean;
  isLost: boolean;
  row: number;
  col: number;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
}) => {
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const clearLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const handlePointerDown = () => {
    if (disabled || cell.isRevealed) return;
    longPressedRef.current = false;
    longPressRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onFlag(row, col);
    }, 400);
  };

  const handlePointerUp = () => {
    clearLongPress();
    if (disabled || cell.isRevealed) return;
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    if (!cell.isFlagged) onReveal(row, col);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!disabled) onFlag(row, col);
  };

  const showMine = cell.isMine && (cell.isRevealed || isLost);
  const showNumber = cell.isRevealed && !cell.isMine && cell.adjacentMines > 0;

  let content: React.ReactNode = <span className="text-gray-600">.</span>;
  let stateClass = 'bg-dark-card border-dark-border hover:border-gray-500 hover:bg-dark-border';

  if (cell.isFlagged && !cell.isRevealed) {
    content = '🚩';
    stateClass = 'bg-yellow-400/10 border-yellow-400/50';
  }

  if (showMine) {
    content = '💣';
    stateClass = cell.isRevealed
      ? 'bg-red-500/30 border-red-500'
      : 'bg-red-500/10 border-red-500/40';
  } else if (showNumber) {
    content = cell.adjacentMines;
    stateClass = 'bg-dark-bg border-dark-border';
  } else if (cell.isRevealed) {
    content = null;
    stateClass = 'bg-dark-bg/80 border-dark-border';
  }

  return (
    <motion.button
      type="button"
      whileTap={!disabled && !cell.isRevealed ? { scale: 0.95 } : undefined}
      onPointerDown={handlePointerDown}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      className={`aspect-square rounded-md border text-base font-black flex items-center justify-center select-none transition-colors cursor-pointer ${stateClass}`}
      aria-label={`Case ${row + 1}-${col + 1}`}
    >
      {showNumber ? (
        <span className={NUMBER_COLORS[cell.adjacentMines] ?? 'text-gray-300'}>{content}</span>
      ) : (
        content
      )}
    </motion.button>
  );
};

export const MinesweeperGame = () => {
  const [board, setBoard] = useState<Board>(() => createBoard(ROWS, COLS, MINE_COUNT));
  const [gameState, setGameState] = useState<GameState>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const completedRef = useRef(false);

  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const saveScore = useGameStore((s) => s.saveScore);

  const flagsUsed = useMemo(() => countFlags(board), [board]);
  const disabled = gameState === 'won' || gameState === 'lost';

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const finishGame = useCallback(
    (nextState: 'won' | 'lost', finalBoard: Board) => {
      if (completedRef.current) return;
      completedRef.current = true;

      setBoard(nextState === 'lost' ? revealAllMines(finalBoard) : finalBoard);
      setGameState(nextState);
      saveScore(GAME_ID, elapsed);

      if (nextState === 'won') {
        checkAchievements(GAME_ID, { wins: 1, gamesPlayed: 1, bestTime: elapsed });
      } else {
        checkAchievements(GAME_ID, { gamesPlayed: 1 });
      }
    },
    [elapsed, saveScore, checkAchievements]
  );

  const handleReveal = useCallback(
    (row: number, col: number) => {
      if (disabled) return;

      const sourceBoard = gameState === 'ready' ? makeSafeBoard(row, col) : board;
      const nextBoard = revealCell(sourceBoard, row, col);
      const revealedCell = nextBoard[row][col];

      if (gameState === 'ready') {
        setGameState('playing');
      }

      if (revealedCell.isMine) {
        finishGame('lost', nextBoard);
        return;
      }

      if (checkWin(nextBoard)) {
        finishGame('won', nextBoard);
        return;
      }

      setBoard(nextBoard);
    },
    [board, disabled, gameState, finishGame]
  );

  const handleFlag = useCallback(
    (row: number, col: number) => {
      if (disabled) return;
      setBoard((currentBoard) => toggleFlag(currentBoard, row, col));
    },
    [disabled]
  );

  const handleReset = () => {
    completedRef.current = false;
    setBoard(createBoard(ROWS, COLS, MINE_COUNT));
    setGameState('ready');
    setElapsed(0);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <AnimatePresence>
        {showScores && <ScoreModal onClose={() => setShowScores(false)} />}
      </AnimatePresence>

      <div className="flex items-center justify-between w-full max-w-[380px] px-1">
        <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-lg px-4 py-2">
          <span>🚩</span>
          <span className="font-mono font-black text-gray-200">
            {String(Math.max(0, MINE_COUNT - flagsUsed)).padStart(2, '0')}
          </span>
        </div>

        <div
          className={`font-mono font-black px-4 py-2 rounded-lg border ${
            gameState === 'won'
              ? 'bg-green-500/20 border-green-500 text-green-400'
              : gameState === 'lost'
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-dark-card border-dark-border text-gray-300'
          }`}
        >
          {formatTime(elapsed)}
        </div>
      </div>

      <div className="w-full max-w-[380px] rounded-xl border border-dark-border bg-dark-bg/80 p-2 shadow-[0_0_40px_rgba(0,245,255,0.08)]">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <CellButton
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                disabled={disabled}
                isLost={gameState === 'lost'}
                row={rowIndex}
                col={colIndex}
                onReveal={handleReveal}
                onFlag={handleFlag}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'won' && (
          <motion.div
            key="won"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xl font-black text-green-400"
          >
            GAGNE EN {elapsed}s
          </motion.div>
        )}
        {gameState === 'lost' && (
          <motion.div
            key="lost"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xl font-black text-red-400"
          >
            PERDU
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 rounded-lg bg-dark-card border border-dark-border text-gray-300 font-bold hover:border-gray-500 hover:text-white transition-all cursor-pointer"
        >
          Recommencer
        </button>
        <button
          type="button"
          onClick={() => setShowScores(true)}
          className="px-5 py-3 rounded-lg bg-dark-card border border-dark-border text-gray-400 text-sm hover:text-white hover:border-gray-500 transition-all cursor-pointer"
        >
          Scores
        </button>
      </div>

      <p className="text-gray-600 text-xs text-center">
        Clic gauche: révéler | Clic droit ou appui long: drapeau
      </p>
    </div>
  );
};
