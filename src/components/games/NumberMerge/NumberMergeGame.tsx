'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAchievementStore } from '@/stores/achievementStore';
import { useGameStore } from '@/stores/gameStore';

const GRID_SIZE = 4;
const CELL_SIZE = 80;
const GAP = 10;

type CellValue = number | null;
type Grid = CellValue[][];

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

let tileIdCounter = 0;
const getNextId = () => ++tileIdCounter;

const createEmptyGrid = (): Grid =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const getEmptyCells = (grid: Grid): [number, number][] => {
  const empty: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) empty.push([r, c]);
    }
  }
  return empty;
};

const addRandomTile = (grid: Grid): [Grid, Tile | null] => {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return [grid, null];
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = grid.map((row) => [...row]);
  const value = Math.random() < 0.9 ? 2 : 4;
  newGrid[r][c] = value;
  const tile: Tile = { id: getNextId(), value, row: r, col: c, isNew: true, isMerged: false };
  return [newGrid, tile];
};

const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const slideRowLeft = (row: CellValue[]): { result: CellValue[]; score: number; moved: boolean } => {
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

const moveGrid = (grid: Grid, dir: Direction): { grid: Grid; score: number; moved: boolean } => {
  // Rotate so we always slide left
  const rotations: Record<Direction, number> = { LEFT: 0, UP: 3, RIGHT: 2, DOWN: 1 };
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
  // Rotate back
  const backRotations = (4 - rotations[dir]) % 4;
  const finalGrid = rotateGrid(newGrid, backRotations);
  return { grid: finalGrid, score: totalScore, moved };
};

const canMove = (grid: Grid): boolean => {
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

const getTileColor = (
  value: number
): { bg: string; text: string; glow: string; border: string } => {
  const colors: Record<number, { bg: string; text: string; glow: string; border: string }> = {
    2: {
      bg: 'bg-cyan-400/20',
      text: 'text-cyan-300',
      glow: 'shadow-[0_0_15px_rgba(0,245,255,0.3)]',
      border: 'border-cyan-400/40',
    },
    4: {
      bg: 'bg-cyan-500/30',
      text: 'text-cyan-200',
      glow: 'shadow-[0_0_20px_rgba(0,245,255,0.4)]',
      border: 'border-cyan-400/60',
    },
    8: {
      bg: 'bg-pink-400/20',
      text: 'text-pink-300',
      glow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
      border: 'border-pink-400/40',
    },
    16: {
      bg: 'bg-pink-500/30',
      text: 'text-pink-200',
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
      border: 'border-pink-400/60',
    },
    32: {
      bg: 'bg-purple-500/30',
      text: 'text-purple-200',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
      border: 'border-purple-500/60',
    },
    64: {
      bg: 'bg-purple-600/40',
      text: 'text-purple-100',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]',
      border: 'border-purple-500/80',
    },
    128: {
      bg: 'bg-orange-500/30',
      text: 'text-orange-200',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
      border: 'border-orange-500/60',
    },
    256: {
      bg: 'bg-orange-600/40',
      text: 'text-orange-100',
      glow: 'shadow-[0_0_25px_rgba(249,115,22,0.5)]',
      border: 'border-orange-500/80',
    },
    512: {
      bg: 'bg-yellow-500/30',
      text: 'text-yellow-200',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
      border: 'border-yellow-500/60',
    },
    1024: {
      bg: 'bg-yellow-600/40',
      text: 'text-yellow-100',
      glow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)]',
      border: 'border-yellow-500/80',
    },
    2048: {
      bg: 'bg-neon-cyan/30',
      text: 'text-neon-cyan font-bold',
      glow: 'shadow-[0_0_30px_rgba(0,245,255,0.6)]',
      border: 'border-neon-cyan/80',
    },
  };
  if (colors[value]) return colors[value];
  // For values > 2048
  return {
    bg: 'bg-neon-pink/40',
    text: 'text-neon-pink font-bold',
    glow: 'shadow-[0_0_35px_rgba(255,55,95,0.6)]',
    border: 'border-neon-pink/80',
  };
};

const getTileFontSize = (value: number): string => {
  if (value < 100) return 'text-3xl';
  if (value < 1000) return 'text-2xl';
  if (value < 10000) return 'text-xl';
  return 'text-lg';
};

const GAME_ID = 'numbermerge';

interface NumberMergeGameProps {
  paused?: boolean;
}

export const NumberMergeGame = ({ paused = false }: NumberMergeGameProps) => {
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const saveScore = useGameStore((s) => s.saveScore);
  const [grid, setGrid] = useState<Grid>(() => {
    const g = createEmptyGrid();
    const [g1] = addRandomTile(g);
    const [g2] = addRandomTile(g1);
    return g2;
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isAnimating = useRef(false);
  const achievementsCheckedRef = useRef(false);

  const buildTiles = useCallback(
    (g: Grid, isNewTile: boolean = false, newTilePos: [number, number] | null = null): Tile[] => {
      const t: Tile[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (g[r][c] !== null) {
            t.push({
              id: getNextId(),
              value: g[r][c]!,
              row: r,
              col: c,
              isNew: isNewTile && newTilePos !== null && newTilePos[0] === r && newTilePos[1] === c,
              isMerged: false,
            });
          }
        }
      }
      return t;
    },
    []
  );

  const startGame = useCallback(() => {
    const g = createEmptyGrid();
    const [g1] = addRandomTile(g);
    const [g2] = addRandomTile(g1);
    setGrid(g2);
    setTiles(buildTiles(g2, true, null));
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
    setGameStarted(true);
    tileIdCounter = 0;
    achievementsCheckedRef.current = false;
  }, [buildTiles]);

  const handleMove = useCallback(
    (dir: Direction) => {
      if (paused) return;
      if (isAnimating.current) return;
      if (gameOver && !keepPlaying) return;

      const result = moveGrid(grid, dir);
      if (!result.moved) return;

      isAnimating.current = true;

      setGrid(result.grid);

      // Add new tile after a brief delay for animation
      setTimeout(() => {
        const [newGrid, newTile] = addRandomTile(result.grid);
        setGrid(newGrid);

        const newTiles = buildTiles(newGrid, true, newTile ? [newTile.row, newTile.col] : null);
        setTiles(newTiles);

        setScore((s) => s + result.score);
        setHighScore((h) => Math.max(h, score + result.score));

        if (!won && !keepPlaying) {
          const has2048 = newGrid.some((row) => row.some((v) => v === 2048));
          if (has2048) {
            setWon(true);
          }
        }

        if (!canMove(newGrid)) {
          setGameOver(true);
        }

        setTimeout(() => {
          isAnimating.current = false;
        }, 100);
      }, 150);
    },
    [grid, paused, gameOver, keepPlaying, won, score, buildTiles]
  );

  useEffect(() => {
    setTiles(buildTiles(grid));
  }, [grid, buildTiles]);

  // Keyboard controls
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
      W: 'UP',
      S: 'DOWN',
      A: 'LEFT',
      D: 'RIGHT',
    };

    const handleKey = (e: KeyboardEvent) => {
      if (keyMap[e.key]) {
        e.preventDefault();
        if (paused) return;
        handleMove(keyMap[e.key]);
        if (!gameStarted) setGameStarted(true);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove, paused, gameStarted]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    if (paused) {
      touchStartRef.current = null;
      return;
    }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 30) return; // Too short

    if (absDx > absDy) {
      handleMove(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      handleMove(dy > 0 ? 'DOWN' : 'UP');
    }

    if (!gameStarted) setGameStarted(true);
    touchStartRef.current = null;
  };

  // Check achievements on game end
  useEffect(() => {
    if ((gameOver || won) && gameStarted && !achievementsCheckedRef.current) {
      achievementsCheckedRef.current = true;
      const maxTile = grid.reduce<number>((max, row) => {
        const rowMax = Math.max(...(row.filter((v): v is number => v !== null) as number[]));
        return Math.max(max, rowMax);
      }, 0);
      saveScore(GAME_ID, score);
      if (won) {
        checkAchievements(GAME_ID, { gamesPlayed: 1, highestTile: Math.max(maxTile, 2048) });
      } else {
        checkAchievements(GAME_ID, { bestScore: score, gamesPlayed: 1, highestTile: maxTile });
      }
    }
  }, [gameOver, won, gameStarted, grid, score, checkAchievements, saveScore]);

  const gridWidth = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * GAP;
  const gridHeight = gridWidth;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="flex gap-8 text-lg font-mono">
        <div className="text-neon-cyan">
          SCORE <span className="text-white font-bold">{score}</span>
        </div>
        <div className="text-neon-pink">
          BEST <span className="text-white font-bold">{highScore}</span>
        </div>
      </div>

      <div
        className="relative rounded-2xl p-3 backdrop-blur-sm border border-dark-border"
        style={{
          background: 'rgba(10,10,15,0.8)',
          width: gridWidth,
          height: gridHeight,
          boxShadow: '0 0 40px rgba(0,245,255,0.08)',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background cells */}
        <div
          className="absolute rounded-xl"
          style={{
            top: GAP,
            left: GAP,
            right: GAP,
            bottom: GAP,
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gap: `${GAP}px`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-dark-card border border-dark-border"
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
            />
          ))}
        </div>

        {/* Tiles */}

        <div className="absolute" style={{ top: GAP, left: GAP }}>
          {tiles.map((tile) => {
            const color = getTileColor(tile.value);
            return (
              <motion.div
                key={tile.id}
                className={`absolute rounded-xl flex items-center justify-center font-black ${color.bg} ${color.text} ${color.glow} ${color.border} border`}
                layout
                layoutId={`tile-${tile.id}`}
                initial={false}
                animate={{
                  x: tile.col * (CELL_SIZE + GAP),
                  y: tile.row * (CELL_SIZE + GAP),
                  scale: tile.isNew ? [0, 1.1, 1] : 1,
                  opacity: 1,
                }}
                transition={{
                  x: { type: 'spring', stiffness: 600, damping: 30 },
                  y: { type: 'spring', stiffness: 600, damping: 30 },
                  scale: tile.isNew ? { duration: 0.2, times: [0, 0.7, 1] } : { duration: 0.1 },
                }}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              >
                <span className={getTileFontSize(tile.value)}>{tile.value}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Start overlay */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-dark-bg/90 z-10">
            <div className="text-4xl mb-4">🔢</div>
            <div className="text-2xl font-bold text-neon-cyan mb-2">2048</div>
            <div className="text-gray-400 mb-6 text-center px-8 text-sm">
              <span className="text-white">Arrow keys</span> ou{' '}
              <span className="text-white">WASD</span> pour bouger
              <br />
              <span className="text-gray-500 text-xs">Swipe sur mobile</span>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan/30 transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] cursor-pointer"
            >
              JOUER
            </button>
          </div>
        )}

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-dark-bg/90 z-10">
            <div className="text-4xl mb-4">💀</div>
            <div className="text-2xl font-bold text-neon-pink mb-2">GAME OVER</div>
            <div className="text-gray-400 mb-2">
              Score: <span className="text-white font-bold">{score}</span>
            </div>
            {score >= highScore && score > 0 && (
              <div className="text-neon-pink mb-4 text-sm">🎉 NOUVEAU BEST !</div>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-lg bg-neon-pink/20 border border-neon-pink text-neon-pink font-bold hover:bg-neon-pink/30 transition-all hover:shadow-[0_0_20px_rgba(255,55,95,0.3)] cursor-pointer"
            >
              REJOUER
            </button>
          </div>
        )}

        {/* Win overlay */}
        {won && !keepPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-dark-bg/90 z-10">
            <div className="text-4xl mb-4">🏆</div>
            <div className="text-2xl font-bold text-neon-cyan mb-2">VOUS AVEZ GAGNÉ !</div>
            <div className="text-gray-400 mb-2">
              Score: <span className="text-white font-bold">{score}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setKeepPlaying(true);
                  setWon(false);
                }}
                className="px-6 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan/30 transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] cursor-pointer"
              >
                CONTINUER
              </button>
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-lg bg-dark-card border border-dark-border text-gray-300 font-bold hover:bg-dark-border transition-all cursor-pointer"
              >
                NOUVELLE PARTIE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile swipe hint */}
      <div className="text-gray-600 text-sm md:hidden">Swipe pour bouger</div>
      <div className="text-gray-600 text-sm hidden md:block">Arrow keys ou WASD pour bouger</div>
    </div>
  );
};
