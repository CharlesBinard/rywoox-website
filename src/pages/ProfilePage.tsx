'use client';

import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { AchievementBadge } from '@/components/AchievementBadge';
import { GAMES } from '@/data/games';
import {
  ACHIEVEMENTS_BY_GAME,
  ALL_ACHIEVEMENTS,
  GAME_NAMES,
  GLOBAL_ACHIEVEMENTS,
} from '@/lib/achievements';
import { useAchievementStore } from '@/stores/achievementStore';

type Filter = 'all' | 'unlocked' | 'locked';

const GAME_ORDER = [
  'tictactoe',
  'connectfour',
  'snake',
  'memory',
  'flappy',
  'pong',
  'tetris',
  'numbermerge',
  'minesweeper',
  'breakout',
  'global',
] as const;

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const unlockedAt = useAchievementStore((s) => s.unlockedAt);
  const unlocked = Object.keys(unlockedAt).length;
  const total = ALL_ACHIEVEMENTS.length;
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  const filterFn = (id: string) => {
    if (filter === 'unlocked') return !!unlockedAt[id as keyof typeof unlockedAt];
    if (filter === 'locked') return !unlockedAt[id as keyof typeof unlockedAt];
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-5xl mb-3">👤</div>
        <h1 className="text-4xl font-black gradient-text mb-2">Profil</h1>
        <p className="text-gray-400">Tes accomplissements à NeonDojo</p>
      </motion.div>

      {/* Global stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md mb-8 p-6 rounded-2xl glass border border-dark-border text-center"
      >
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              className={`text-2xl ${i < Math.ceil((unlocked / total) * 10) ? '' : 'grayscale opacity-30'}`}
            >
              ⭐
            </motion.div>
          ))}
        </div>
        <div className="text-3xl font-black text-white mb-1">
          {unlocked} <span className="text-gray-500 font-normal text-xl">/ {total}</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">{percentage}% complété</div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {(['all', 'unlocked', 'locked'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              filter === f
                ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan'
                : 'glass border border-dark-border text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'unlocked' ? 'Débloqués' : 'Verrouillés'}
          </button>
        ))}
      </div>

      {/* Achievements by game */}
      <div className="w-full max-w-4xl space-y-10">
        {GAME_ORDER.map((gameId) => {
          const gameAchievements =
            gameId === 'global' ? GLOBAL_ACHIEVEMENTS : (ACHIEVEMENTS_BY_GAME[gameId] ?? []);

          const filtered = gameAchievements.filter((a) => filterFn(a.id));
          if (filtered.length === 0) return null;

          const game = GAMES.find((g) => g.id === gameId);
          const gameName =
            gameId === 'global' ? '🌍 Global' : (game?.name ?? GAME_NAMES[gameId] ?? gameId);
          const gameEmoji = game?.emoji ?? (gameId === 'global' ? '🌍' : '❓');

          const gameUnlocked = gameAchievements.filter((a) => unlockedAt[a.id]).length;
          const gameTotal = gameAchievements.length;

          return (
            <motion.div
              key={gameId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: GAME_ORDER.indexOf(gameId) * 0.05 }}
            >
              {/* Game header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{gameEmoji}</span>
                <h2 className="text-xl font-bold text-white">{gameName}</h2>
                <span className="text-sm text-gray-500 font-mono">
                  {gameUnlocked}/{gameTotal}
                </span>
                {gameUnlocked === gameTotal && gameTotal > 0 && (
                  <span className="text-neon-cyan text-sm">✓ Complet</span>
                )}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map((ach) => (
                  <AchievementBadge key={ach.id} id={ach.id} size="sm" />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16"
      >
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-6 py-3 rounded-xl glass border border-dark-border text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
        >
          ← Retour au Hub
        </button>
      </motion.div>
    </div>
  );
};
