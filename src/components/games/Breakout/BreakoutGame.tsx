'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { useGameStore } from '@/stores/gameStore';

const BASE_W = 800;
const BASE_H = 500;
const PADDLE_W = 120;
const PADDLE_H = 14;
const BALL_R = 8;
const BALL_SPEED_INIT = 6;
const BALL_SPEED_INC = 0.15;
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_W = 68;
const BRICK_H = 22;
const BRICK_GAP = 6;
const BRICK_TOP = 60;
const BRICK_LEFT = (BASE_W - (BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;

const GAME_ID = 'breakout';

const BRICK_COLORS = ['#ff375f', '#ff9f0a', '#ffd60a', '#30d158', '#00f5ff', '#bf5af2'];
const BRICK_POINTS = [60, 50, 40, 30, 20, 10];

type Vec2 = { x: number; y: number };
type GameState = 'idle' | 'playing' | 'gameover' | 'win';

interface Brick {
  x: number;
  y: number;
  color: string;
  points: number;
  alive: boolean;
}

const createBricksBase = (): Brick[] => {
  const bricks: Brick[] = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: BRICK_LEFT + col * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_H + BRICK_GAP),
        color: BRICK_COLORS[row],
        points: BRICK_POINTS[row],
        alive: true,
      });
    }
  }
  return bricks;
};

export const BreakoutGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const saveScore = useGameStore((s) => s.saveScore);
  const getBestScore = useGameStore((s) => s.getBestScore);
  const { playSound, startMusic, pauseMusic } = useAudio();

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<GameState>('idle');

  const ballRef = useRef<Vec2>({ x: BASE_W / 2, y: BASE_H - 40 - BALL_R - 10 });
  const velRef = useRef<Vec2>({ x: 0, y: 0 });
  const paddleRef = useRef(BASE_W / 2 - PADDLE_W / 2);
  const bricksRef = useRef<Brick[]>(createBricksBase());
  const ballSpeedRef = useRef(BALL_SPEED_INIT);
  const mouseXRef = useRef<number | null>(null);
  const launchedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastPaddleBounceRef = useRef<number>(0);
  const lastBrickBounceRef = useRef<number>(0);
  const scaleRef = useRef(1);
  const canvasWRef = useRef(BASE_W);
  const canvasHRef = useRef(BASE_H);

  const bestScore = getBestScore(GAME_ID);

  // Handle responsive canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const maxW = Math.min(BASE_W, canvas.parentElement?.clientWidth ?? BASE_W);
      const scale = maxW / BASE_W;
      scaleRef.current = scale;
      canvasWRef.current = BASE_W;
      canvasHRef.current = BASE_H;
      canvas.width = BASE_W;
      canvas.height = BASE_H;
      canvas.style.width = `${BASE_W * scale}px`;
      canvas.style.height = `${BASE_H * scale}px`;
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas.parentElement || document.body);
    return () => ro.disconnect();
  }, []);

  const resetBall = useCallback(() => {
    const paddleCenter = paddleRef.current + PADDLE_W / 2;
    ballRef.current = { x: paddleCenter, y: BASE_H - 40 - BALL_R - 10 };
    velRef.current = { x: 0, y: 0 };
    launchedRef.current = false;
    ballSpeedRef.current = BALL_SPEED_INIT;
  }, []);

  const launchBall = useCallback(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
    velRef.current = {
      x: Math.sin(angle) * ballSpeedRef.current,
      y: -Math.cos(angle) * ballSpeedRef.current,
    };
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    bricksRef.current = createBricksBase();
    paddleRef.current = BASE_W / 2 - PADDLE_W / 2;
    resetBall();
    setGameState('playing');
  }, [resetBall]);

  // Mouse/touch move for paddle
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasWRef.current / rect.width;
      mouseXRef.current = (e.clientX - rect.left) * scaleX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasWRef.current / rect.width;
      mouseXRef.current = (e.touches[0].clientX - rect.left) * scaleX;
    };
    const handleClick = () => {
      if (gameState === 'playing') launchBall();
      if (gameState === 'idle' || gameState === 'gameover' || gameState === 'win') startGame();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [gameState, launchBall, startGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const PADDLE_Y = BASE_H - 40;

    const update = () => {
      const ball = ballRef.current;
      const vel = velRef.current;
      const bricks = bricksRef.current;

      // Paddle follows mouse
      if (mouseXRef.current !== null) {
        paddleRef.current = Math.max(
          0,
          Math.min(BASE_W - PADDLE_W, mouseXRef.current - PADDLE_W / 2)
        );
      }

      if (!launchedRef.current) {
        const paddleCenter = paddleRef.current + PADDLE_W / 2;
        ball.x = paddleCenter;
        ball.y = PADDLE_Y - BALL_R - 10;
        return;
      }

      // Move ball
      ball.x += vel.x;
      ball.y += vel.y;

      // Wall collisions
      if (ball.x - BALL_R <= 0) {
        ball.x = BALL_R;
        vel.x = Math.abs(vel.x);
      }
      if (ball.x + BALL_R >= BASE_W) {
        ball.x = BASE_W - BALL_R;
        vel.x = -Math.abs(vel.x);
      }
      if (ball.y - BALL_R <= 0) {
        ball.y = BALL_R;
        vel.y = Math.abs(vel.y);
      }

      // Ball falls below paddle — lose life
      if (ball.y > BASE_H + BALL_R) {
        playSound('loseLife');
        setLives((l) => {
          const nl = l - 1;
          if (nl <= 0) {
            setGameState('gameover');
            saveScore(GAME_ID, score);
          } else {
            resetBall();
          }
          return nl;
        });
        return;
      }

      // Paddle collision
      if (
        ball.y + BALL_R >= PADDLE_Y &&
        ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
        ball.x >= paddleRef.current &&
        ball.x <= paddleRef.current + PADDLE_W
      ) {
        const hitPos = (ball.x - paddleRef.current) / PADDLE_W;
        const angle = (hitPos - 0.5) * Math.PI * 0.7;
        ballSpeedRef.current += BALL_SPEED_INC;
        const speed = ballSpeedRef.current;
        vel.x = Math.sin(angle) * speed;
        vel.y = -Math.cos(angle) * speed;
        ball.y = PADDLE_Y - BALL_R;
        const now = Date.now();
        if (now - lastPaddleBounceRef.current > 100) {
          playSound('bounce');
          lastPaddleBounceRef.current = now;
        }
      }

      // Brick collisions
      for (const brick of bricks) {
        if (!brick.alive) continue;
        if (
          ball.x + BALL_R > brick.x &&
          ball.x - BALL_R < brick.x + BRICK_W &&
          ball.y + BALL_R > brick.y &&
          ball.y - BALL_R < brick.y + BRICK_H
        ) {
          brick.alive = false;
          const nowB = Date.now();
          if (nowB - lastBrickBounceRef.current > 50) {
            playSound('brickBreak');
            lastBrickBounceRef.current = nowB;
          }
          setScore((s) => {
            const ns = s + brick.points;
            // Check win
            const anyAlive = bricks.some((b) => b.alive);
            if (!anyAlive) {
              setGameState('win');
              saveScore(GAME_ID, ns);
            }
            return ns;
          });

          // Determine bounce direction
          const overlapLeft = ball.x + BALL_R - brick.x;
          const overlapRight = brick.x + BRICK_W - (ball.x - BALL_R);
          const overlapTop = ball.y + BALL_R - brick.y;
          const overlapBottom = brick.y + BRICK_H - (ball.y - BALL_R);
          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);
          if (minOverlapX < minOverlapY) {
            vel.x = -vel.x;
          } else {
            vel.y = -vel.y;
          }
          break;
        }
      }
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = scaleRef.current;
      const W = canvasWRef.current;
      const H = canvasHRef.current;

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, W, H);

      // Border glow
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, W - 2, H - 2);

      // Bricks
      for (const brick of bricksRef.current) {
        if (!brick.alive) continue;
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = brick.color;
        ctx.fillStyle = brick.color;
        ctx.beginPath();
        ctx.roundRect(brick.x * scale, brick.y * scale, BRICK_W * scale, BRICK_H * scale, 4);
        ctx.fill();
      }

      // Paddle
      ctx.shadowBlur = 25 * scale;
      ctx.shadowColor = '#00f5ff';
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.roundRect(paddleRef.current * scale, PADDLE_Y * scale, PADDLE_W * scale, PADDLE_H * scale, 7);
      ctx.fill();

      // Ball
      ctx.shadowBlur = 25 * scale;
      ctx.shadowColor = '#ff375f';
      ctx.fillStyle = '#ff375f';
      ctx.beginPath();
      ctx.arc(ballRef.current.x * scale, ballRef.current.y * scale, BALL_R * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    };

    const loop = () => {
      update();
      render();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, resetBall, saveScore, score, playSound]);

  // Music control based on game state
  useEffect(() => {
    if (gameState === 'playing') {
      startMusic();
    } else if (gameState === 'gameover' || gameState === 'win') {
      pauseMusic();
    }
  }, [gameState, startMusic, pauseMusic]);

  // Win/lose sounds
  useEffect(() => {
    if (gameState === 'gameover') {
      playSound('gameOver');
    } else if (gameState === 'win') {
      playSound('win');
    }
  }, [gameState, playSound]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="flex gap-12 text-xl font-mono font-bold w-full max-w-[800px] px-2">
        <div className="text-neon-pink">
          ❤️ <span className="text-white">{lives}</span>
        </div>
        <div className="text-neon-cyan">
          SCORE <span className="text-white">{score}</span>
        </div>
        <div className="text-neon-purple ml-auto">
          BEST <span className="text-white">{bestScore}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-dark-border cursor-none"
          style={{ touchAction: 'none', maxWidth: 'min(800px, 100%)' }}
        />

        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/85 rounded-xl"
            >
              <div className="text-5xl mb-4">🧱</div>
              <div className="text-2xl font-bold gradient-text mb-2">BREAKOUT</div>
              <div className="text-gray-400 text-sm mb-6 text-center">
                Bouge ta souris pour contrôler la raquette
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  startGame();
                }}
                className="px-8 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan/30 transition-all cursor-pointer"
              >
                JOUER
              </button>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/85 rounded-xl"
            >
              <div className="text-5xl mb-4">💀</div>
              <div className="text-2xl font-bold text-neon-pink mb-2">GAME OVER</div>
              <div className="text-gray-400 mb-1">Score: {score}</div>
              <div className="text-gray-600 text-sm mb-6">Meilleur: {bestScore}</div>
              <button
                onClick={() => {
                  playSound('click');
                  startGame();
                }}
                className="px-8 py-3 rounded-lg bg-neon-pink/20 border border-neon-pink text-neon-pink font-bold hover:bg-neon-pink/30 transition-all cursor-pointer"
              >
                REJOUER
              </button>
            </motion.div>
          )}

          {gameState === 'win' && (
            <motion.div
              key="win"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/85 rounded-xl"
            >
              <div className="text-5xl mb-4">🏆</div>
              <div className="text-2xl font-bold text-neon-green mb-2">TU AS GAGNÉ !</div>
              <div className="text-gray-400 mb-1">Score: {score}</div>
              <div className="text-gray-600 text-sm mb-6">Meilleur: {bestScore}</div>
              <button
                onClick={() => {
                  playSound('click');
                  startGame();
                }}
                className="px-8 py-3 rounded-lg bg-green-500/20 border border-green-400 text-green-400 font-bold hover:bg-green-500/30 transition-all cursor-pointer"
              >
                REJOUER
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-gray-600 text-sm font-mono">
        {gameState === 'playing'
          ? launchedRef.current
            ? 'Clique pour relancer'
            : 'Clique pour lancer la balle'
          : 'Bouge la souris · Clique pour jouer'}
      </div>
    </div>
  );
};
