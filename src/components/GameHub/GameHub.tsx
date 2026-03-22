import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { GameCard } from '@/components/ui';
import { GAMES } from '@/data/games';

export const GameHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl mb-6"
        >
          🎮
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black mb-4">
          <span className="gradient-text">Mini Games</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto">
          Des jeux retro pour se vider la tête. Clique et joue.
        </p>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {GAMES.map((game, i) => (
          <GameCard
            key={game.id}
            game={game}
            index={i}
            onClick={() => navigate({ to: '/game/$gameId', params: { gameId: game.id } })}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-gray-600 text-sm font-mono"
      >
        6 jeux · fait avec React & Canvas
      </motion.p>
    </div>
  );
};
