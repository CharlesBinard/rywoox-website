import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { useAchievementStore } from '@/stores/achievementStore';
import { useGameStore } from '@/stores/gameStore';

type Player = 1 | 2;
type Cell = Player | null;
type Board = Cell[][];

const ROWS = 6;
const COLS = 7;
const GAME_ID = 'connectfour';

const createEmptyBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const checkWinner = (board: Board): { winner: Player; cells: [number, number][] } | null => {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r][c];
      if (p && board[r][c + 1] === p && board[r][c + 2] === p && board[r][c + 3] === p) {
        return {
          winner: p,
          cells: [
            [r, c],
            [r, c + 1],
            [r, c + 2],
            [r, c + 3],
          ],
        };
      }
    }
  }
  // Vertical
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (p && board[r + 1][c] === p && board[r + 2][c] === p && board[r + 3][c] === p) {
        return {
          winner: p,
          cells: [
            [r, c],
            [r + 1, c],
            [r + 2, c],
            [r + 3, c],
          ],
        };
      }
    }
  }
  // Diagonal \
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r][c];
      if (
        p &&
        board[r + 1][c + 1] === p &&
        board[r + 2][c + 2] === p &&
        board[r + 3][c + 3] === p
      ) {
        return {
          winner: p,
          cells: [
            [r, c],
            [r + 1, c + 1],
            [r + 2, c + 2],
            [r + 3, c + 3],
          ],
        };
      }
    }
  }
  // Diagonal /
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r][c];
      if (
        p &&
        board[r - 1][c + 1] === p &&
        board[r - 2][c + 2] === p &&
        board[r - 3][c + 3] === p
      ) {
        return {
          winner: p,
          cells: [
            [r, c],
            [r - 1, c + 1],
            [r - 2, c + 2],
            [r - 3, c + 3],
          ],
        };
      }
    }
  }
  return null;
};

const getDropRow = (board: Board, col: number): number => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return -1;
};

const isBoardFull = (board: Board): boolean => board[0].every((cell) => cell !== null);

export const ConnectFourGame = () => {
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const saveScore = useGameStore((s) => s.saveScore);
  const { playSound, startMusic, pauseMusic } = useAudio();
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [current, setCurrent] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [dropping, setDropping] = useState<{ col: number; row: number; player: Player } | null>(
    null
  );
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const achievementsCheckedRef = useRef(false);

  const playerColors = {
    1: {
      bg: 'bg-neon-cyan',
      glow: 'shadow-[0_0_20px_rgba(0,245,255,0.8)]',
      text: 'text-neon-cyan',
      border: 'border-neon-cyan',
    },
    2: {
      bg: 'bg-neon-pink',
      glow: 'shadow-[0_0_20px_rgba(255,55,95,0.8)]',
      text: 'text-neon-pink',
      border: 'border-neon-pink',
    },
  };

  const handleColumnClick = useCallback(
    (col: number) => {
      if (winner || dropping) return;

      const row = getDropRow(board, col);
      if (row === -1) return;

      playSound('click');
      setDropping({ col, row, player: current });
      setGameStarted(true);

      // Animate drop
      setTimeout(() => {
        setBoard((prev) => {
          const newBoard = prev.map((r) => [...r]);
          newBoard[row][col] = current;
          return newBoard;
        });

        setTimeout(() => {
          setDropping(null);

          // Check winner after piece is placed
          setBoard((prev) => {
            const result = checkWinner(prev);
            if (result) {
              setWinner(result.winner);
              setWinningCells(result.cells);
            } else if (isBoardFull(prev)) {
              setWinner('draw');
            } else {
              setCurrent(current === 1 ? 2 : 1);
            }
            return prev;
          });
        }, 50);
      }, 400);
    },
    [board, current, winner, dropping, playSound]
  );

  const reset = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrent(1);
    setWinner(null);
    setWinningCells([]);
    setDropping(null);
    setGameStarted(false);
    achievementsCheckedRef.current = false;
    startMusic();
  }, [startMusic]);

  const isWinningCell = (r: number, c: number) =>
    winningCells.some(([wr, wc]) => wr === r && wc === c);

  const statusText = () => {
    if (winner === 'draw') return 'Égalité !';
    if (winner) return `Joueur ${winner} gagne ! 🎉`;
    return `Tour du Joueur ${current}`;
  };

  const statusColor =
    winner === 1 || (winner === null && current === 1)
      ? playerColors[1].text
      : winner === 2
        ? playerColors[2].text
        : winner === 'draw'
          ? 'text-gray-400'
          : 'text-gray-300';

  // Check achievements on game over
  useEffect(() => {
    if (winner && gameStarted && !achievementsCheckedRef.current) {
      achievementsCheckedRef.current = true;
      if (winner !== 'draw') {
        saveScore(GAME_ID, 3);
        checkAchievements(GAME_ID, { wins: 1, gamesPlayed: 1 });
      } else {
        saveScore(GAME_ID, 1);
        checkAchievements(GAME_ID, { gamesPlayed: 1 });
      }
    }
  }, [winner, gameStarted, saveScore, checkAchievements]);

  // Music control based on game state
  useEffect(() => {
    if (gameStarted && !winner) {
      startMusic();
    } else {
      pauseMusic();
    }
  }, [gameStarted, winner, startMusic, pauseMusic]);

  // Win/lose sounds
  useEffect(() => {
    if (winner && gameStarted) {
      if (winner === 'draw') {
        playSound('gameOver');
      } else {
        playSound('win');
      }
    }
  }, [winner, gameStarted, playSound]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Status */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          key={statusText()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-xl md:text-2xl font-bold ${statusColor}`}
        >
          {statusText()}
        </motion.div>
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 mt-2"
          >
            <button
              onClick={() => {
                playSound('click');
                reset();
              }}
              className="px-6 py-2.5 rounded-xl bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan/30 transition-all cursor-pointer text-sm"
            >
              REJOUER
            </button>
            <button
              onClick={() => {
                playSound('click');
                reset();
              }}
              className="px-5 py-2.5 rounded-xl glass border border-dark-border text-gray-400 text-sm hover:text-gray-300 hover:border-gray-600 transition-all cursor-pointer"
            >
              Reset
            </button>
          </motion.div>
        )}
      </div>

      {/* Board wrapper */}
      <div className="relative">
        {/* Board */}
        <motion.div className="relative p-3 rounded-2xl glass border border-dark-border" layout>
          {/* Hover column indicator overlay */}
          <AnimatePresence>
            {hoverCol !== null && !winner && !dropping && (
              <div
                className="absolute inset-0 pointer-events-none z-10 p-3 grid gap-1"
                style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: COLS }, (_, c) => (
                  <div
                    key={`hover-col-${c}`}
                    className={`flex items-start justify-center pt-0 rounded-full transition-all duration-150 ${c === hoverCol ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <div
                      className={`w-12 md:w-14 h-12 rounded-full ${playerColors[current].bg} ${playerColors[current].glow}`}
                      style={{ opacity: 0.55 }}
                    />
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Grid background */}
          <div
            className="grid gap-1 relative z-0"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const player = board[r][c];
                const isWin = isWinningCell(r, c);
                const isDroppingHere = dropping && dropping.row === r && dropping.col === c;

                return (
                  <motion.div
                    key={`cell-${r}-${c}`}
                    className={`
                      w-12 h-12 md:w-14 md:h-14 rounded-full
                      border-2 border-dark-border
                      flex items-center justify-center
                      relative overflow-hidden
                      transition-colors duration-200
                    `}
                    style={{ background: 'rgba(10,10,15,0.8)' }}
                    onMouseEnter={() => setHoverCol(c)}
                    onMouseLeave={() => setHoverCol(null)}
                    onClick={() => handleColumnClick(c)}
                  >
                    {/* Slot hole */}
                    <div className="absolute inset-1 rounded-full bg-dark-bg/80" />

                    {/* Piece */}
                    <AnimatePresence>
                      {isDroppingHere ? (
                        <motion.div
                          key="dropping"
                          initial={{ y: -400 }}
                          animate={{ y: 0 }}
                          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className={`
                            absolute inset-1 rounded-full
                            ${playerColors[dropping.player].bg}
                            ${isWin ? playerColors[dropping.player].glow : 'opacity-90'}
                          `}
                        />
                      ) : player ? (
                        <motion.div
                          key="placed"
                          initial={isWin ? { scale: 0 } : false}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className={`
                            absolute inset-1 rounded-full
                            ${playerColors[player].bg}
                            ${isWin ? playerColors[player].glow : 'opacity-90'}
                            ${isWin ? 'scale-110' : ''}
                          `}
                        />
                      ) : null}
                    </AnimatePresence>

                    {/* Win glow ring */}
                    {isWin && player && (
                      <motion.div
                        initial={{ scale: 1.4, opacity: 0 }}
                        animate={{ scale: 1.8, opacity: 0.4 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                        className={`
                          absolute inset-1 rounded-full
                          border-2 ${playerColors[player].border}
                        `}
                      />
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Column click overlays */}
          <div
            className="absolute inset-0 flex gap-1 p-3 pointer-events-none"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: COLS }, (_, c) => (
              <div key={`col-overlay-${c}`} className="relative pointer-events-auto cursor-pointer">
                {!winner && !dropping && getDropRow(board, c) !== -1 && (
                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
                    onMouseEnter={() => setHoverCol(c)}
                    onMouseLeave={() => setHoverCol(null)}
                    onClick={() => handleColumnClick(c)}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Player indicators */}
      <div className="flex items-center gap-6 mt-2">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl glass border ${current === 1 && !winner ? 'border-neon-cyan/60' : 'border-dark-border'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-neon-cyan ${current === 1 && !winner ? 'shadow-[0_0_10px_rgba(0,245,255,0.8)]' : ''}`}
          />
          <span className="text-sm font-semibold text-neon-cyan">Joueur 1</span>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl glass border ${current === 2 && !winner ? 'border-neon-pink/60' : 'border-dark-border'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-neon-pink ${current === 2 && !winner ? 'shadow-[0_0_10px_rgba(255,55,95,0.8)]' : ''}`}
          />
          <span className="text-sm font-semibold text-neon-pink">Joueur 2</span>
        </div>
      </div>

      {/* Instructions */}
      {!gameStarted && !winner && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-sm text-center"
        >
          Clique sur une colonne pour lâcher ton pion
        </motion.p>
      )}
    </div>
  );
};
