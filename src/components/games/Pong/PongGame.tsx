'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameOverlay } from '@/components/ui';
import { useAudio } from '@/hooks/useAudio';
import { useAchievementStore } from '@/stores/achievementStore';

const BASE_W = 800;
const BASE_H = 500;
const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_R = 8;
const AI_SPEED = 5;
const PLAYER_SPEED = 7;
const WIN_SCORE = 5;

const GAME_ID = 'pong';

type Vec2 = { x: number; y: number };
type GameState = 'idle' | 'playing' | 'scored' | 'gameover' | 'countdown';

const BASE_PADDLE_Y = (BASE_H - PADDLE_H) / 2;

export const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const { playSound, startMusic, pauseMusic } = useAudio();
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [countdown, setCountdown] = useState(2);

  const ballRef = useRef<Vec2>({ x: BASE_W / 2, y: BASE_H / 2 });
  const velRef = useRef<Vec2>({ x: 5, y: 3 });
  const playerPaddleRef = useRef(BASE_PADDLE_Y);
  const aiPaddleRef = useRef(BASE_PADDLE_Y);
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const launchDirRef = useRef(1);
  const lastBounceRef = useRef<number>(0);
  const scaleRef = useRef(1);

  // Responsive canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const parentWidth = canvas.parentElement?.clientWidth ?? 0;
      // Guard: if parent has no width yet, skip resize and keep current size
      if (!parentWidth) return;
      const maxW = Math.min(BASE_W, parentWidth);
      const scale = maxW / BASE_W;
      // Ensure a minimum scale so the canvas is never tiny
      const safeScale = scale > 0 ? scale : 1;
      scaleRef.current = safeScale;
      canvas.width = BASE_W;
      canvas.height = BASE_H;
      canvas.style.width = `${BASE_W * safeScale}px`;
      canvas.style.height = `${BASE_H * safeScale}px`;
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas.parentElement || document.body);
    return () => ro.disconnect();
  }, []);

  const resetBall = useCallback((_dir: number) => {
    ballRef.current = { x: BASE_W / 2, y: BASE_H / 2 };
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
          BASE_H - PADDLE_H,
          playerPaddleRef.current + PLAYER_SPEED
        );
      }

      // AI movement (only when playing, not in countdown)
      if (gameState === 'playing') {
        const aiCenter = aiPaddleRef.current + PADDLE_H / 2;
        if (ball.y < aiCenter - 10) {
          aiPaddleRef.current = Math.max(0, aiPaddleRef.current - AI_SPEED);
        } else if (ball.y > aiCenter + 10) {
          aiPaddleRef.current = Math.min(BASE_H - PADDLE_H, aiPaddleRef.current + AI_SPEED);
        }

        // Ball movement
        ball.x += vel.x;
        ball.y += vel.y;

        // Top/bottom bounce
        if (ball.y - BALL_R <= 0) {
          ball.y = BALL_R;
          vel.y = Math.abs(vel.y);
        }
        if (ball.y + BALL_R >= BASE_H) {
          ball.y = BASE_H - BALL_R;
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
            const now = Date.now();
            if (now - lastBounceRef.current > 100) {
              playSound('bounce');
              lastBounceRef.current = now;
            }
          }
        }

        // AI paddle collision
        if (ball.x + BALL_R >= BASE_W - PADDLE_W - 20 && ball.x < BASE_W - 20) {
          const paddleTop = aiPaddleRef.current;
          const paddleBottom = aiPaddleRef.current + PADDLE_H;
          if (ball.y >= paddleTop && ball.y <= paddleBottom) {
            ball.x = BASE_W - PADDLE_W - 20 - BALL_R;
            const hitPos = (ball.y - paddleTop) / PADDLE_H;
            vel.x = -Math.abs(vel.x) * 1.05;
            vel.y = (hitPos - 0.5) * 10;
            const now = Date.now();
            if (now - lastBounceRef.current > 100) {
              playSound('bounce');
              lastBounceRef.current = now;
            }
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
        if (ball.x > BASE_W) {
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

      const scale = scaleRef.current;
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, BASE_W, BASE_H);

      // Center line
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(BASE_W / 2, 0);
      ctx.lineTo(BASE_W / 2, BASE_H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Player paddle
      ctx.shadowBlur = 20 * scale;
      ctx.shadowColor = '#00f5ff';
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.roundRect(
        20 * scale,
        playerPaddleRef.current * scale,
        PADDLE_W * scale,
        PADDLE_H * scale,
        4
      );
      ctx.fill();

      // AI paddle
      ctx.shadowBlur = 20 * scale;
      ctx.shadowColor = '#bf5af2';
      ctx.fillStyle = '#bf5af2';
      ctx.beginPath();
      ctx.roundRect(
        (BASE_W - 20 - PADDLE_W) * scale,
        aiPaddleRef.current * scale,
        PADDLE_W * scale,
        PADDLE_H * scale,
        4
      );
      ctx.fill();

      // Ball
      ctx.shadowBlur = 25 * scale;
      ctx.shadowColor = '#ff375f';
      ctx.fillStyle = '#ff375f';
      ctx.beginPath();
      ctx.arc(ballRef.current.x * scale, ballRef.current.y * scale, BALL_R * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Scores
      ctx.font = `bold ${48 * scale}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(0, 245, 255, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText(String(playerScore), (BASE_W / 4) * scale, 60 * scale);
      ctx.fillStyle = 'rgba(191, 90, 242, 0.3)';
      ctx.fillText(String(aiScore), ((BASE_W * 3) / 4) * scale, 60 * scale);
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
  }, [gameState, resetBall, playerScore, aiScore, playSound]);

  // Check achievements on game over
  useEffect(() => {
    if (gameState === 'gameover') {
      if (winner === 'player') {
        checkAchievements(GAME_ID, { wins: 1, gamesPlayed: 1 });
      } else {
        checkAchievements(GAME_ID, { gamesPlayed: 1 });
      }
    }
  }, [gameState, winner, checkAchievements]);

  // Music control based on game state
  useEffect(() => {
    if (gameState === 'countdown' || gameState === 'playing') {
      startMusic();
    } else if (gameState === 'gameover') {
      pauseMusic();
    }
  }, [gameState, startMusic, pauseMusic]);

  // Win/lose sound on game over
  useEffect(() => {
    if (gameState === 'gameover') {
      if (winner === 'player') {
        playSound('win');
      } else {
        playSound('gameOver');
      }
    }
  }, [gameState, winner, playSound]);

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

      <div className="relative w-full" style={{ minWidth: `${BASE_W}px` }}>
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-dark-border"
          style={{ maxWidth: 'min(800px, 100%)', width: '100%', height: 'auto' }}
        />

        {gameState === 'idle' && (
          <GameOverlay
            emoji="🏓"
            title="PONG"
            subtitle={
              <>
                <span className="text-white">↑↓</span> ou <span className="text-white">W/S</span>{' '}
                pour bouger
              </>
            }
            buttons={[
              {
                label: 'JOUER',
                onClick: () => {
                  playSound('click');
                  startGame();
                },
                variant: 'primary',
              },
            ]}
            variant="start"
          />
        )}

        {gameState === 'countdown' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/60 rounded-xl">
            <div className="text-8xl font-bold text-neon-cyan animate-pulse">{countdown}</div>
            <div className="text-gray-400 text-sm mt-4">Prépare-toi !</div>
          </div>
        )}

        {gameState === 'gameover' && (
          <GameOverlay
            emoji={winner === 'player' ? '🏆' : '🤖'}
            title={winner === 'player' ? 'TROP FORT !' : "L'IA GAGNE..."}
            subtitle={`${playerScore} - ${aiScore}`}
            buttons={[
              {
                label: 'REJOUER',
                onClick: () => {
                  playSound('click');
                  startGame();
                },
                variant: 'primary',
              },
            ]}
            variant={winner === 'player' ? 'win' : 'gameover'}
          />
        )}
      </div>

      <div className="text-gray-600 text-sm font-mono">
        {gameState === 'playing' ? 'SPACE pour mettre en pause' : '↑↓ ou W/S · SPACE pour démarrer'}
      </div>
    </div>
  );
};
