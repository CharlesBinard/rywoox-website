'use client';

// TODO: integrate leaderboard

import { useCallback, useEffect, useRef, useState } from 'react';

const WIDTH = 800;
const HEIGHT = 500;
const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_R = 8;
const AI_SPEED = 5;
const PLAYER_SPEED = 7;
const WIN_SCORE = 5;

type Vec2 = { x: number; y: number };
type GameState = 'idle' | 'playing' | 'scored' | 'gameover';

const paddleY = (HEIGHT - PADDLE_H) / 2;
const aiY = (HEIGHT - PADDLE_H) / 2;

export const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [countdown, setCountdown] = useState(2);

  const ballRef = useRef<Vec2>({ x: WIDTH / 2, y: HEIGHT / 2 });
  const velRef = useRef<Vec2>({ x: 5, y: 3 });
  const playerPaddleRef = useRef(paddleY);
  const aiPaddleRef = useRef(aiY);
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const launchDirRef = useRef(1);

  const resetBall = useCallback((dir: number) => {
    ballRef.current = { x: WIDTH / 2, y: HEIGHT / 2 };
    velRef.current = { x: 0, y: 0 };
  }, []);

  const launchBall = useCallback(
    (dir: number) => {
      const speed = 5 + (playerScore + aiScore) * 0.3;
      velRef.current = { x: dir * speed, y: (Math.random() - 0.5) * 6 };
    },
    [playerScore, aiScore]
  );

  const startGame = useCallback(() => {
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    resetBall(Math.random() > 0.5 ? 1 : -1);
    setGameState('countdown');
  }, [resetBall]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (
        (e.key === ' ' || e.key === 'Enter') &&
        (gameState === 'idle' || gameState === 'countdown')
      ) {
        startGame();
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startGame]);

  // Countdown timer effect
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownTimerRef.current!);
          countdownTimerRef.current = null;
          launchBall(launchDirRef.current);
          setGameState('playing');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [gameState, launchBall]);

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'countdown') return;

    const update = () => {
      const ball = ballRef.current;
      const vel = velRef.current;

      // Player movement
      if (keysRef.current.has('ArrowUp') || keysRef.current.has('w') || keysRef.current.has('W')) {
        playerPaddleRef.current = Math.max(0, playerPaddleRef.current - PLAYER_SPEED);
      }
      if (
        keysRef.current.has('ArrowDown') ||
        keysRef.current.has('s') ||
        keysRef.current.has('S')
      ) {
        playerPaddleRef.current = Math.min(
          HEIGHT - PADDLE_H,
          playerPaddleRef.current + PLAYER_SPEED
        );
      }

      // AI movement (only when playing, not in countdown)
      if (gameState === 'playing') {
        const aiCenter = aiPaddleRef.current + PADDLE_H / 2;
        if (ball.y < aiCenter - 10) {
          aiPaddleRef.current = Math.max(0, aiPaddleRef.current - AI_SPEED);
        } else if (ball.y > aiCenter + 10) {
          aiPaddleRef.current = Math.min(HEIGHT - PADDLE_H, aiPaddleRef.current + AI_SPEED);
        }

        // Ball movement
        ball.x += vel.x;
        ball.y += vel.y;

        // Top/bottom bounce
        if (ball.y - BALL_R <= 0) {
          ball.y = BALL_R;
          vel.y = Math.abs(vel.y);
        }
        if (ball.y + BALL_R >= HEIGHT) {
          ball.y = HEIGHT - BALL_R;
          vel.y = -Math.abs(vel.y);
        }

        // Player paddle collision
        if (ball.x - BALL_R <= PADDLE_W + 20 && ball.x > 20) {
          const paddleTop = playerPaddleRef.current;
          const paddleBottom = playerPaddleRef.current + PADDLE_H;
          if (ball.y >= paddleTop && ball.y <= paddleBottom) {
            ball.x = PADDLE_W + 20 + BALL_R;
            const hitPos = (ball.y - paddleTop) / PADDLE_H;
            vel.x = Math.abs(vel.x) * 1.05;
            vel.y = (hitPos - 0.5) * 10;
          }
        }

        // AI paddle collision
        if (ball.x + BALL_R >= WIDTH - PADDLE_W - 20 && ball.x < WIDTH - 20) {
          const paddleTop = aiPaddleRef.current;
          const paddleBottom = aiPaddleRef.current + PADDLE_H;
          if (ball.y >= paddleTop && ball.y <= paddleBottom) {
            ball.x = WIDTH - PADDLE_W - 20 - BALL_R;
            const hitPos = (ball.y - paddleTop) / PADDLE_H;
            vel.x = -Math.abs(vel.x) * 1.05;
            vel.y = (hitPos - 0.5) * 10;
          }
        }

        // Score
        if (ball.x < 0) {
          setAiScore((s) => {
            const ns = s + 1;
            if (ns >= WIN_SCORE) {
              setWinner('ai');
              setGameState('gameover');
            } else {
              launchDirRef.current = 1;
              resetBall(1);
              setCountdown(2);
              setGameState('countdown');
            }
            return ns;
          });
          return;
        }
        if (ball.x > WIDTH) {
          setPlayerScore((s) => {
            const ns = s + 1;
            if (ns >= WIN_SCORE) {
              setWinner('player');
              setGameState('gameover');
            } else {
              launchDirRef.current = -1;
              resetBall(-1);
              setCountdown(2);
              setGameState('countdown');
            }
            return ns;
          });
          return;
        }
      }
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Center line
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Player paddle
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f5ff';
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.roundRect(20, playerPaddleRef.current, PADDLE_W, PADDLE_H, 4);
      ctx.fill();

      // AI paddle
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#bf5af2';
      ctx.fillStyle = '#bf5af2';
      ctx.beginPath();
      ctx.roundRect(WIDTH - 20 - PADDLE_W, aiPaddleRef.current, PADDLE_W, PADDLE_H, 4);
      ctx.fill();

      // Ball
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ff375f';
      ctx.fillStyle = '#ff375f';
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Scores
      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.fillStyle = 'rgba(0, 245, 255, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText(String(playerScore), WIDTH / 4, 60);
      ctx.fillStyle = 'rgba(191, 90, 242, 0.3)';
      ctx.fillText(String(aiScore), (WIDTH * 3) / 4, 60);
    };

    const loop = () => {
      update();
      render();
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, resetBall, launchBall]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-12 text-2xl font-mono font-bold">
        <div className="text-neon-cyan">
          TOI <span className="text-white">{playerScore}</span>
        </div>
        <div className="text-neon-purple">
          IA <span className="text-white">{aiScore}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="rounded-xl border border-dark-border max-w-full"
        />

        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/85 rounded-xl">
            <div className="text-5xl mb-4">🏓</div>
            <div className="text-2xl font-bold gradient-text mb-2">PONG</div>
            <div className="text-gray-400 text-sm mb-6 text-center">
              <span className="text-white">↑↓</span> ou <span className="text-white">W/S</span> pour
              bouger
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan/30 transition-all cursor-pointer"
            >
              JOUER
            </button>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/60 rounded-xl">
            <div className="text-8xl font-bold text-neon-cyan animate-pulse">{countdown}</div>
            <div className="text-gray-400 text-sm mt-4">Prépare-toi !</div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/85 rounded-xl">
            <div className="text-5xl mb-4">{winner === 'player' ? '🏆' : '🤖'}</div>
            <div
              className={`text-2xl font-bold mb-2 ${winner === 'player' ? 'text-neon-cyan' : 'text-neon-purple'}`}
            >
              {winner === 'player' ? 'TROP FORT !' : "L'IA GAGNE..."}
            </div>
            <div className="text-gray-400 mb-6">
              {playerScore} - {aiScore}
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold hover:bg-neon-cyan/30 transition-all cursor-pointer"
            >
              REJOUER
            </button>
          </div>
        )}
      </div>

      <div className="text-gray-600 text-sm font-mono">
        {gameState === 'playing' ? 'SPACE pour mettre en pause' : '↑↓ ou W/S · SPACE pour démarrer'}
      </div>
    </div>
  );
};
