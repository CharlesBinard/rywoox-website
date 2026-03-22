import { motion } from 'framer-motion';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header = ({ title, showBack, onBack }: HeaderProps) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-border"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors cursor-pointer"
            >
              <span className="text-xl">←</span>
              <span className="font-bold text-lg gradient-text">{title || 'Rywoox'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-2xl">👨‍💻</span>
              <span className="font-bold text-xl gradient-text">Rywoox</span>
            </div>
          )}
          <div className="text-sm font-mono text-gray-500">{title && !showBack ? title : null}</div>
        </div>
      </div>
    </motion.header>
  );
};
