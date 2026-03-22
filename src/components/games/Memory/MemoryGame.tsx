'use client';

// TODO: integrate leaderboard

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

const EMOJIS = ['🎮', '🎲', '🎯', '🏆', '⚡', '🔥', '🌟', '💎'];
const FLIP_DURATION = 400;

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeCards = (): Card[] =>
  shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));

export const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>(makeCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const reset = useCallback(() => {
    setCards(makeCards());
    setSelected([]);
    setMoves(0);
    setMatched(0);
    setGameOver(false);
    setStarted(true);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (selected.length !== 2) return;

    const [a, b] = selected;
    const cardA = cards[a];
    const cardB = cards[b];

    if (cardA.emoji === cardB.emoji) {
      // Match
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (c.id === cardA.id || c.id === cardB.id ? { ...c, matched: true } : c))
        );
        setMatched((m) => {
          const nm = m + 1;
          if (nm === EMOJIS.length) setGameOver(true);
          return nm;
        });
        setSelected([]);
      }, 300);
    } else {
      // No match
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (c.id === cardA.id || c.id === cardB.id ? { ...c, flipped: false } : c))
        );
        setSelected([]);
      }, FLIP_DURATION + 100);
    }

    setMoves((m) => m + 1);
  }, [selected, cards, started]);

  const handleCard = (idx: number) => {
    if (!started || cards[idx].flipped || cards[idx].matched || selected.length === 2) return;
    setCards((prev) => prev.map((c) => (c.id === idx ? { ...c, flipped: true } : c)));
    setSelected((prev) => [...prev, idx]);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8 text-lg font-mono">
        <div className="text-neon-pink">
          COUPS <span className="text-white font-bold">{moves}</span>
        </div>
        <div className="text-green-400">
          PAIRES{' '}
          <span className="text-white font-bold">
            {matched}/{EMOJIS.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 p-6 rounded-2xl glass border border-dark-border">
        {cards.map((card, idx) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
            whileTap={{ scale: card.flipped || card.matched ? 1 : 0.95 }}
            onClick={() => handleCard(idx)}
            disabled={card.flipped || card.matched || !started}
            className={`
              w-16 h-16 md:w-20 md:h-20 rounded-xl text-3xl md:text-4xl flex items-center justify-center
              transition-all duration-200 cursor-pointer
              ${
                card.matched
                  ? 'bg-green-500/20 border border-green-500/50'
                  : card.flipped
                    ? 'bg-dark-card border border-dark-border'
                    : 'bg-neon-pink/20 border border-neon-pink/30 hover:bg-neon-pink/30'
              }
            `}
          >
            <AnimatePresence mode="wait">
              {card.flipped || card.matched ? (
                <motion.span
                  key="front"
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: -90 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'inline-block', backfaceVisibility: 'hidden' }}
                >
                  {card.emoji}
                </motion.span>
              ) : (
                <motion.span
                  key="back"
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'inline-block', backfaceVisibility: 'hidden' }}
                >
                  ❓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {!started && !gameOver && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-400 text-sm">Retourne les cartes et trouve les paires</p>
          <button
            onClick={reset}
            className="px-8 py-3 rounded-lg bg-neon-pink/20 border border-neon-pink text-neon-pink font-bold hover:bg-neon-pink/30 transition-all cursor-pointer"
          >
            START
          </button>
        </div>
      )}

      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="text-4xl">🎉</div>
          <div className="text-2xl font-bold text-neon-pink">GAGNÉ !</div>
          <div className="text-gray-400">
            {moves} coups · {EMOJIS.length} paires
          </div>
          <button
            onClick={reset}
            className="px-8 py-3 rounded-lg bg-neon-pink/20 border border-neon-pink text-neon-pink font-bold hover:bg-neon-pink/30 transition-all cursor-pointer"
          >
            REJOUER
          </button>
        </motion.div>
      )}
    </div>
  );
};
