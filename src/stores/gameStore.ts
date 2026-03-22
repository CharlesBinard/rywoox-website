import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ScoreEntry {
  score: number;
  date: string;
  name?: string;
}

interface GameStats {
  score: number;
  turnsPlayed: number;
  gameOver: boolean;
  won: boolean;
}

interface GameStore {
  // Best scores per game (from localStorage via persist)
  bestScores: Record<string, number>;

  // Current game stats per gameId
  currentStats: Record<string, GameStats>;

  // Leaderboard scores per gameId
  leaderboard: Record<string, ScoreEntry[]>;

  // Actions
  saveScore: (gameId: string, score: number, playerName?: string) => void;
  getBestScore: (gameId: string) => number;
  clearScores: (gameId: string) => void;

  // Current game actions
  updateCurrentStats: (gameId: string, stats: Partial<GameStats>) => void;
  resetCurrentStats: (gameId: string) => void;
}

const MAX_LEADERBOARD_ENTRIES = 100;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      bestScores: {},
      currentStats: {},
      leaderboard: {},

      saveScore: (gameId, score, playerName) => {
        set((state) => {
          const entry: ScoreEntry = {
            score,
            date: new Date().toISOString(),
            name: playerName,
          };

          const existing = state.leaderboard[gameId] ?? [];
          const updated = [...existing, entry]
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_LEADERBOARD_ENTRIES);

          const currentBest = state.bestScores[gameId] ?? 0;
          const newBest = Math.max(currentBest, score);

          return {
            leaderboard: { ...state.leaderboard, [gameId]: updated },
            bestScores: { ...state.bestScores, [gameId]: newBest },
          };
        });
      },

      getBestScore: (gameId) => {
        return get().bestScores[gameId] ?? 0;
      },

      clearScores: (gameId) => {
        set((state) => {
          const { [gameId]: _lb, ...restLeaderboard } = state.leaderboard;
          const { [gameId]: _best, ...restBest } = state.bestScores;
          return {
            leaderboard: restLeaderboard,
            bestScores: restBest,
          };
        });
      },

      updateCurrentStats: (gameId, stats) => {
        set((state) => {
          const existing = state.currentStats[gameId] ?? {
            score: 0,
            turnsPlayed: 0,
            gameOver: false,
            won: false,
          };
          return {
            currentStats: {
              ...state.currentStats,
              [gameId]: { ...existing, ...stats },
            },
          };
        });
      },

      resetCurrentStats: (gameId) => {
        set((state) => ({
          currentStats: {
            ...state.currentStats,
            [gameId]: {
              score: 0,
              turnsPlayed: 0,
              gameOver: false,
              won: false,
            },
          },
        }));
      },
    }),
    {
      name: 'neondojo-game-store',
    }
  )
);
