import { motion } from 'framer-motion';
import type { Game } from '@/types/games';

interface GameCardProps {
  game: Game;
  onClick: () => void;
  index: number;
}

const hueMap: Record<string, string> = {
  cyan: 'from-neon-cyan/20 to-neon-cyan/5 border-neon-cyan/30 hover:border-neon-cyan/60 hover:shadow-[0_0_40px_rgba(0,245,255,0.15)]',
  purple:
    'from-neon-purple/20 to-neon-purple/5 border-neon-purple/30 hover:border-neon-purple/60 hover:shadow-[0_0_40px_rgba(191,90,242,0.15)]',
  pink: 'from-neon-pink/20 to-neon-pink/5 border-neon-pink/30 hover:border-neon-pink/60 hover:shadow-[0_0_40px_rgba(255,55,95,0.15)]',
  green:
    'from-green-500/20 to-green-500/5 border-green-500/30 hover:border-green-500/60 hover:shadow-[0_0_40px_rgba(48,209,88,0.15)]',
  yellow:
    'from-yellow-400/20 to-yellow-400/5 border-yellow-400/30 hover:border-yellow-400/60 hover:shadow-[0_0_40px_rgba(255,214,10,0.15)]',
  orange:
    'from-orange-500/20 to-orange-500/5 border-orange-500/30 hover:border-orange-500/60 hover:shadow-[0_0_40px_rgba(255,159,10,0.15)]',
};

const textHueMap: Record<string, string> = {
  cyan: 'text-neon-cyan',
  purple: 'text-neon-purple',
  pink: 'text-neon-pink',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  orange: 'text-orange-400',
};

export const GameCard = ({ game, onClick, index }: GameCardProps) => {
  const borderClass = hueMap[game.hue] || hueMap.cyan;
  const textClass = textHueMap[game.hue] || textHueMap.cyan;

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl p-6
        bg-gradient-to-br ${borderClass}
        border transition-all duration-300
        glass cursor-pointer
      `}
    >
      <div className="text-5xl mb-4">{game.emoji}</div>
      <h3 className={`text-xl font-bold ${textClass} mb-2`}>{game.name}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{game.description}</p>
      <div className={`mt-4 text-xs font-mono ${textClass} opacity-60`}>JOUER →</div>
    </motion.button>
  );
};
