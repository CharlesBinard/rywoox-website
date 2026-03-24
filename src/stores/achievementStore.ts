import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GAMES } from '@/data/games';
import {
  ACHIEVEMENTS_BY_GAME,
  type AchievementId,
  ALL_ACHIEVEMENTS,
  GLOBAL_ACHIEVEMENTS,
} from '@/lib/achievements';

export interface GameStats {
  wins: number;
  bestScore: number;
  gamesPlayed: number;
  bestTime?: number; // For memory
  highestTile?: number; // For 2048
  totalGames: number;
  gamesPlayedSet: string[];
}

interface AchievementStore {
  // Map of achievementId -> timestamp when unlocked
  unlockedAt: Record<AchievementId, number>;

  // Per-game stats
  gameStats: Record<string, GameStats>;

  // Notification queue
  pendingNotifications: AchievementId[];

  // Actions
  checkAchievements: (gameId: string, stats: Partial<GameStats>) => AchievementId[];
  getUnlocked: () => AchievementId[];
  getLocked: () => AchievementId[];
  getByGame: (gameId: string) => AchievementId[];
  getUnlockedByGame: (gameId: string) => AchievementId[];
  getGameStats: (gameId: string) => GameStats;
  dismissNotification: (id: AchievementId) => void;
  getTotalGamesPlayed: () => number;
  getUniqueGamesPlayed: () => string[];
}

const ALL_GAME_IDS: string[] = GAMES.map((g) => g.id);

const makeEmptyGameStats = (): GameStats => ({
  wins: 0,
  bestScore: 0,
  gamesPlayed: 0,
  gamesPlayedSet: [],
  totalGames: 0,
});

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlockedAt: {} as Record<AchievementId, number>,
      gameStats: Object.fromEntries(ALL_GAME_IDS.map((id) => [id, makeEmptyGameStats()])),
      pendingNotifications: [],

      getTotalGamesPlayed: () => {
        const { gameStats } = get();
        return ALL_GAME_IDS.reduce((sum, id) => sum + (gameStats[id]?.gamesPlayed ?? 0), 0);
      },

      getUniqueGamesPlayed: () => {
        const { gameStats } = get();
        const unique = new Set<string>();
        for (const id of ALL_GAME_IDS) {
          const stats = gameStats[id];
          if (stats && stats.gamesPlayed > 0) {
            unique.add(id);
          }
        }
        return Array.from(unique);
      },

      getGameStats: (gameId: string) => {
        const { gameStats } = get();
        return gameStats[gameId] ?? makeEmptyGameStats();
      },

      getUnlocked: () => {
        const { unlockedAt } = get();
        return Object.keys(unlockedAt) as AchievementId[];
      },

      getLocked: () => {
        const { unlockedAt } = get();
        return ALL_ACHIEVEMENTS.filter((a) => !unlockedAt[a.id]).map((a) => a.id);
      },

      getByGame: (gameId: string) => {
        return (ACHIEVEMENTS_BY_GAME[gameId] ?? []).map((a) => a.id);
      },

      getUnlockedByGame: (gameId: string) => {
        const { unlockedAt } = get();
        return (ACHIEVEMENTS_BY_GAME[gameId] ?? [])
          .filter((a) => unlockedAt[a.id])
          .map((a) => a.id);
      },

      checkAchievements: (gameId: string, stats: Partial<GameStats>): AchievementId[] => {
        const { gameStats, unlockedAt } = get();

        // Update game stats
        const prevStats = gameStats[gameId] ?? makeEmptyGameStats();
        const updatedStats: GameStats = {
          wins: prevStats.wins + (stats.wins ?? 0),
          bestScore: Math.max(prevStats.bestScore, stats.bestScore ?? prevStats.bestScore),
          gamesPlayed: prevStats.gamesPlayed + (stats.gamesPlayed ?? 0),
          bestTime:
            stats.bestTime !== undefined
              ? stats.bestTime < (prevStats.bestTime ?? Infinity)
                ? stats.bestTime
                : prevStats.bestTime
              : prevStats.bestTime,
          highestTile:
            stats.highestTile !== undefined
              ? Math.max(prevStats.highestTile ?? 0, stats.highestTile)
              : prevStats.highestTile,
          gamesPlayedSet: prevStats.gamesPlayedSet,
          totalGames: prevStats.totalGames,
        };

        // Track unique games played
        if (!updatedStats.gamesPlayedSet.includes(gameId)) {
          updatedStats.gamesPlayedSet = [...updatedStats.gamesPlayedSet, gameId];
        }

        // Calculate total games played across all games
        const totalGames = Object.values({ ...gameStats, [gameId]: updatedStats }).reduce(
          (sum, s) => sum + (s?.gamesPlayed ?? 0),
          0
        );
        updatedStats.totalGames = totalGames;

        // Compute global stats
        const uniqueGames = ALL_GAME_IDS.filter((id) =>
          id === gameId ? updatedStats.gamesPlayed > 0 : (gameStats[id]?.gamesPlayed ?? 0) > 0
        );
        const globalStats: GameStats = {
          wins: 0,
          bestScore: 0,
          gamesPlayed: 0,
          totalGames,
          gamesPlayedSet: uniqueGames,
        };

        const newUnlocked: AchievementId[] = [];
        const newUnlockedAt = { ...unlockedAt };

        // Check game-specific achievements
        const gameAchievements = ACHIEVEMENTS_BY_GAME[gameId] ?? [];
        for (const ach of gameAchievements) {
          if (!newUnlockedAt[ach.id] && ach.condition(updatedStats)) {
            newUnlockedAt[ach.id] = Date.now();
            newUnlocked.push(ach.id);
          }
        }

        // Check global achievements
        for (const ach of GLOBAL_ACHIEVEMENTS) {
          if (newUnlockedAt[ach.id]) continue;

          let unlocked = false;
          if (ach.id === 'global_explorer') {
            // All game IDs must have been played at least once
            unlocked = ALL_GAME_IDS.every((id) =>
              id === gameId ? updatedStats.gamesPlayed > 0 : (gameStats[id]?.gamesPlayed ?? 0) > 0
            );
          } else if (ach.id === 'global_hardcore') {
            unlocked = globalStats.totalGames >= 10;
          } else if (ach.id === 'global_complete') {
            // All achievements except global_complete itself must be unlocked
            const gameAchs = ALL_ACHIEVEMENTS.filter((a) => a.gameId !== 'global');
            const otherGlobalAchs = ALL_ACHIEVEMENTS.filter(
              (a) => a.gameId === 'global' && a.id !== 'global_complete'
            );
            unlocked =
              gameAchs.every((a) => newUnlockedAt[a.id]) &&
              otherGlobalAchs.every((a) => newUnlockedAt[a.id]);
          }

          if (unlocked) {
            newUnlockedAt[ach.id] = Date.now();
            newUnlocked.push(ach.id);
          }
        }

        // Update state
        set({
          gameStats: { ...gameStats, [gameId]: updatedStats },
          unlockedAt: newUnlockedAt,
          pendingNotifications: [...get().pendingNotifications, ...newUnlocked],
        });

        return newUnlocked;
      },

      dismissNotification: (id: AchievementId) => {
        set({
          pendingNotifications: get().pendingNotifications.filter((n) => n !== id),
        });
      },
    }),
    {
      name: 'neondojo-achievement-store',
      partialize: (state) => ({
        unlockedAt: state.unlockedAt,
        gameStats: state.gameStats,
      }),
    }
  )
);
