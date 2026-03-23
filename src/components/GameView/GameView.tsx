'use client';

import { useNavigate, useParams } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { BackButton } from '@/components/ui';
import { GAMES } from '@/data/games';
import type { GameId } from '@/types/games';

const gameComponents: Record<GameId, React.LazyExoticComponent<React.ComponentType>> = {
  snake: lazy(() =>
    import('@/components/games/Snake/SnakeGame').then((m) => ({ default: m.SnakeGame }))
  ),
  pong: lazy(() =>
    import('@/components/games/Pong/PongGame').then((m) => ({ default: m.PongGame }))
  ),
  memory: lazy(() =>
    import('@/components/games/Memory/MemoryGame').then((m) => ({ default: m.MemoryGame }))
  ),
  tetris: lazy(() =>
    import('@/components/games/Tetris/TetrisGame').then((m) => ({ default: m.TetrisGame }))
  ),
  flappy: lazy(() =>
    import('@/components/games/Flappy/FlappyGame').then((m) => ({ default: m.FlappyGame }))
  ),
  tictactoe: lazy(() =>
    import('@/components/games/TicTacToe/TicTacToeGame').then((m) => ({ default: m.TicTacToeGame }))
  ),
  connectfour: lazy(() =>
    import('@/components/games/ConnectFour/ConnectFourGame').then((m) => ({
      default: m.ConnectFourGame,
    }))
  ),
  numbermerge: lazy(() =>
    import('@/components/games/NumberMerge/NumberMergeGame').then((m) => ({
      default: m.NumberMergeGame,
    }))
  ),
  minesweeper: lazy(() =>
    import('@/components/games/Minesweeper/MinesweeperGame').then((m) => ({
      default: m.MinesweeperGame,
    }))
  ),
};

const colorMap: Record<string, string> = {
  cyan: 'neon-cyan',
  purple: 'neon-purple',
  pink: 'neon-pink',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  orange: 'text-orange-400',
  gray: 'text-gray-400',
};

const GameFallback = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-12">
    <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
    <p className="text-gray-500 text-sm">Chargement...</p>
  </div>
);

export const GameView = () => {
  const { gameId } = useParams({ from: '/game/$gameId' });
  const navigate = useNavigate();

  const game = GAMES.find((g) => g.id === gameId);
  const LazyGameComponent = gameId ? gameComponents[gameId as GameId] : null;
  const colorClass = colorMap[game?.hue ?? 'cyan'] || 'neon-cyan';

  if (!game || !LazyGameComponent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">😕</div>
        <p className="text-gray-400">Jeu introuvable</p>
        <BackButton onClick={() => navigate({ to: '/' })} />
      </div>
    );
  }

  return (
    <motion.div
      key={gameId}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="min-h-screen py-24"
    >
      <div className="container mx-auto px-4 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="text-5xl mb-2">{game.emoji}</div>
          <h1 className={`text-3xl font-black ${colorClass}`}>{game.name}</h1>
          <p className="text-gray-500 text-sm">{game.description}</p>
        </div>

        <Suspense fallback={<GameFallback />}>
          <LazyGameComponent />
        </Suspense>

        <BackButton onClick={() => navigate({ to: '/' })} />
      </div>
    </motion.div>
  );
};
