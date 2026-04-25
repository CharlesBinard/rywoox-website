'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { useAchievementStore } from '@/stores/achievementStore';
import { useGameStore } from '@/stores/gameStore';

type Player = 'X' | 'O';
type Cell = Player | null;
type Board = Cell[];

const GAME_ID = 'tictactoe';

const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const checkWinner = (board: Board): { winner: Player; pattern: number[] } | null => {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, pattern };
    }
  }
  return null;
};

const minimax = (board: Board, depth: number, isMax: boolean, aiPlayer: Player): number => {
  const result = checkWinner(board);
  if (result) return result.winner === aiPlayer ? 10 - depth : depth - 10;
  if (board.every((c) => c !== null)) return 0;

  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiPlayer;
        best = Math.max(best, minimax(board, depth + 1, false, aiPlayer));
        board[i] = null;
      }
    }
    return best;
  }
  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = humanPlayer;
      best = Math.min(best, minimax(board, depth + 1, true, aiPlayer));
      board[i] = null;
    }
  }
  return best;
};

const bestMove = (board: Board, aiPlayer: Player): number => {
  let best = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer);
      board[i] = null;
      if (score > best) {
        best = score;
        move = i;
      }
    }
  }
  return move;
};

const ScoreModal = ({ onClose }: { onClose: () => void }) => {
  const scores = useGameStore((s) => s.leaderboard[GAME_ID] ?? []).slice(0, 10);

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
          <h2 className="text-xl font-black text-neon-cyan">🏆 Scores</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {scores.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Aucun score encore. Jouez !</p>
        ) : (
          <ul className="space-y-2">
            {scores.map((entry, i) => (
              <li
                key={entry.date}
                className="flex items-center gap-3 bg-dark-bg rounded-lg px-3 py-2"
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-400 text-black' : 'bg-dark-border text-gray-500'}`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-mono text-gray-300 truncate">
                  {entry.name || 'Anonymous'}
                </span>
                <span className="text-neon-cyan font-black text-sm">{entry.score}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
};

export const TicTacToeGame = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [human, setHuman] = useState<Player>('X');
  const [isHumanTurn, setIsHumanTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningPattern, setWinningPattern] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [showScores, setShowScores] = useState(false);

  const saveScore = useGameStore((s) => s.saveScore);
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const { playSound, startMusic, pauseMusic } = useAudio();

  const handleGameOver = useCallback(
    (w: Player | 'draw' | null) => {
      if (w === human) {
        saveScore(GAME_ID, 3);
        checkAchievements(GAME_ID, { wins: 1, gamesPlayed: 1 });
      } else if (w === 'draw') {
        saveScore(GAME_ID, 1);
        checkAchievements(GAME_ID, { gamesPlayed: 1 });
      }
    },
    [human, saveScore, checkAchievements]
  );

  const makeAiMove = useCallback(
    (currentBoard: Board, aiPlayer: Player) => {
      const aiMove = bestMove(currentBoard, aiPlayer);
      if (aiMove === -1) return;

      const newBoard = [...currentBoard];
      newBoard[aiMove] = aiPlayer;
      setBoard(newBoard);

      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result.winner);
        setWinningPattern(result.pattern);
        setGameOver(true);
        handleGameOver(result.winner);
      } else if (newBoard.every((c) => c !== null)) {
        setWinner('draw');
        setGameOver(true);
        handleGameOver('draw');
      } else {
        setIsHumanTurn(true);
      }
    },
    [handleGameOver]
  );

  const reset = useCallback(
    (h: Player) => {
      const emptyBoard = Array(9).fill(null);
      setBoard(emptyBoard);
      setHuman(h);
      setIsHumanTurn(h === 'X');
      setGameOver(false);
      setWinner(null);
      setWinningPattern([]);
      setStarted(true);
      startMusic();

      // If human is O, AI (X) plays first
      if (h === 'O') {
        const aiMove = bestMove(emptyBoard, 'X');
        if (aiMove !== -1) {
          const newBoard = [...emptyBoard];
          newBoard[aiMove] = 'X';
          setBoard(newBoard);
          setIsHumanTurn(true);
        }
      }
    },
    [startMusic]
  );

  // Win/lose sounds
  useEffect(() => {
    if (gameOver) {
      if (winner === human) {
        playSound('win');
      } else {
        playSound('gameOver');
      }
    }
  }, [gameOver, winner, human, playSound]);

  // Music control based on started and gameOver
  useEffect(() => {
    if (started && !gameOver) {
      startMusic();
    } else {
      pauseMusic();
    }
  }, [started, gameOver, startMusic, pauseMusic]);

  const handleCell = useCallback(
    (idx: number) => {
      if (!started || board[idx] || gameOver || !isHumanTurn) return;
      playSound('click');

      const newBoard = [...board];
      newBoard[idx] = human;
      setBoard(newBoard);
      setIsHumanTurn(false);

      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result.winner);
        setWinningPattern(result.pattern);
        setGameOver(true);
        handleGameOver(result.winner);
        return;
      }
      if (newBoard.every((c) => c !== null)) {
        setWinner('draw');
        setGameOver(true);
        handleGameOver('draw');
        return;
      }

      // AI responds
      const aiPlayer = human === 'X' ? 'O' : 'X';
      makeAiMove(newBoard, aiPlayer);
    },
    [started, board, gameOver, isHumanTurn, human, handleGameOver, playSound, makeAiMove]
  );

  const renderCell = (idx: number) => {
    const value = board[idx];
    const isWinning = winningPattern.includes(idx);
    return (
      <motion.button
        key={idx}
        whileHover={{ scale: value ? 1 : 1.05 }}
        whileTap={{ scale: value ? 1 : 0.95 }}
        onClick={() => handleCell(idx)}
        disabled={!!value || gameOver || !started || !isHumanTurn}
        className={`
          w-20 h-20 md:w-24 md:h-24 rounded-xl text-4xl md:text-5xl font-black
          flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${
            isWinning
              ? value === 'X'
                ? 'bg-neon-cyan/30 border-neon-cyan'
                : 'bg-neon-purple/30 border-neon-purple'
              : 'bg-dark-card border border-dark-border hover:border-gray-600'
          }
          disabled:cursor-not-allowed
        `}
      >
        <AnimatePresence mode="wait">
          {value && (
            <motion.span
              key={idx}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {value === 'X' ? (
                <span className="text-neon-cyan">X</span>
              ) : (
                <span className="text-neon-purple">O</span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence>
        {showScores && <ScoreModal onClose={() => setShowScores(false)} />}
      </AnimatePresence>

      {!started && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold text-gray-300">Choisis ton côté</h2>
          <div className="flex gap-4">
            <button
              onClick={() => reset('X')}
              className="px-8 py-3 rounded-xl bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan font-bold text-lg hover:bg-neon-cyan/30 transition-all cursor-pointer"
            >
              X (Premier)
            </button>
            <button
              onClick={() => reset('O')}
              className="px-8 py-3 rounded-xl bg-neon-purple/20 border-2 border-neon-purple text-neon-purple font-bold text-lg hover:bg-neon-purple/30 transition-all cursor-pointer"
            >
              O (Second)
            </button>
          </div>
        </div>
      )}

      {started && (
        <>
          <div className="flex gap-6 text-sm font-mono">
            {winner === 'draw' ? (
              <div className="text-gray-400">Égalité !</div>
            ) : winner ? (
              <div className={winner === human ? 'text-neon-cyan' : 'text-neon-purple'}>
                {winner === human ? 'TROP FORT !' : "L'IA GAGNE..."}
              </div>
            ) : (
              <div className="text-gray-400">
                Tour:{' '}
                <span className={isHumanTurn ? 'text-neon-cyan' : 'text-neon-purple'}>
                  {isHumanTurn ? `Toi (${human})` : `IA (${human === 'X' ? 'O' : 'X'})`}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl glass border border-dark-border">
            {Array.from({ length: 9 }, (_, i) => renderCell(i))}
          </div>

          <div className="flex gap-3">
            {gameOver && (
              <button
                onClick={() => reset(human)}
                className="px-8 py-3 rounded-xl bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan/30 transition-all cursor-pointer"
              >
                REJOUER
              </button>
            )}
            {!gameOver && (
              <button
                onClick={() => reset(human)}
                className="px-6 py-2 rounded-xl glass border border-dark-border text-gray-500 text-sm hover:text-gray-300 hover:border-gray-600 transition-all cursor-pointer"
              >
                Recommencer
              </button>
            )}
            <button
              onClick={() => setShowScores(true)}
              className="px-6 py-2 rounded-xl bg-dark-card border border-dark-border text-gray-400 text-sm hover:text-neon-cyan hover:border-neon-cyan/40 transition-all cursor-pointer"
            >
              🏆 Scores
            </button>
          </div>
        </>
      )}
    </div>
  );
};
