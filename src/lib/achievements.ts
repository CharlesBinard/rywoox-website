import type { GameStats } from '@/stores/achievementStore';

export type AchievementId =
  | 'tictactoe_first_win'
  | 'tictactoe_undefeated'
  | 'tictactoe_champion'
  | 'connectfour_first_win'
  | 'connectfour_strategist'
  | 'connectfour_master'
  | 'snake_starter'
  | 'snake_lover'
  | 'snake_god'
  | 'memory_short'
  | 'memory_photographer'
  | 'memory_elephant'
  | 'flappy_first_flight'
  | 'flappy_bird_brain'
  | 'flappy_soaring'
  | 'pong_starter'
  | 'pong_master'
  | 'pong_pro'
  | 'tetris_starter'
  | 'tetris_builder'
  | 'tetris_god'
  | 'numbermerge_2k1'
  | 'numbermerge_4k2'
  | 'numbermerge_8k4'
  | 'minesweeper_first_clear'
  | 'minesweeper_fast_clear'
  | 'minesweeper_veteran'
  | 'breakout_first_clear'
  | 'breakout_brick_hunter'
  | 'breakout_master'
  | 'global_explorer'
  | 'global_hardcore'
  | 'global_complete';

export interface AchievementDefinition {
  id: AchievementId;
  name: string;
  description: string;
  emoji: string;
  gameId: string | 'global';
  condition: (stats: GameStats) => boolean;
}

export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  // TicTacToe
  {
    id: 'tictactoe_first_win',
    name: 'Premier Blood',
    description: 'Gagne ta première partie de Tic Tac Toe',
    emoji: '🩸',
    gameId: 'tictactoe',
    condition: (stats) => stats.wins >= 1,
  },
  {
    id: 'tictactoe_undefeated',
    name: 'Invaincu',
    description: 'Gagne 10 parties de Tic Tac Toe',
    emoji: '🛡️',
    gameId: 'tictactoe',
    condition: (stats) => stats.wins >= 10,
  },
  {
    id: 'tictactoe_champion',
    name: 'Champion',
    description: 'Gagne 50 parties de Tic Tac Toe',
    emoji: '🏆',
    gameId: 'tictactoe',
    condition: (stats) => stats.wins >= 50,
  },

  // ConnectFour
  {
    id: 'connectfour_first_win',
    name: 'Connect4',
    description: 'Gagne ta première partie de Puissance 4',
    emoji: '🎯',
    gameId: 'connectfour',
    condition: (stats) => stats.wins >= 1,
  },
  {
    id: 'connectfour_strategist',
    name: 'Stratège',
    description: 'Gagne 5 parties de Puissance 4',
    emoji: '🧠',
    gameId: 'connectfour',
    condition: (stats) => stats.wins >= 5,
  },
  {
    id: 'connectfour_master',
    name: 'Maître du 4',
    description: 'Gagne 25 parties de Puissance 4',
    emoji: '👑',
    gameId: 'connectfour',
    condition: (stats) => stats.wins >= 25,
  },

  // Snake
  {
    id: 'snake_starter',
    name: 'Snake Starter',
    description: 'Atteins un score de 10 au Snake',
    emoji: '🐍',
    gameId: 'snake',
    condition: (stats) => stats.bestScore >= 10,
  },
  {
    id: 'snake_lover',
    name: 'Snake Lover',
    description: 'Atteins un score de 50 au Snake',
    emoji: '💚',
    gameId: 'snake',
    condition: (stats) => stats.bestScore >= 50,
  },
  {
    id: 'snake_god',
    name: 'Snake God',
    description: 'Atteins un score de 100 au Snake',
    emoji: '🌟',
    gameId: 'snake',
    condition: (stats) => stats.bestScore >= 100,
  },

  // Memory
  {
    id: 'memory_short',
    name: 'Mémoire Courte',
    description: 'Termine une partie de Memory en moins de 60 secondes',
    emoji: '⏱️',
    gameId: 'memory',
    condition: (stats) => stats.bestTime !== undefined && stats.bestTime < 60,
  },
  {
    id: 'memory_photographer',
    name: 'Photographe',
    description: 'Termine une partie de Memory en moins de 30 secondes',
    emoji: '📸',
    gameId: 'memory',
    condition: (stats) => stats.bestTime !== undefined && stats.bestTime < 30,
  },
  {
    id: 'memory_elephant',
    name: "Mémoire d'Éléphant",
    description: 'Termine une partie de Memory en moins de 15 secondes',
    emoji: '🐘',
    gameId: 'memory',
    condition: (stats) => stats.bestTime !== undefined && stats.bestTime < 15,
  },

  // Flappy
  {
    id: 'flappy_first_flight',
    name: 'First Flight',
    description: 'Passe ton premier tuyau en mode "victoire"',
    emoji: '🕊️',
    gameId: 'flappy',
    condition: (stats) => stats.wins >= 1,
  },
  {
    id: 'flappy_bird_brain',
    name: 'Bird Brain',
    description: 'Atteins un score de 10 à Flappy',
    emoji: '🦜',
    gameId: 'flappy',
    condition: (stats) => stats.bestScore >= 10,
  },
  {
    id: 'flappy_soaring',
    name: 'Soaring',
    description: 'Atteins un score de 25 à Flappy',
    emoji: '🚀',
    gameId: 'flappy',
    condition: (stats) => stats.bestScore >= 25,
  },

  // Pong
  {
    id: 'pong_starter',
    name: 'Pong Starter',
    description: 'Gagne ta première partie de Pong',
    emoji: '🏓',
    gameId: 'pong',
    condition: (stats) => stats.wins >= 1,
  },
  {
    id: 'pong_master',
    name: 'Pong Master',
    description: 'Gagne 5 parties de Pong',
    emoji: '⚡',
    gameId: 'pong',
    condition: (stats) => stats.wins >= 5,
  },
  {
    id: 'pong_pro',
    name: 'Ping Pong Pro',
    description: 'Gagne 20 parties de Pong',
    emoji: '🔥',
    gameId: 'pong',
    condition: (stats) => stats.wins >= 20,
  },

  // Tetris
  {
    id: 'tetris_starter',
    name: 'Tetromino',
    description: 'Atteins un score de 100 à Tetris',
    emoji: '🧱',
    gameId: 'tetris',
    condition: (stats) => stats.bestScore >= 100,
  },
  {
    id: 'tetris_builder',
    name: 'Blocs Builder',
    description: 'Atteins un score de 500 à Tetris',
    emoji: '🏗️',
    gameId: 'tetris',
    condition: (stats) => stats.bestScore >= 500,
  },
  {
    id: 'tetris_god',
    name: 'Tetris God',
    description: 'Atteins un score de 2000 à Tetris',
    emoji: '⚡',
    gameId: 'tetris',
    condition: (stats) => stats.bestScore >= 2000,
  },

  // NumberMerge (2048)
  {
    id: 'numbermerge_2k1',
    name: '2k1',
    description: 'Atteins la tuile 2048',
    emoji: '✨',
    gameId: 'numbermerge',
    condition: (stats) => stats.highestTile !== undefined && stats.highestTile >= 2048,
  },
  {
    id: 'numbermerge_4k2',
    name: '4k2',
    description: 'Atteins la tuile 4096',
    emoji: '💎',
    gameId: 'numbermerge',
    condition: (stats) => stats.highestTile !== undefined && stats.highestTile >= 4096,
  },
  {
    id: 'numbermerge_8k4',
    name: '8k4',
    description: 'Atteins la tuile 8192',
    emoji: '👑',
    gameId: 'numbermerge',
    condition: (stats) => stats.highestTile !== undefined && stats.highestTile >= 8192,
  },

  // Minesweeper
  {
    id: 'minesweeper_first_clear',
    name: 'Démineur',
    description: 'Termine une grille de Minesweeper',
    emoji: '💣',
    gameId: 'minesweeper',
    condition: (stats) => stats.wins >= 1,
  },
  {
    id: 'minesweeper_fast_clear',
    name: 'Sang-Froid',
    description: 'Termine une grille de Minesweeper en moins de 90 secondes',
    emoji: '⏱️',
    gameId: 'minesweeper',
    condition: (stats) => stats.bestTime !== undefined && stats.bestTime < 90,
  },
  {
    id: 'minesweeper_veteran',
    name: 'Vétéran',
    description: 'Termine 10 parties de Minesweeper',
    emoji: '🧨',
    gameId: 'minesweeper',
    condition: (stats) => stats.gamesPlayed >= 10,
  },

  // Breakout
  {
    id: 'breakout_first_clear',
    name: 'Casse-Briques',
    description: 'Gagne une partie de Breakout',
    emoji: '🧱',
    gameId: 'breakout',
    condition: (stats) => stats.wins >= 1,
  },
  {
    id: 'breakout_brick_hunter',
    name: 'Brick Hunter',
    description: 'Atteins un score de 1000 à Breakout',
    emoji: '🎯',
    gameId: 'breakout',
    condition: (stats) => stats.bestScore >= 1000,
  },
  {
    id: 'breakout_master',
    name: 'Mur Tombé',
    description: 'Atteins un score de 2000 à Breakout',
    emoji: '🏆',
    gameId: 'breakout',
    condition: (stats) => stats.bestScore >= 2000,
  },

  // Global
  {
    id: 'global_explorer',
    name: 'Explorateur',
    description: 'Joue à tous les jeux au moins une fois',
    emoji: '🧭',
    gameId: 'global',
    condition: (_stats) => false, // Special handling in store
  },
  {
    id: 'global_hardcore',
    name: 'Joueur Acharné',
    description: 'Joue 10 parties au total',
    emoji: '🎮',
    gameId: 'global',
    condition: (stats) => stats.totalGames >= 10,
  },
  {
    id: 'global_complete',
    name: '100% Neon',
    description: 'Débloque tous les achievements',
    emoji: '💯',
    gameId: 'global',
    condition: (_stats) => false, // Special handling in store
  },
];

export const ACHIEVEMENTS_BY_GAME: Record<string, AchievementDefinition[]> = {};
export const GLOBAL_ACHIEVEMENTS: AchievementDefinition[] = [];

for (const ach of ALL_ACHIEVEMENTS) {
  if (ach.gameId === 'global') {
    GLOBAL_ACHIEVEMENTS.push(ach);
  } else {
    if (!ACHIEVEMENTS_BY_GAME[ach.gameId]) {
      ACHIEVEMENTS_BY_GAME[ach.gameId] = [];
    }
    ACHIEVEMENTS_BY_GAME[ach.gameId].push(ach);
  }
}

export const GAME_NAMES: Record<string, string> = {
  tictactoe: 'Tic Tac Toe',
  connectfour: 'Puissance 4',
  snake: 'Snake',
  memory: 'Memory',
  flappy: 'Flappy',
  pong: 'Pong',
  tetris: 'Tetris',
  numbermerge: '2048',
  minesweeper: 'Minesweeper',
  breakout: 'Breakout',
  global: 'Global',
};
