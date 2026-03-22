import { useNavigate, useParams } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ConnectFourGame,
  FlappyGame,
  MemoryGame,
  PongGame,
  SnakeGame,
  TetrisGame,
  TicTacToeGame,
} from '@/components/games';
import { BackButton } from '@/components/ui';
import { GAMES } from '@/data/games';
import type { GameId } from '@/types/games';

const gameComponents: Record<GameId, React.ComponentType> = {
  snake: SnakeGame,
  pong: PongGame,
  memory: MemoryGame,
  tetris: TetrisGame,
  flappy: FlappyGame,
  tictactoe: TicTacToeGame,
  connectfour: ConnectFourGame,
};

const colorMap: Record<string, string> = {
  cyan: 'neon-cyan',
  purple: 'neon-purple',
  pink: 'neon-pink',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  orange: 'text-orange-400',
};

export const GameView = () => {
  const { gameId } = useParams({ from: '/game/$gameId' });
  const navigate = useNavigate();

  const game = GAMES.find((g) => g.id === gameId);
  const GameComponent = gameComponents[gameId as GameId];
  const colorClass = colorMap[game?.hue ?? 'cyan'] || 'neon-cyan';

  if (!game || !GameComponent) {
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

        <GameComponent />

        <BackButton onClick={() => navigate({ to: '/' })} />
      </div>
    </motion.div>
  );
};
