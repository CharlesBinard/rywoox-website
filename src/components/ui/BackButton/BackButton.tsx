import { motion } from 'framer-motion';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-dark-border text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all duration-200 cursor-pointer"
    >
      <span className="text-lg">←</span>
      <span className="text-sm font-medium">Retour</span>
    </motion.button>
  );
};
