'use client';

// TODO: integrate leaderboard

import { useCallback, useEffect, useRef, useState } from 'react';

const COLS = 10;
const ROWS = 20;
const CELL = 28;
const COLORS = ['#00f5ff', '#bf5af2', '#ff375f', '#30d158', '#ffd60a', '#ff9f0a', '#32ade6'];

type Piece = { shape: number[][]; color: number };
type Pos = { x: number; y: number };

const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]], color: 0 }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 6,
  }, // O
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 1,
  }, // T
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 2,
  }, // L
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 3,
  }, // J
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 4,
  }, // S
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 5,
  }, // Z
];

const randomPiece = (): Piece => {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape: p.shape.map((r) => [...r]), color: p.color };
};

const rotate = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const out: number[][] = [];
  for (let c = 0; c < cols; c++) {
    out[c] = [];
    for (let r = rows - 1; r >= 0; r--) {
      out[c][rows - 1 - r] = shape[r][c];
    }
  }
  return out;
};

export const TetrisGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  const boardRef = useRef<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(-1)));
  const pieceRef = useRef<Piece | null>(null);
  const posRef = useRef<Pos>({ x: 0, y: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const nextPieceRef = useRef<Piece>(randomPiece());

  const spawnPiece = useCallback(() => {
    const p = nextPieceRef.current;
    const x = Math.floor((COLS - p.shape[0].length) / 2);
    const y = 0;
    pieceRef.current = p;
    posRef.current = { x, y };
    nextPieceRef.current = randomPiece();

    if (pieceRef.current) {
      const shape = pieceRef.current.shape;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const absY = y + r;
            // Only check rows that are actually within the board (not above)
            if (absY >= 0 && absY < ROWS && boardRef.current[absY][x + c] !== -1) {
              setGameOver(true);
              return false;
            }
          }
        }
      }
    }
    return true;
  }, []);

  const collide = useCallback((board: number[][], piece: Piece, pos: Pos): boolean => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const nx = pos.x + c;
          const ny = pos.y + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && board[ny][nx] !== -1) return true;
        }
      }
    }
    return false;
  }, []);

  const lockPiece = useCallback(() => {
    const board = boardRef.current;
    const piece = pieceRef.current;
    const pos = posRef.current;
    if (!piece) return;

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const ny = pos.y + r;
          const nx = pos.x + c;
          if (ny >= 0) board[ny][nx] = piece.color;
        }
      }
    }

    // Clear lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every((v) => v !== -1)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(-1));
        cleared++;
        r++;
      }
    }

    if (cleared > 0) {
      const pts = [0, 100, 300, 500, 800][cleared] || 800;
      setScore((s) => s + pts);
      setLines((l) => l + cleared);
    }

    spawnPiece();
  }, [spawnPiece]);

  const tick = useCallback(() => {
    if (!pieceRef.current || paused || gameOver) return;

    const piece = pieceRef.current;
    const pos = posRef.current;
    const next = { ...pos, y: pos.y + 1 };

    if (collide(boardRef.current, piece, next)) {
      lockPiece();
    } else {
      posRef.current = next;
    }
  }, [paused, gameOver, collide, lockPiece]);

  const move = useCallback(
    (dx: number) => {
      if (!pieceRef.current || paused || gameOver) return;
      const pos = posRef.current;
      const next = { ...pos, x: pos.x + dx };
      if (!collide(boardRef.current, pieceRef.current, next)) {
        posRef.current = next;
      }
    },
    [paused, gameOver, collide]
  );

  const drop = useCallback(() => {
    if (!pieceRef.current || paused || gameOver) return;
    const piece = pieceRef.current;
    const pos = posRef.current;
    let dy = 0;
    while (!collide(boardRef.current, piece, { ...pos, y: pos.y + dy + 1 })) {
      dy++;
    }
    posRef.current = { ...pos, y: pos.y + dy };
    lockPiece();
  }, [paused, gameOver, collide, lockPiece]);

  const rotate_ = useCallback(() => {
    if (!pieceRef.current || paused || gameOver) return;
    const rotated = rotate(pieceRef.current.shape);
    const newPiece = { ...pieceRef.current, shape: rotated };
    if (!collide(boardRef.current, newPiece, posRef.current)) {
      pieceRef.current = newPiece;
    }
  }, [paused, gameOver, collide]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = COLS * CELL;
    const H = ROWS * CELL;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(W, r * CELL);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, H);
      ctx.stroke();
    }

    // Board
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = boardRef.current[r][c];
        if (v !== -1) {
          const color = COLORS[v];
          ctx.shadowBlur = 8;
          ctx.shadowColor = color;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 4);
          ctx.fill();
        }
      }
    }

    // Current piece
    if (pieceRef.current) {
      const piece = pieceRef.current;
      const pos = posRef.current;
      ctx.shadowBlur = 15;
      ctx.shadowColor = COLORS[piece.color];
      ctx.fillStyle = COLORS[piece.color];
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const px = (pos.x + c) * CELL;
            const py = (pos.y + r) * CELL;
            if (pos.y + r >= 0) {
              ctx.beginPath();
              ctx.roundRect(px + 1, py + 1, CELL - 2, CELL - 2, 4);
              ctx.fill();
            }
          }
        }
      }
    }

    ctx.shadowBlur = 0;
  }, []);

  const startGame = useCallback(() => {
    boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
    pieceRef.current = null;
    posRef.current = { x: 0, y: 0 };
    setScore(0);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    setStarted(true);
    spawnPiece();
  }, [spawnPiece]);

  useEffect(() => {
    if (!started || paused || gameOver) return;

    const handleKey = (e: KeyboardEvent) => {
      const gameKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        ' ',
        'w',
        'W',
        'a',
        'A',
        's',
        'S',
        'd',
        'D',
      ];
      if (gameKeys.includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move(1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          tick();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotate_();
          break;
        case ' ':
          drop();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          setPaused((p) => !p);
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [started, paused, gameOver, move, tick, rotate_, drop]);

  useEffect(() => {
    if (!started || paused || gameOver) return;

    const interval = setInterval(tick, 600);
    return () => clearInterval(interval);
  }, [started, paused, gameOver, tick]);

  useEffect(() => {
    if (!started) return;
    let raf: number;
    const loopy = () => {
      render();
      raf = requestAnimationFrame(loopy);
    };
    raf = requestAnimationFrame(loopy);
    return () => cancelAnimationFrame(raf);
  }, [started, render]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm font-mono">
        <div className="text-neon-cyan">
          SCORE <span className="text-white font-bold">{score}</span>
        </div>
        <div className="text-green-400">
          LIGNES <span className="text-white font-bold">{lines}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="rounded-xl border border-dark-border"
        />

        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/85 rounded-xl">
            <div className="text-5xl mb-4">🧱</div>
            <div className="text-2xl font-bold gradient-text mb-2">TETRIS</div>
            <div className="text-gray-400 text-xs mb-6 text-center">
              <span className="text-white">←→</span> bouger · <span className="text-white">↑</span>{' '}
              rotate · <span className="text-white">↓</span> tomber
              <br />
              <span className="text-white">SPACE</span> drop · <span className="text-white">P</span>{' '}
              pause
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-lg bg-green-500/20 border border-green-500 text-green-400 font-bold hover:bg-green-500/30 transition-all cursor-pointer"
            >
              JOUER
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/85 rounded-xl">
            <div className="text-5xl mb-4">💀</div>
            <div className="text-2xl font-bold text-neon-pink mb-2">GAME OVER</div>
            <div className="text-gray-400 mb-2">
              Score: <span className="text-white font-bold">{score}</span>
            </div>
            <div className="text-gray-500 mb-6">{lines} lignes</div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-lg bg-neon-pink/20 border border-neon-pink text-neon-pink font-bold hover:bg-neon-pink/30 transition-all cursor-pointer"
            >
              REJOUER
            </button>
          </div>
        )}

        {paused && started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/85 rounded-xl">
            <div className="text-4xl mb-4">⏸️</div>
            <div className="text-xl font-bold text-gray-300 mb-6">PAUSE</div>
            <button
              onClick={() => setPaused(false)}
              className="px-8 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan/30 transition-all cursor-pointer"
            >
              REPRENDRE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
