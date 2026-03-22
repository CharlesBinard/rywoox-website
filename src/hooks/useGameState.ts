import { useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';

export interface GameStateOptions {
  gameId: string;
  onGameOver?: (won: boolean) => void;
}

export interface GameStateReturn {
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
  turnsPlayed: number;
  saveScore: (score: number) => void;
  updateScore: (score: number) => void;
  setGameOver: (won: boolean) => void;
  resetGame: () => void;
}

/**
 * Shared hook for common game state management.
 */
export const useGameState = (options: GameStateOptions): GameStateReturn => {
  const { gameId } = options;

  const bestScore = useGameStore((s) => s.getBestScore(gameId));
  const currentStats = useGameStore((s) => s.currentStats[gameId]);
  const saveScoreAction = useGameStore((s) => s.saveScore);
  const updateCurrentStats = useGameStore((s) => s.updateCurrentStats);
  const resetCurrentStats = useGameStore((s) => s.resetCurrentStats);

  const score = currentStats?.score ?? 0;
  const gameOver = currentStats?.gameOver ?? false;
  const won = currentStats?.won ?? false;
  const turnsPlayed = currentStats?.turnsPlayed ?? 0;

  const saveScore = useCallback(
    (finalScore: number) => {
      saveScoreAction(gameId, finalScore);
    },
    [gameId, saveScoreAction]
  );

  const updateScore = useCallback(
    (newScore: number) => {
      updateCurrentStats(gameId, { score: newScore });
    },
    [gameId, updateCurrentStats]
  );

  const setGameOver = useCallback(
    (isWon: boolean) => {
      updateCurrentStats(gameId, { gameOver: true, won: isWon });
    },
    [gameId, updateCurrentStats]
  );

  const resetGame = useCallback(() => {
    resetCurrentStats(gameId);
  }, [gameId, resetCurrentStats]);

  return {
    score,
    bestScore,
    gameOver,
    won,
    turnsPlayed,
    saveScore,
    updateScore,
    setGameOver,
    resetGame,
  };
};
